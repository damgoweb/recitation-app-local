'use client';

import { useAudioPlayer } from '@/hooks';
import { Button } from '@/components/ui';
import { formatDuration } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string;
  duration: number;
  onDelete?: () => void;
}

export function AudioPlayer({ audioUrl, duration: totalDuration, onDelete }: AudioPlayerProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    play,
    pause,
    seek,
  } = useAudioPlayer(audioUrl);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seek(time);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-base text-red-600">{error}</p>
        </div>
      )}

      {/* ローディング */}
      {isLoading && (
        <div className="text-center py-4">
          <p className="text-lg text-gray-600">読み込み中...</p>
        </div>
      )}

      {/* プレーヤー */}
      {!isLoading && (
        <>
          {/* 時間表示 */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-mono text-gray-700">
              {formatDuration(Math.floor(currentTime))}
            </span>
            <span className="text-lg font-mono text-gray-700">
              {formatDuration(Math.floor(duration || totalDuration))}
            </span>
          </div>

          {/* シークバー */}
          <div className="mb-6">
            <input
              type="range"
              min="0"
              max={duration || totalDuration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {/* コントロールボタン */}
          <div className="flex gap-4">
            {/* 再生/一時停止ボタン */}
            <Button
              variant="primary"
              size="lg"
              onClick={isPlaying ? pause : play}
              className="flex-1"
            >
              {isPlaying ? (
                <>
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  一時停止
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  再生
                </>
              )}
            </Button>

            {/* 削除ボタン */}
            {onDelete && (
              <Button
                variant="danger"
                size="lg"
                onClick={onDelete}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </Button>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}