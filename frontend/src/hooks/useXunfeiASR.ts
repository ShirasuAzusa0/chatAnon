import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

// 讯飞实时语音转写配置
const XUNFEI_APPID = import.meta.env.VITE_XUNFEI_APPID;
const XUNFEI_API_KEY = import.meta.env.VITE_XUNFEI_API_KEY;

// WebSocket URL
const RTASR_URL = 'wss://rtasr.xfyun.cn/v1/ws';

// 音频配置：采样率16K，16bit，单声道
const SAMPLE_RATE = 16000;
const BUFFER_SIZE = 1280; // 每40ms发送1280字节

interface UseXunfeiASROptions {
  lang?: string; // 语种：cn(中文), en(英文)
  pd?: string; // 垂直领域
}

interface UseXunfeiASRReturn {
  isRecording: boolean;
  text: string;
  interimText: string;
  startRecording: (shouldResetText?: boolean) => Promise<void>;
  stopRecording: () => void;
  resetText: () => void;
}

interface XunfeiResult {
  action: string;
  code: string;
  data: string;
  desc: string;
  sid: string;
}

interface XunfeiDataResult {
  cn?: {
    st?: {
      bg: string;
      ed: string;
      rt: Array<{
        ws: Array<{
          cw: Array<{
            w: string;
            wp: string;
          }>;
        }>;
      }>;
      type: string; // 0: 最终结果, 1: 中间结果
    };
  };
  seg_id: number;
}

/**
 * 生成讯飞实时语音转写的签名
 */
function generateSigna(appId: string, apiKey: string, ts: number): string {
  // 1. 生成 baseString = appid + ts
  const baseString = appId + ts;

  // 2. 对 baseString 进行 MD5
  const md5Result = CryptoJS.MD5(baseString).toString();

  // 3. 使用 apiKey 对 MD5 结果进行 HmacSHA1，然后 base64 编码
  const hmacSha1 = CryptoJS.HmacSHA1(md5Result, apiKey);
  const signa = CryptoJS.enc.Base64.stringify(hmacSha1);

  return signa;
}

/**
 * 构建 WebSocket URL
 */
function buildWebSocketUrl(options: UseXunfeiASROptions = {}): string {
  const ts = Math.floor(Date.now() / 1000);
  const signa = generateSigna(XUNFEI_APPID, XUNFEI_API_KEY, ts);

  const params = new URLSearchParams({
    appid: XUNFEI_APPID,
    ts: ts.toString(),
    signa: signa,
  });

  // 可选参数
  if (options.lang) {
    params.append('lang', options.lang);
  }
  if (options.pd) {
    params.append('pd', options.pd);
  }

  return `${RTASR_URL}?${params.toString()}`;
}

/**
 * 从讯飞返回的 data 中提取文字
 */
function extractTextFromData(dataStr: string): { text: string; isFinal: boolean } {
  try {
    const data: XunfeiDataResult = JSON.parse(dataStr);
    const st = data.cn?.st;
    if (!st) return { text: '', isFinal: false };

    const isFinal = st.type === '0';
    let text = '';

    // 遍历所有识别结果
    st.rt?.forEach((rt) => {
      rt.ws?.forEach((ws) => {
        ws.cw?.forEach((cw) => {
          // wp: n-普通词, s-顺滑词(语气词), p-标点
          text += cw.w;
        });
      });
    });

    return { text, isFinal };
  } catch (e) {
    console.error('解析讯飞返回数据失败:', e);
    return { text: '', isFinal: false };
  }
}

/**
 * 讯飞实时语音转写 Hook
 */
