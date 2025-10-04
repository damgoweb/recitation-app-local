import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { TextDetailClient } from '@/components/TextDetailClient';

async function getText(id: string) {
  try {
    const result = await sql`
      SELECT 
        id,
        title,
        author,
        content,
        is_custom as "isCustom",
        created_at as "createdAt"
      FROM texts
      WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Failed to fetch text:', error);
    return null;
  }
}

export default async function TextDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const text = await getText(id);

  if (!text) {
    notFound();
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