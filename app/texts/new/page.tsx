'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { createText } from '@/lib/storage/texts';

export default function NewTextPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !author.trim() || !content.trim()) {
      setError('すべての項目を入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newText = await createText({
        title: title.trim(),
        author: author.trim(),
        content: content.trim(),
        isCustom: true,
      });

      // 作成したテキストの詳細ページに遷移
      router.push(`/texts/${newText.id}`);
    } catch (err) {
      console.error('Failed to create text:', err);
      setError(err instanceof Error ? err.message : 'テキストの作成に失敗しました');
      setIsSubmitting(false);
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
        <h1 className="text-3xl font-bold text-gray-900">
          新しいテキストを追加
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          朗読したいテキストを追加できます
        </p>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        )}

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
              placeholder="例: 竹取物語"
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
              placeholder="例: 作者不詳"
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
              placeholder="朗読したい本文を入力してください"
              disabled={isSubmitting}
              required
            />
            <p className="text-base text-gray-600 mt-2">
              文字数: {content.length}
            </p>
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="flex-1"
            >
              作成する
            </Button>
            <Link href="/" className="flex-1">
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
        </div>
      </form>
    </div>
  );
}