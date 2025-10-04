'use client';

import { useState, useEffect } from 'react';
import { 
  getRecordingByTextId, 
  deleteRecording as deleteRecordingFromDB,
  createAudioUrl,
  revokeAudioUrl 
} from '@/lib/storage/recordings';

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
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const fetchRecording = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 以前のURLを解放
      if (currentUrl) {
        revokeAudioUrl(currentUrl);
        setCurrentUrl(null);
      }

      const rec = await getRecordingByTextId(textId);
      
      if (rec) {
        // BlobからURLを生成
        const url = createAudioUrl(rec.audioBlob);
        setCurrentUrl(url);

        setRecording({
          id: rec.id,
          textId: rec.textId,
          audioBlobUrl: url,
          duration: rec.duration,
          fileSize: rec.fileSize,
          mimeType: rec.mimeType,
          recordedAt: rec.recordedAt,
        });
      } else {
        setRecording(null);
      }
    } catch (err) {
      console.error('Failed to fetch recording:', err);
      setError(err instanceof Error ? err.message : '録音の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecording = async (recordingId: string) => {
    try {
      await deleteRecordingFromDB(recordingId);
      
      // URLを解放
      if (currentUrl) {
        revokeAudioUrl(currentUrl);
        setCurrentUrl(null);
      }
      
      setRecording(null);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchRecording();

    // クリーンアップ: URLを解放
    return () => {
      if (currentUrl) {
        revokeAudioUrl(currentUrl);
      }
    };
  }, [textId]);

  return {
    recording,
    isLoading,
    error,
    refetch: fetchRecording,
    deleteRecording,
  };
}