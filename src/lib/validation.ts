import { z } from 'zod';

// テキスト作成のスキーマ
export const createTextSchema = z.object({
  title: z.string()
    .min(1, 'タイトルを入力してください')
    .max(100, 'タイトルは100文字以内で入力してください'),
  author: z.string()
    .max(100, '著者名は100文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  content: z.string()
    .min(10, '本文は10文字以上入力してください')
    .max(100000, '本文が長すぎます'),
});

// テキスト更新のスキーマ
export const updateTextSchema = z.object({
  title: z.string()
    .min(1, 'タイトルを入力してください')
    .max(100, 'タイトルは100文字以内で入力してください')
    .optional(),
  author: z.string()
    .max(100, '著者名は100文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  content: z.string()
    .min(10, '本文は10文字以上入力してください')
    .max(100000, '本文が長すぎます')
    .optional(),
});

// 録音作成のスキーマ
export const createRecordingSchema = z.object({
  textId: z.string().uuid('無効なテキストIDです'),
  duration: z.number()
    .positive('録音時間は正の数である必要があります')
    .max(3600, '録音時間は1時間以内にしてください'),
  fileSize: z.number()
    .positive('ファイルサイズが不正です')
    .max(100 * 1024 * 1024, 'ファイルサイズは100MB以下である必要があります'),
  mimeType: z.enum(['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']),
  recordedAt: z.string().datetime('無効な日時形式です'),
});

// バリデーション実行関数
export function validateCreateText(data: unknown) {
  return createTextSchema.safeParse(data);
}

export function validateUpdateText(data: unknown) {
  return updateTextSchema.safeParse(data);
}

export function validateCreateRecording(data: unknown) {
  return createRecordingSchema.safeParse(data);
}