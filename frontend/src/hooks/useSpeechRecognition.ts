import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface UseSpeechRecognitionReturn {
  isRecording: boolean;
  text: string;
  interimText: string;
  startRecording: (shouldResetText?: boolean) => Promise<void>;
  stopRecording: () => void;
  resetText: () => void;
}

/**
 * 语音识别自定义Hook
 */
export function useSpeechRecognition({
  lang = 'zh-CN',
  continuous = true,
  interimResults = true,
  maxAlternatives = 1,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // 检查浏览器是否支持语音识别API
  const isSpeechRecognitionSupported = useCallback((): boolean => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }, []);

  // 停止录音
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        toast.info('正在停止语音识别...');
      } catch (error) {
        console.error('停止语音识别失败:', error);
      }
      recognitionRef.current = null;
    }

    // 释放麦克风资源
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      console.log('麦克风资源已释放');
    }
  }, []);

  // 开始录音
  const startRecording = useCallback(
    async (shouldResetText = true) => {
      try {
        // 检查浏览器是否支持语音识别API
        if (!isSpeechRecognitionSupported()) {
          toast.error('您的浏览器不支持语音识别功能，请使用Chrome浏览器');
          return;
        }

        // 如果需要重置文本
        if (shouldResetText) {
          setText('');
          setInterimText('');
        }

        // 先请求麦克风权限
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // 保存媒体流引用，以便后续释放
          mediaStreamRef.current = stream;
        } catch {
          toast.error('无法访问麦克风，请检查浏览器权限设置');
          return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // 配置识别器
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.maxAlternatives = maxAlternatives;
        recognition.lang = lang;

        // 识别开始事件
        recognition.onstart = () => {
          setIsRecording(true);
          toast.info('开始语音识别，请说话...', {
            duration: 1000,
            id: 'speech-recognition-status',
          });
          console.log('语音识别已启动');
        };

        // 识别结果事件
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';

          // 收集所有识别结果
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          // 更新中间结果和最终结果
          if (interimTranscript) {
            setInterimText(interimTranscript);
          }

          if (finalTranscript) {
            setText((prev) => prev + finalTranscript);
            setInterimText('');
            toast.success('语音识别成功', {
              duration: 2000,
              id: 'speech-recognition-final',
            });

            // 语音识别成功后自动停止识别
            stopRecording();
          }
        };

        // 识别错误事件
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('语音识别错误:', event.error);

          // 提供更具体的错误信息
          let errorMessage = '语音识别错误';
          switch (event.error) {
            case 'no-speech':
              errorMessage = '未检测到语音，请确保麦克风正常工作并尝试大声说话';
              break;
            case 'aborted':
              errorMessage = '语音识别被中断';
              break;
            case 'audio-capture':
              errorMessage = '无法捕获音频，请检查麦克风设备';
              break;
            case 'network':
              errorMessage = '网络错误导致语音识别失败';
              break;
            case 'not-allowed':
              errorMessage = '麦克风权限被拒绝，请在浏览器设置中允许访问麦克风';
              break;
            case 'service-not-allowed':
              errorMessage = '浏览器不允许使用语音识别服务';
              break;
            default:
              errorMessage = `语音识别错误: ${event.error}`;
          }

          toast.error(errorMessage);
          setIsRecording(false);
        };

        // 识别结束事件
        recognition.onend = () => {
          // 如果仍处于录音状态，可能是临时中断，尝试重新启动
          if (isRecording && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              console.log('重新启动语音识别');
              return;
            } catch (e) {
              console.error('重新启动语音识别失败:', e);
            }
          }

          setIsRecording(false);
          toast.success('语音识别完成', {
            id: 'speech-recognition-status',
          });
          console.log('语音识别已结束');
        };

        // 保存识别器引用
        recognitionRef.current = recognition;

        // 开始识别
        recognition.start();
      } catch (error) {
        console.error('语音识别失败:', error);
        toast.error('无法启动语音识别，请检查浏览器权限');
        setIsRecording(false);
      }
    },
    [
      isSpeechRecognitionSupported,
      continuous,
      interimResults,
      maxAlternatives,
      lang,
      stopRecording,
      isRecording,
    ]
  );

  // 重置文本
  const resetText = useCallback(() => {
    setText('');
    setInterimText('');
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

export default useSpeechRecognition;
