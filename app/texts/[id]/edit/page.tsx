'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Loading, Modal } from '@/components/ui';
import { getTextById, updateText, deleteText } from '@/lib/storage/texts';

export default function EditTextPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function loadText() {
      try {
        setIsLoading(true);
        const text = await getTextById(id);
        
        if (!text) {
          setError('テキストが見つかりません');
          return;
        }

        if (!text.isCustom) {
          setError('デフォルトのテキストは編集できません');
          return;
        }

        setTitle(text.title);
        setAuthor(text.author);
        setContent(text.content);
      } catch (err) {
        console.error('Failed to load text:', err);
        setError('テキストの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    }

    loadText();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !author.trim() || !content.trim()) {
      setError('すべての項目を入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateText(id, {
        title: title.trim(),
        author: author.trim(),
        content: content.trim(),
      });

      // 詳細ページに戻る
      router.push(`/texts/${id}`);
    } catch (err) {
      console.error('Failed to update text:', err);
      setError(err instanceof Error ? err.message : 'テキストの更新に失敗しました');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteText(id);
      // 一覧ページに戻る
      router.push('/');
    } catch (err) {
      console.error('Failed to delete text:', err);
      setError(err instanceof Error ? err.message : 'テキストの削除に失敗しました');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading size="lg" text="読み込み中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <h1 className="text-3xl font-bold text-gray-900">
          テキストを編集
        </h1>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-900 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* 著者 */}
          <div>
            <label htmlFor="author" className="block text-lg font-medium text-gray-900 mb-2">
              著者 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* 本文 */}
          <div>
            <label htmlFor="content" className="block text-lg font-medium text-gray-900 mb-2">
              本文 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              disabled={isSubmitting}
              required
            />
            <p className="text-base text-gray-600 mt-2">
              文字数: {content.length}
            </p>
          </div>

          {/* ボタン */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="flex-1"
              >
                保存する
              </Button>
              <Link href={`/texts/${id}`} className="flex-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  キャンセル
                </Button>
              </Link>
            </div>

            {/* 削除ボタン */}
            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={() => setShowDeleteModal(true)}
              disabled={isSubmitting}
            >
              このテキストを削除
            </Button>
          </div>
        </div>
      </form>

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
        <div>
          <p className="text-lg text-gray-700 mb-4">
            このテキストと関連する録音をすべて削除してもよろしいですか？
          </p>
          <p className="text-base text-red-600">
            この操作は取り消せません。
          </p>
        </div>
      </Modal>
    </div>
  );
}