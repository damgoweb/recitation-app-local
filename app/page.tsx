'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTexts } from '@/hooks/useTexts';
import { Button, Loading } from '@/components/ui';
import { useEffect } from 'react';
import { ExportButton } from '@/components/ExportButton';
import { ImportButton } from '@/components/ImportButton';

// 重いコンポーネントを動的インポート
const ProgressBar = dynamic(() => import('@/components/ProgressBar').then(mod => ({ default: mod.ProgressBar })), {
  loading: () => <div className="h-20 bg-gray-200 animate-pulse rounded-xl" />,
});

const TextList = dynamic(() => import('@/components/TextList').then(mod => ({ default: mod.TextList })), {
  loading: () => <Loading size="md" />,
});

export default function HomePage() {
  const router = useRouter();
  const { texts, isLoading, error, refetch } = useTexts();

  // ページが表示されるたびに最新データを取得
  useEffect(() => {
    refetch();
  }, [refetch]);

  const recordedCount = texts.filter(t => t.hasRecording).length;
  const totalCount = texts.length;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading size="lg" text="読み込み中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button 
            variant="primary"
            onClick={() => window.location.reload()}
          >
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          テキスト一覧
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          作品を選んで朗読練習を始めましょう
        </p>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <ProgressBar total={totalCount} completed={recordedCount} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/texts/new')}
            className="flex-1 sm:flex-initial"
          >
            + 新しいテキストを追加
          </Button>
          <ImportButton onImportComplete={refetch} />
          <ExportButton />
        </div>
      </div>

      <TextList
        texts={texts}
        onTextClick={(id) => router.push(`/texts/${id}`)}
      />
    </div>
  );
}