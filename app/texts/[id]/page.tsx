'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Loading } from '@/components/ui';
import { TextDetailClient } from '@/components/TextDetailClient';
import { getTextById } from '@/lib/storage/texts';

interface Text {
  id: string;
  title: string;
  author: string;
  content: string;
  isCustom: boolean;
  createdAt: string;
}

export default function TextDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [text, setText] = useState<Text | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadText() {
      try {
        setIsLoading(true);
        const data = await getTextById(id);
        
        if (!data) {
          setError('テキストが見つかりません');
          return;
        }
        
        setText(data);
      } catch (err) {
        console.error('Failed to load text:', err);
        setError('テキストの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    }

    loadText();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading size="lg" text="読み込み中..." />
      </div>
    );
  }

  if (error || !text) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <p className="text-xl text-red-600 mb-4">{error || 'テキストが見つかりません'}</p>
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
        <Link href="/">
          <Button variant="secondary">
            ← 一覧に戻る
          </Button>
        </Link>
      </div>

      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {text.title}
            </h1>
            <p className="text-xl text-gray-600">
              {text.author}
            </p>
          </div>
          <div className="flex gap-3">
            {text.isCustom && (
              <>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  カスタム
                </span>
                <Link href={`/texts/${id}/edit`}>
                  <Button variant="secondary">
                    編集
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 本文 */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">本文</h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
            {text.content}
          </p>
        </div>
      </div>

      {/* 録音機能エリア */}
      <TextDetailClient textId={id} />
    </div>
  );
}