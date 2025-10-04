'use client';

import { useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { useRecorder } from '@/hooks';
import { formatDuration } from '@/lib/utils';
import { clearTextsCache } from '@/hooks/useTexts';

interface RecordingControlsProps {
  textId: string;
  existingRecording?: {
    id: string;
    recordedAt: string;
  } | null;
  onRecordingComplete: () => void;
}

export function RecordingControls({
  textId,
  existingRecording,
  onRecordingComplete,
}: RecordingControlsProps) {
  const {
    isRecording,
    duration,
    audioBlob,
    startRecording,
    stopRecording,
    error: recorderError,
  } = useRecorder();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);

  const handleStartRecording = async () => {
    // 既存の録音がある場合は確認
    if (existingRecording) {
      setShowOverwriteModal(true);
    } else {
      await startRecording();
    }
  };

  const handleConfirmOverwrite = async () => {
    setShowOverwriteModal(false);
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleUpload = async () => {
    if (!audioBlob) {
      setUploadError('録音データがありません');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('textId', textId);
      formData.append('audioFile', audioBlob, 'recording.webm');
      formData.append('duration', duration.toString());
      formData.append('recordedAt', new Date().toISOString());

      const response = await fetch('/api/recordings', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'アップロードに失敗しました');
      }

      // 一覧画面のキャッシュをクリア
      clearTextsCache();

      // データベースのレプリケーション遅延を考慮して待機
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 成功したらコールバックを実行
      onRecordingComplete();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  const error = recorderError || uploadError;

  return (
    <div className="space-y-6">
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      )}

      {/* 既存の録音情報 */}
      {existingRecording && !isRecording && !audioBlob && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-lg text-blue-800">
            録音済みです（{new Date(existingRecording.recordedAt).toLocaleDateString('ja-JP')}）
          </p>
          <p className="text-base text-blue-600 mt-1">
            新しく録音すると上書きされます
          </p>
        </div>
      )}

      {/* 録音中の表示 */}
      {isRecording && (
        <div className="bg-white border-2 border-red-500 rounded-xl p-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            <span className="text-2xl font-bold text-gray-900">
              録音中...
            </span>
          </div>
          <div className="text-center">
            <span className="text-4xl font-mono font-bold text-gray-900">
              {formatDuration(duration)}
            </span>
          </div>
        </div>
      )}

      {/* 録音完了後の表示 */}
      {audioBlob && !isRecording && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <p className="text-lg text-green-800 mb-2">
            録音完了（{formatDuration(duration)}）
          </p>
          <p className="text-base text-green-600">
            「保存する」ボタンを押してアップロードしてください
          </p>
        </div>
      )}

      {/* コントロールボタン */}
      <div className="flex gap-4">
        {!isRecording && !audioBlob && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartRecording}
            className="flex-1"
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            録音開始
          </Button>
        )}

        {isRecording && (
          <Button
            variant="danger"
            size="lg"
            onClick={handleStopRecording}
            className="flex-1"
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            録音停止
          </Button>
        )}

        {audioBlob && !isRecording && (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={handleUpload}
              isLoading={isUploading}
              className="flex-1"
            >
              保存する
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => window.location.reload()}
              disabled={isUploading}
            >
              やり直す
            </Button>
          </>
        )}
      </div>

      {/* 上書き確認モーダル */}
      <Modal
        isOpen={showOverwriteModal}
        onClose={() => setShowOverwriteModal(false)}
        title="録音の上書き確認"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowOverwriteModal(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmOverwrite}
            >
              録音を開始
            </Button>
          </>
        }
      >
        <p className="text-lg text-gray-700">
          既存の録音を上書きします。よろしいですか？
        </p>
        <p className="text-base text-gray-600 mt-2">
          古い録音は削除されます。
        </p>
      </Modal>
    </div>
  );
}