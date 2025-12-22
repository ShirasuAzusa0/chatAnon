package ben.chatanon.service;

import ben.chatanon.entity.dto.ChatMessageDto;
import ben.chatanon.entity.dto.EditSessionDto;
import ben.chatanon.entity.dto.NewSessionDto;
import ben.chatanon.entity.entity_chat.*;
import ben.chatanon.entity.vo.*;
import ben.chatanon.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import okio.BufferedSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {
    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private ModelRepository modelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RoleCategoriesRepository roleCategoriesRepository;

    @Autowired
    private L2DModelRepository l2DModelRepository;

    @Autowired
    private L2DActionRepository l2DActionRepository;

    // HTTP client & mapper
    private final OkHttpClient okHttpClient = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    // 获取情感数据
    private String detectEmotion(List<Map<String, String>> context, Models model, int live2dId) throws Exception {
        // 获取聊天记录（去除最初的角色扮演系统提示词）
        // 移除所有 system，只保留 user / assistant
        List<Map<String, String>> cleanText = context.stream()
                .filter(m -> !"system".equals(m.get("role")))
                .toList();

        // 构造情感判断请求
        Map<String, Object> req = new HashMap<>();
        req.put("model", model.getModelVersion());
        req.put("messages", List.of(
                // 新的情感判断 system prompt（来自 Live2D）
                Map.of(
                        "role", "system",
                        "content", l2DModelRepository.findPromptById(live2dId)
                ),
                // 把上下文整体作为 user 内容传入
                Map.of(
                        "role", "user",
                        "content", mapper.writeValueAsString(cleanText)
                )
        ));
        req.put("max_tokens", 100);
        req.put("stream", false);
        req.put("temperature", 0);

        Request request = new Request.Builder()
                .url(model.getApiURL())
                .addHeader("Authorization", "Bearer " + model.getApiKey())
                .post(RequestBody.create(
                        mapper.writeValueAsString(req),
                        MediaType.parse("application/json")
                ))
                .build();

        // 同步请求情感判断
        try (Response response = okHttpClient.newCall(request).execute()) {

            if (!response.isSuccessful() || response.body() == null) {
                return "default";
            }

            String body = response.body().string();

            // 解析模型返回
            String content = mapper.readTree(body)
                    .path("choices").get(0)
                    .path("message")
                    .path("content")
                    .asText()
                    .trim();

            // 兜底处理（极其重要）
            if (content.isEmpty()) {
                return "default";
            }

            // 只取第一行，防止模型多说废话
            int newlineIndex = content.indexOf('\n');
            if (newlineIndex != -1) {
                content = content.substring(0, newlineIndex).trim();
            }

            return content;
        }
    }

    // 流式聊天
    public SseEmitter sendMessageStream(ChatMessageDto dto) {
        // 暂设置为永不超时
        SseEmitter emitter = new SseEmitter(0L);

        // 查 model
        Models model = modelRepository.findByModelId(
                sessionRepository.getSessionsBySessionId(dto.getSessionId())
                        .getModel().getModelId()
        );
        if (model == null) {
            emitter.completeWithError(new RuntimeException("模型不存在"));
            return emitter;
        }

        // 查 session
        Sessions session = sessionRepository.getSessionsBySessionId(dto.getSessionId());
        if (session == null) {
            emitter.completeWithError(new RuntimeException("会话不存在"));
            return emitter;
        }

        // 查 role（拿角色对应的提示词）
        String systemPrompt = session.getRole().getPrompt();

        // 查 roleCategory（拿角色故事背景的提示词）
        List<String> backgroundPrompts = roleCategoriesRepository.findBackTagNamesByRoleId(session.getRole().getRoleId());

        // 保存用户消息到 messages 表，role = user
        Messages userMsg = new Messages();
        userMsg.setSession(session);
        userMsg.setContent(dto.getMessage());
        userMsg.setCreatedAt(LocalDateTime.now());
        userMsg.setRole(roleType.user);
        userMsg.setEmotion(null);
        // 用 save 要比 saveAndFlush 要高效些
        messageRepository.save(userMsg);

        // 构造 messages 上下文
        List<Map<String, String>> chatMessages = new ArrayList<>();

        // 加入最初的提示词 system prompt（role & roleCategory）
        if (backgroundPrompts != null && !backgroundPrompts.isEmpty()) {
            for (String backgroundPrompt : backgroundPrompts) {
                chatMessages.add(Map.of(
                        "role", "system",
                        "content", backgroundPrompt
                ));
            }
        }

        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            chatMessages.add(Map.of(
                    "role", "system",
                    "content", systemPrompt
            ));
        }

        // 循环构建历史消息列表
        List<Messages> history =
                messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getSessionId());

        for (Messages m : history) {
            chatMessages.add(Map.of(
                    "role", m.getRole().name(),
                    "content", m.getContent()
            ));
        }

        // 获取情感判断
        String emotion = "";
        int l2dId = l2DModelRepository.findByRoleId(session.getRole().getRoleId()).getLive2dId();
        try {
            emotion = detectEmotion(chatMessages, model, l2dId);
        } catch (Exception ignored) {}

        // 第一时间先把情感判断返回
        if (emotion != null) {
            try {
                String emotionJson =
                        "{\"emotion\":\"" + emotion + "\"}";

                emitter.send(
                        SseEmitter.event()
                                .name("emotion")
                                .data(emotionJson)
                );
            } catch (IOException e) {
                emitter.completeWithError(e);
                return emitter;
            }
        }

        // 构建模型请求体
        Map<String, Object> req = new HashMap<>();
        req.put("model", model.getModelVersion());
        req.put("messages", chatMessages);
        req.put("max_tokens", model.getMaxTokens());
        req.put("stream", true);

        Request request;
        try {
            String body = mapper.writeValueAsString(req);
            request = new Request.Builder()
                    .url(model.getApiURL())
                    .addHeader("Authorization", "Bearer " + model.getApiKey())
                    .post(RequestBody.create(
                            body, MediaType.parse("application/json")))
                    .build();
        } catch (Exception e) {
            emitter.completeWithError(e);
            return emitter;
        }

        StringBuilder assistantBuffer = new StringBuilder();

        // 火山 DeepSeek 不是标准 SSE，不能用 EventSource
        // 必须使用 OkHttp 普通流式读取
        // 使用 OkHttp 普通 Async 回调 + 逐行解析 data:
        String finalEmotion = emotion;
        okHttpClient.newCall(request).enqueue(new Callback() {

            @Override
            public void onFailure(Call call, IOException e) {
                emitter.completeWithError(e);
            }

            @Override
            public void onResponse(Call call, Response response) {
                try (BufferedSource source = response.body().source()) {

                    // SSE 必须有 text/event-stream，官方应当是这样
                    while (!source.exhausted()) {
                        String line = source.readUtf8Line();

                        // SSE data 行
                        if (line != null && line.startsWith("data:")) {
                            String data = line.substring(5).trim();

                            // 如果是完成标识
                            if ("[DONE]".equals(data)) {
                                // assistant 完整回答入库
                                Messages assistantMsg = new Messages();
                                assistantMsg.setSession(session);
                                assistantMsg.setRole(roleType.assistant);
                                assistantMsg.setContent(assistantBuffer.toString());
                                assistantMsg.setCreatedAt(LocalDateTime.now());
                                assistantMsg.setEmotion(finalEmotion);
                                messageRepository.saveAndFlush(assistantMsg);

                                emitter.send("[DONE]");
                                emitter.complete();
                                break;
                            }

                            // 推送 SSE chunk
                            emitter.send(data);
                            System.out.println("SSE send: " + data);

                            JsonNode root = mapper.readTree(data);
                            JsonNode delta =
                                    root.path("choices").get(0)
                                            .path("delta").path("content");
                            if (!delta.isMissingNode()) {
                                assistantBuffer.append(delta.asText());
                            }
                        }
                    }
                } catch (Exception e) {
                    emitter.completeWithError(e);
                }
            }
        });

        return emitter;
    }

    // 非流式聊天
    public Map<String, Object> sendMessageOnce(ChatMessageDto dto) {
        Sessions session = sessionRepository.getSessionsBySessionId(dto.getSessionId());
        if (session == null) {
            throw new RuntimeException("会话不存在");
        }

        Models model = session.getModel();
        String systemPrompt = session.getRole().getPrompt();

        // 保存 user 消息
        Messages userMsg = new Messages();
        userMsg.setSession(session);
        userMsg.setRole(roleType.user);
        userMsg.setContent(dto.getMessage());
        userMsg.setCreatedAt(LocalDateTime.now());
        messageRepository.save(userMsg);

        // 构建上下文
        List<Map<String, String>> chatMessages = new ArrayList<>();

        // system
        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            chatMessages.add(Map.of(
                    "role", "system",
                    "content", systemPrompt
            ));
        }

        // history (user & assistant)
        List<Messages> history =
                messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getSessionId());

        for (Messages m : history) {
            chatMessages.add(Map.of(
                    "role", m.getRole().name(),
                    "content", m.getContent()
            ));
        }

        Map<String, Object> req = new HashMap<>();
        req.put("model", model.getModelVersion());
        req.put("messages", chatMessages);
        req.put("max_tokens", model.getMaxTokens());
        req.put("stream", false);

        try {
            Request request = new Request.Builder()
                    .url(model.getApiURL())
                    .addHeader("Authorization", "Bearer " + model.getApiKey())
                    .post(RequestBody.create(
                            mapper.writeValueAsString(req),
                            MediaType.parse("application/json")))
                    .build();

            try (Response response =
                         okHttpClient.newCall(request).execute()) {

                if (!response.isSuccessful()) {
                    throw new RuntimeException(
                            "模型调用失败：" + response.body().string()
                    );
                }

                String body = response.body().string();
                JsonNode root = mapper.readTree(body);

                // 解析返回
                String content = root
                        .path("choices")
                        .get(0)
                        .path("message")
                        .path("content")
                        .asText();

                // assistant 回答写入数据库
                Messages assistantMsg = new Messages();
                assistantMsg.setSession(session);
                assistantMsg.setRole(roleType.assistant);
                assistantMsg.setContent(content);
                assistantMsg.setCreatedAt(LocalDateTime.now());
                messageRepository.save(assistantMsg);

                // 返回数据
                return Map.of(
                        "content", content
                );
            }

        } catch (Exception e) {
            throw new RuntimeException("非流式调用失败", e);
        }
    }

    // 获取 Live2D 文件
    public Live2dVO getL2D(String emotion) {
        L2DAction l2da = l2DActionRepository.findByEmotion(emotion);
        return new Live2dVO(
                l2da.getLive2d().getLive2dId(),
                l2da.getLive2d().getLive2dName(),
                new Live2dVO.ExpressionVO(
                        emotion,
                        l2da.getExpressionPath()
                ),
                new Live2dVO.MotionVO(
                        emotion,
                        l2da.getMotionPath()
                )
        );
    }

    // 获取模型列表
    public List<ModelListElementVO> getModels() {
        List<Models> modelList = modelRepository.findAll();
        return modelList.stream()
                .map(m -> new ModelListElementVO(
                        m.getModelId(),
                        m.getModelName(),
                        m.getModelVersion()
                ))
                .toList();
    }

    // 获取全部消息
    public List<MessageListElementVO> getMessageList(int sessionId) {
        List<Messages> messageList = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        return messageList.stream()
                .map(msg -> new MessageListElementVO(
                        msg.getMessageId(),
                        msg.getContent(),
                        msg.getRole().name(),
                        msg.getCreatedAt()
                ))
                .toList();
    }

    // 获取会话列表
    public List<SessionListElementVO> getSessionList(int userId) {
        List<Sessions> sessionList = sessionRepository.findAllByUserId(userId);
        return sessionList.stream()
                .map(s -> new SessionListElementVO(
                        s.getSessionId(),
                        s.getSessionName(),
                        s.getRole().getRoleId(),
                        s.getRole().getRoleName(),
                        s.getModel().getModelName(),
                        s.getCreatedAt(),
                        s.getLastUpdatedAt()
                ))
                .toList();
    }

    // 创建新会话
    public NewSessionVO createNewSession(NewSessionDto dto) {
        Sessions session = new Sessions();
        session.setUser(userRepository.findByUserId(dto.getUserId()));
        session.setSessionName("和"+roleRepository.findByRoleId(dto.getRoleId()).getRoleName()+"的聊天"+"_id_"+dto.getRoleId());
        session.setCreatedAt(LocalDateTime.now());
        session.setLastUpdatedAt(LocalDateTime.now());
        session.setRole(roleRepository.findByRoleId(dto.getRoleId()));
        session.setModel(modelRepository.findByModelName(dto.getModelName()));
        sessionRepository.save(session);

        return new NewSessionVO(
                session.getSessionId(),
                dto.getUserId(),
                session.getSessionName(),
                session.getRole().getRoleId(),
                session.getRole().getRoleName(),
                dto.getModelName(),
                session.getCreatedAt()
        );
    }

    // 删除会话
    public void deleteSession(int sessionId) {
        sessionRepository.deleteById(sessionId);
    }

    // 修改会话
    public void editSession(EditSessionDto dto) {
        Sessions session = sessionRepository.getSessionsBySessionId(dto.getSessionId());
        if (StringUtils.hasText(dto.getSessionName())) session.setSessionName(dto.getSessionName());
        if (StringUtils.hasText(dto.getModelName())) session.setModel(modelRepository.findByModelName(dto.getModelName()));
        session.setLastUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }

    // 清空消息
    @Transactional
    public void clearAllMessages(int sessionId) {
        messageRepository.deleteBySession(sessionRepository.getSessionsBySessionId(sessionId));
    }

    // 删除单调消息
    public void deleteOneMessage(int messageId) {
        messageRepository.deleteById(messageId);
    }
}
