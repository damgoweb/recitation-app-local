'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { getAllTexts } from '@/lib/storage/texts';

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      // IndexedDBから直接テキストを取得
      const texts = await getAllTexts();

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        texts: texts,
      };

      // JSONファイルとしてダウンロード
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recitation-texts-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <Button
        variant="secondary"
        onClick={handleExport}
        isLoading={isExporting}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        テキストをエクスポート
      </Button>
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}