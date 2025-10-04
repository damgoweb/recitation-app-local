'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Button, Modal } from '@/components/ui';
import { TextForm } from '@/components/TextForm';

export default function NewTextPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTextId, setCreatedTextId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { title: string; author: string; content: string }) => {
    try {
      setError(null);
      
      const response = await fetch('/api/texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'テキストの追加に失敗しました');
      }

      setCreatedTextId(result.data.id);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    }
  };

  const handleCancel = () => {
    if (confirm('入力内容が失われますが、よろしいですか？')) {
      router.push('/');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 戻るボタン */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="secondary">
            ← 一覧に戻る
          </Button>
        </Link>
      </div>

      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          新しいテキストを追加
        </h1>
        <p className="text-lg text-gray-600">
          朗読したい文章を入力してください
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      )}

      {/* フォーム */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <TextForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>

      {/* 成功モーダル */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {}}
        title="追加完了"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => router.push('/')}
            >
              一覧に戻る
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push(`/texts/${createdTextId}`)}
            >
              詳細を見る
            </Button>
          </>
        }
      >
        <p className="text-lg text-gray-700">
          テキストを追加しました。
        </p>
      </Modal>
    </div>
  );
}