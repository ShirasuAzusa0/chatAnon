package ben.chatanon.controller;

import ben.chatanon.entity.dto.ChatMessageDto;
import ben.chatanon.entity.dto.EditSessionDto;
import ben.chatanon.entity.dto.NewSessionDto;
import ben.chatanon.entity.vo.*;
import ben.chatanon.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    // 发送信息
    @PostMapping(value = "/sendMessage/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sendMessageMode1(@RequestBody ChatMessageDto dto) {
            return chatService.sendMessageStream(dto);
    }

    @PostMapping("/sendMessage/once")
    public ResponseEntity<?> sendMessageMode2(@RequestBody ChatMessageDto dto) {
        Map<String, Object> result = chatService.sendMessageOnce(dto);
        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "msg", "发送成功",
                        "data", result
                )
        );
    }

    // 获取Live2D文件（有新的方案，暂时废弃）
    @GetMapping("/l2d")
    public ResponseEntity<?> getLive2D(@RequestParam String emotion) {
        Live2dVO vo = chatService.getL2D(emotion);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "获取Live2D文件成功",
                "data", vo
        ));
    }

    // 获取所有可选的大模型
    @GetMapping("/model/list")
    public ResponseEntity<?> getModelList() {
        List<ModelListElementVO> vos = chatService.getModels();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "获取模型列表成功",
                "data", vos
        ));
    }

    // 获取当前用户指定会话下的所有消息
    @GetMapping("/session/{sessionId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable int sessionId) {
        List<MessageListElementVO> vos = chatService.getMessageList(sessionId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "获取当前用户指定会话下的所有信息成功",
                "data", vos
        ));
    }

    // 获取当前用户的所有聊天会话
    @GetMapping("/session/list")
    public ResponseEntity<?> getSessionList(@RequestParam int userId) {
        List<SessionListElementVO> vos = chatService.getSessionList(userId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "获取当前用户的所有聊天会话成功",
                "data", vos
        ));
    }

    // 创建新的聊天会话
    @PostMapping("/session/create")
    public ResponseEntity<?> newSession(@RequestBody NewSessionDto dto) {
        NewSessionVO vo = chatService.createNewSession(dto);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "创建新的聊天会话成功",
                "data", vo
        ));
    }

    // 删除聊天会话
    @DeleteMapping("/session/delete")
    public ResponseEntity<?> deleteSession(@RequestParam int sessionId) {
        chatService.deleteSession(sessionId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "删除聊天会话成功",
                "sessionId", sessionId
        ));
    }

    // 修改聊天会话
    @PutMapping("/session/update")
    public ResponseEntity<?> updateSession(@RequestBody EditSessionDto dto) {
        chatService.editSession(dto);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "修改聊天会话成功",
                "sessionId", dto.getSessionId()
        ));
    }

    // 清空会话历史
    @DeleteMapping("/message/clear/{sessionId}")
    public ResponseEntity<?> deleteAllMessage(@PathVariable int sessionId) {
        chatService.clearAllMessages(sessionId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "清空会话历史成功",
                "sessionId", sessionId
        ));
    }

    // 删除单条消息
    @DeleteMapping("/message/delete/{messageId}")
    public ResponseEntity<?> deleteOneMessage(@PathVariable int messageId) {
        chatService.deleteOneMessage(messageId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "msg", "删除单条信息成功",
                "messageId", messageId
        ));
    }
}
