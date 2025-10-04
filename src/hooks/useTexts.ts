'use client';

import { useState, useEffect, useCallback } from 'react';
import { TextWithRecording } from '@/types';

// メモリキャッシュ
let cachedTexts: TextWithRecording[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分

// キャッシュをクリアする関数をエクスポート
export function clearTextsCache() {
  cachedTexts = null;
  cacheTimestamp = null;
}

export function useTexts() {
  const [texts, setTexts] = useState<TextWithRecording[]>(cachedTexts || []);
  const [isLoading, setIsLoading] = useState(!cachedTexts);
  const [error, setError] = useState<string | null>(null);

  const fetchTexts = useCallback(async () => {
    // キャッシュが有効な場合は使用
    if (cachedTexts && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setTexts(cachedTexts);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/texts', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error('テキストの取得に失敗しました');
      }

      const data = await response.json();
      
      if (data.success) {
        cachedTexts = data.data;
        cacheTimestamp = Date.now();
        setTexts(data.data);
      } else {
        throw new Error(data.error?.message || 'エラーが発生しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTexts();
  }, [fetchTexts]);

  const refetch = useCallback(() => {
    // キャッシュをクリアして再取得
    clearTextsCache();
    fetchTexts();
  }, [fetchTexts]);

  return {
    texts,
    isLoading,
    error,
    refetch,
  };
}