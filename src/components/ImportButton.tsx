'use client';

import { useState, useRef } from 'react';
import { Button, Modal } from '@/components/ui';
import { importTexts } from '@/lib/storage/texts';

interface ImportButtonProps {
  onImportComplete?: () => void;
}

export function ImportButton({ onImportComplete }: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    try {
      // ファイルを読み込む
      const text = await file.text();
      const data = JSON.parse(text);

      // データ形式のバリデーション
      if (!data.texts || !Array.isArray(data.texts)) {
        throw new Error('無効なファイル形式です');
      }

      // IndexedDBにインポート
      const count = await importTexts(data.texts);
      setImportedCount(count);
      setShowSuccessModal(true);

      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // コールバックを実行
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      console.error('Import error:', err);
      if (err instanceof SyntaxError) {
        setError('JSONファイルの形式が正しくありません');
      } else {
        setError(err instanceof Error ? err.message : 'インポートに失敗しました');
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        variant="secondary"
        onClick={handleClick}
        isLoading={isImporting}
        disabled={isImporting}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        テキストをインポート
      </Button>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      {/* 成功モーダル */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="インポート完了"
        footer={
          <Button
            variant="primary"
            onClick={() => setShowSuccessModal(false)}
          >
            閉じる
          </Button>
        }
      >
        <p className="text-lg text-gray-700">
          {importedCount}件のテキストをインポートしました
        </p>
      </Modal>
    </>
  );
}