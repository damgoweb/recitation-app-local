'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { Button, Modal, Loading } from '@/components/ui';
import { TextForm } from '@/components/TextForm';

async function fetchText(id: string) {
  const response = await fetch(`/api/texts/${id}`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'テキストの取得に失敗しました');
  }
  
  return result.data;
}

export default function EditTextPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [text, setText] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadText = async () => {
      try {
        const data = await fetchText(id);
        
        if (!data.isCustom) {
          setError('初期搭載テキストは編集できません');
          return;
        }
        
        setText(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadText();
  }, [id]);

  const handleSubmit = async (data: { title: string; author: string; content: string }) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/texts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'テキストの更新に失敗しました');
      }

      router.push(`/texts/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/texts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'テキストの削除に失敗しました');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (confirm('変更内容が失われますが、よろしいですか？')) {
      router.push(`/texts/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading size="lg" text="読み込み中..." />
      </div>
    );
  }

  if (error && !text) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="secondary">
              ← 一覧に戻る
            </Button>
          </Link>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Link href="/">
            <Button variant="primary">一覧に戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 戻るボタン */}
      <div className="mb-6">
        <Link href={`/texts/${id}`}>
          <Button variant="secondary">
            ← 詳細に戻る
          </Button>
        </Link>
      </div>

      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              テキストを編集
            </h1>
            <p className="text-lg text-gray-600">
              {text?.title}
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            削除
          </Button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      )}

      {/* フォーム */}
      {text && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <TextForm
            mode="edit"
            initialData={{
              title: text.title,
              author: text.author || '',
              content: text.content,
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* 削除確認モーダル */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="テキストを削除"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              削除する
            </Button>
          </>
        }
      >
        <p className="text-lg text-gray-700">
          「{text?.title}」を削除してもよろしいですか？
        </p>
        <p className="text-base text-red-600 mt-4">
          この操作は取り消せません。録音データも同時に削除されます。
        </p>
      </Modal>
    </div>
  );
}