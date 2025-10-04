'use client';

import { useState, useEffect } from 'react';
import { clearTextsCache } from './useTexts';

interface Recording {
  id: string;
  textId: string;
  audioBlobUrl: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  recordedAt: string;
}

export function useRecording(textId: string) {
  const [recording, setRecording] = useState<Recording | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecording = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/recordings/by-text/${textId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error('録音の取得に失敗しました');
      }

      const data = await response.json();
      
      if (data.success) {
        setRecording(data.data);
      } else {
        throw new Error(data.error?.message || 'エラーが発生しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecording = async (recordingId: string) => {
    try {
      const response = await fetch(`/api/recordings/${recordingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('録音の削除に失敗しました');
      }

      setRecording(null);
      
      // 一覧画面のキャッシュもクリア
      clearTextsCache();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchRecording();
  }, [textId]);

  return {
    recording,
    isLoading,
    error,
    refetch: fetchRecording,
    deleteRecording,
  };
}