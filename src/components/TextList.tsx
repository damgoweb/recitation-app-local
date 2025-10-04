import { TextWithRecording } from '@/types';
import { TextCard } from './TextCard';

interface TextListProps {
  texts: TextWithRecording[];
  onTextClick: (textId: string) => void;
}

export function TextList({ texts, onTextClick }: TextListProps) {
  if (texts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">
          テキストがありません
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6">
      {texts.map((text) => (
        <TextCard
          key={text.id}
          text={text}
          onClick={() => onTextClick(text.id)}
        />
      ))}
    </div>
  );
}