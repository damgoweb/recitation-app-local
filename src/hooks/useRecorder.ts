'use client';

import { useState, useRef, useCallback } from 'react';

interface UseRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  error: string | null;
}

export function useRecorder(): UseRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // ブラウザの互換性チェック
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('このブラウザは録音機能に対応していません。Chrome、Safari、Edgeなどの最新ブラウザをお使いください。');
      }

      // HTTPSチェック（localhost以外）
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        throw new Error('録音機能を使用するにはHTTPS接続が必要です。');
      }

      // マイクの許可を取得
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // サポートされているMIMEタイプを確認
      const mimeTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
      ];

      let mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
      
      if (!mimeType) {
        // フォールバック: MIMEタイプ指定なし
        mimeType = '';
      }

      // 低ビットレート設定（32kbps）でファイルサイズを削減
      const options = mimeType ? { 
        mimeType,
        audioBitsPerSecond: 32000  // 32kbps - 朗読音声に最適
      } : undefined;
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalMimeType = mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: finalMimeType });
        setAudioBlob(blob);
        
        // 再生用のURLを作成
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // ストリームを停止
        stream.getTracks().forEach(track => track.stop());
        
        // タイマーを停止
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.onerror = (event: Event) => {
        console.error('MediaRecorder error:', event);
        setError('録音中にエラーが発生しました');
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;

      // 録音時間を更新
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 100);

    } catch (err) {
      console.error('Recording error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('マイクの使用が許可されていません。ブラウザの設定を確認してください。');
        } else if (err.name === 'NotFoundError') {
          setError('マイクが見つかりません。マイクが接続されているか確認してください。');
        } else if (err.name === 'NotSupportedError') {
          setError('このブラウザは録音機能に対応していません。');
        } else if (err.name === 'SecurityError') {
          setError('セキュリティエラー: HTTPS接続が必要です。');
        } else {
          setError(err.message || '録音の開始に失敗しました');
        }
      } else {
        setError('録音の開始に失敗しました');
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      pausedTimeRef.current = Date.now() - startTimeRef.current;
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimeRef.current = Date.now() - pausedTimeRef.current;
    }
  }, [isRecording, isPaused]);

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error,
  };
}