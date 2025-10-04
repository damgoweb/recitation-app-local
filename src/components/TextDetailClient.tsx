'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { RecordingControls } from '@/components/RecordingControls';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useRecording } from '@/hooks';

interface TextDetailClientProps {
  textId: string;
}

export function TextDetailClient({ textId }: TextDetailClientProps) {
  const { recording, isLoading, refetch, deleteRecording } = useRecording(textId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteRecording = async () => {
    if (!recording) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteRecording(recording.id);
      setShowDeleteModal(false);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">録音</h2>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">読み込み中...</p>
        </div>
      ) : recording ? (
        <div className="space-y-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-lg text-green-800 font-medium mb-1">
              録音済み
            </p>
            <p className="text-base text-green-600">
              {new Date(recording.recordedAt).toLocaleString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <AudioPlayer
            audioUrl={recording.audioBlobUrl}
            duration={recording.duration}
            onDelete={() => setShowDeleteModal(true)}
          />

          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              録音し直す
            </h3>
            <RecordingControls
              textId={textId}
              existingRecording={{
                id: recording.id,
                recordedAt: recording.recordedAt,
              }}
              onRecordingComplete={refetch}
            />
          </div>
        </div>
      ) : (
        <RecordingControls
          textId={textId}
          existingRecording={null}
          onRecordingComplete={refetch}
        />
      )}

      {/* 削除確認モーダル */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="録音を削除"
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
              onClick={handleDeleteRecording}
              isLoading={isDeleting}
            >
              削除する
            </Button>
          </>
        }
      >
        <div>
          <p className="text-lg text-gray-700 mb-4">
            この録音を削除してもよろしいですか？
          </p>
          {deleteError && (
            <p className="text-base text-red-600">
              {deleteError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}