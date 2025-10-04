'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllTexts } from '@/lib/storage/texts';
import { getRecordingsWithTextIds } from '@/lib/storage/recordings';
import { TextWithRecording } from '@/types';

export function useTexts() {
  const [texts, setTexts] = useState<TextWithRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTexts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // テキストと録音を並行取得
      const [allTexts, recordingsMap] = await Promise.all([
        getAllTexts(),
        getRecordingsWithTextIds(),
      ]);

      // テキストに録音状態を追加
      const textsWithRecording: TextWithRecording[] = allTexts.map(text => ({
        ...text,
        hasRecording: recordingsMap.has(text.id),
      }));

      setTexts(textsWithRecording);
    } catch (err) {
      console.error('Failed to fetch texts:', err);
      setError(err instanceof Error ? err.message : 'テキストの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTexts();
  }, [fetchTexts]);

  const refetch = useCallback(() => {
    fetchTexts();
  }, [fetchTexts]);

  return {
    texts,
    isLoading,
    error,
    refetch,
  };
}