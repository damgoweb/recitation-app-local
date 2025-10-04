import { Card } from '@/components/ui';
import { TextWithRecording } from '@/types';
import { formatDistance } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TextCardProps {
  text: TextWithRecording;
  onClick: () => void;
}

export function TextCard({ text, onClick }: TextCardProps) {
  return (
    <Card onClick={onClick} hoverable>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {text.title}
            </h3>
            <p className="text-base text-gray-600">
              {text.author}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            {text.isCustom && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                カスタム
              </span>
            )}
          </div>
        </div>

        <p className="text-base text-gray-700 line-clamp-2">
          {text.preview}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {text.hasRecording ? (
              <>
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-base font-medium text-green-600">
                  録音済み
                </span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="text-base font-medium text-gray-500">
                  未録音
                </span>
              </>
            )}
          </div>

          {text.recordedAt && (
            <span className="text-sm text-gray-500">
              {formatDistance(new Date(text.recordedAt), new Date(), {
                addSuffix: true,
                locale: ja,
              })}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}