export function useXunfeiASR(options: UseXunfeiASROptions = {}): UseXunfeiASRReturn {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioBufferRef = useRef<Int16Array[]>([]);

  // 当前句子的文本（用于追踪中间结果）
  const currentSegmentTextRef = useRef<Map<number, string>>(new Map());

  // 停止录音
  const stopRecording = useCallback(() => {
    // 发送结束标识
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ end: true }));
        console.log('已发送结束标识');
      } catch (e) {
        console.error('发送结束标识失败:', e);
      }
    }

    // 停止定时发送
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
      sendIntervalRef.current = null;
    }

    // 停止音频处理
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // 关闭音频上下文
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    // 释放麦克风资源
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      console.log('麦克风资源已释放');
    }

    // 关闭 WebSocket 连接
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // 清空音频缓冲
    audioBufferRef.current = [];

    setIsRecording(false);
    setInterimText('');
  }, []);

  // 开始录音
  const startRecording = useCallback(
    async (shouldResetText = true) => {
      // 检查配置
      if (!XUNFEI_APPID || !XUNFEI_API_KEY) {
        toast.error('讯飞语音识别配置缺失，请检查 .env 文件');
        console.error('缺少 VITE_XUNFEI_APPID 或 VITE_XUNFEI_API_KEY');
        return;
      }

      try {
        // 如果需要重置文本
        if (shouldResetText) {
          setText('');
          setInterimText('');
          currentSegmentTextRef.current.clear();
        }

        // 请求麦克风权限
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              sampleRate: SAMPLE_RATE,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          mediaStreamRef.current = stream;
        } catch {
          toast.error('无法访问麦克风，请检查浏览器权限设置');
          return;
        }

        // 创建 WebSocket 连接
        const wsUrl = buildWebSocketUrl(options);
        console.log('正在连接讯飞实时语音转写服务...');

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket 连接已建立');
          toast.info('开始语音识别，请说话...', {
            duration: 2000,
            id: 'xunfei-asr-status',
          });
        };

        ws.onmessage = (event) => {
          try {
            const result: XunfeiResult = JSON.parse(event.data);

            if (result.action === 'started') {
              console.log('讯飞语音转写服务已启动, sid:', result.sid);
              setIsRecording(true);
            } else if (result.action === 'result') {
              const { text: recognizedText, isFinal } = extractTextFromData(result.data);

              if (recognizedText) {
                // 解析 seg_id
                const dataObj: XunfeiDataResult = JSON.parse(result.data);
                const segId = dataObj.seg_id;

                if (isFinal) {
                  // 最终结果：将该段文本添加到最终文本中
                  currentSegmentTextRef.current.set(segId, recognizedText);

                  // 按 seg_id 顺序拼接所有最终结果
                  const sortedSegIds = Array.from(currentSegmentTextRef.current.keys()).sort(
                    (a, b) => a - b
                  );
                  const fullText = sortedSegIds
                    .map((id) => currentSegmentTextRef.current.get(id))
                    .join('');

                  setText(fullText);
                  setInterimText('');
                } else {
                  // 中间结果：显示为临时文本
                  setInterimText(recognizedText);
                }
              }
            } else if (result.action === 'error') {
              console.error('讯飞语音转写错误:', result.code, result.desc);
              toast.error(`语音识别错误: ${result.desc}`);
              stopRecording();
            }
          } catch (e) {
            console.error('解析 WebSocket 消息失败:', e);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket 错误:', error);
          toast.error('语音识别连接错误');
          stopRecording();
        };

        ws.onclose = (event) => {
          console.log('WebSocket 连接已关闭:', event.code, event.reason);
          if (isRecording) {
            setIsRecording(false);
            toast.info('语音识别已结束', {
              id: 'xunfei-asr-status',
            });
          }
        };

        // 创建音频处理
        const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);

        // 使用 ScriptProcessorNode 处理音频数据
        // 注意：ScriptProcessorNode 已被标记为废弃，但 AudioWorklet 在某些场景下兼容性较差
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (!isRecording && wsRef.current?.readyState !== WebSocket.OPEN) return;

          const inputData = e.inputBuffer.getChannelData(0);

          // 将 Float32 音频数据转换为 Int16 (16bit PCM)
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            // 限制在 -1 到 1 之间，然后转换为 16 位整数
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          audioBufferRef.current.push(pcmData);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        // 每 40ms 发送一次音频数据
        sendIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) return;

          // 合并所有缓冲的音频数据
          const totalLength = audioBufferRef.current.reduce((sum, arr) => sum + arr.length, 0);
          if (totalLength === 0) return;

          const combined = new Int16Array(totalLength);
          let offset = 0;
          for (const arr of audioBufferRef.current) {
            combined.set(arr, offset);
            offset += arr.length;
          }
          audioBufferRef.current = [];

          // 每次发送 BUFFER_SIZE 字节（即 BUFFER_SIZE/2 个 Int16）
          const samplesPerBuffer = BUFFER_SIZE / 2;
          for (let i = 0; i < combined.length; i += samplesPerBuffer) {
            const chunk = combined.slice(i, i + samplesPerBuffer);
            if (chunk.length > 0) {
              wsRef.current.send(chunk.buffer);
            }
          }
        }, 40);
      } catch (error) {
        console.error('启动语音识别失败:', error);
        toast.error('无法启动语音识别，请稍后重试');
        stopRecording();
      }
    },
    [options, stopRecording, isRecording]
  );

  // 重置文本
  const resetText = useCallback(() => {
    setText('');
    setInterimText('');
    currentSegmentTextRef.current.clear();
  }, []);

  return {
    isRecording,
    text,
    interimText,
    startRecording,
    stopRecording,
    resetText,
  };
}

export default useXunfeiASR;
