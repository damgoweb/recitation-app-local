'use client';

import { useState } from 'react';
import { Input, Textarea, Button } from '@/components/ui';

interface TextFormData {
  title: string;
  author: string;
  content: string;
}

interface TextFormProps {
  initialData?: TextFormData;
  mode: 'create' | 'edit';
  onSubmit: (data: TextFormData) => Promise<void>;
  onCancel: () => void;
}

export function TextForm({ initialData, mode, onSubmit, onCancel }: TextFormProps) {
  const [formData, setFormData] = useState<TextFormData>(
    initialData || {
      title: '',
      author: '',
      content: '',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルを入力してください';
    } else if (formData.title.length > 100) {
      newErrors.title = 'タイトルは100文字以内で入力してください';
    }

    if (formData.author.length > 100) {
      newErrors.author = '著者名は100文字以内で入力してください';
    }

    if (!formData.content.trim()) {
      newErrors.content = '本文を入力してください';
    } else if (formData.content.length < 10) {
      newErrors.content = '本文は10文字以上入力してください';
    } else if (formData.content.length > 100000) {
      newErrors.content = '本文が長すぎます';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleCount = formData.title.length;
  const authorCount = formData.author.length;
  const contentCount = formData.content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="タイトル"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        helperText={`${titleCount} / 100 文字`}
        placeholder="例: 我が輩は猫である"
        required
      />

      <Input
        label="著者名（任意）"
        value={formData.author}
        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        error={errors.author}
        helperText={`${authorCount} / 100 文字`}
        placeholder="例: 夏目漱石"
      />

      <Textarea
        label="本文"
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        error={errors.content}
        helperText={`${contentCount} 文字（最低10文字）`}
        placeholder="朗読したい文章を入力してください"
        rows={12}
        required
      />

      <div className="flex gap-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="flex-1"
        >
          {mode === 'create' ? '追加する' : '更新する'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}