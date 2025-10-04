import { getDB } from './db';
import { v4 as uuidv4 } from 'uuid';
import { Text } from '@/types';

/**
 * プレビューテキストを生成（最初の100文字）
 */
function generatePreview(content: string): string {
  return content.substring(0, 100) + (content.length > 100 ? '...' : '');
}

/**
 * すべてのテキストを取得
 */
export async function getAllTexts(): Promise<Text[]> {
  const db = await getDB();
  const texts = await db.getAll('texts');
  
  // preview と updatedAt を追加（既存データ対応）
  const enrichedTexts = texts.map(text => ({
    ...text,
    preview: text.preview || generatePreview(text.content),
    updatedAt: text.updatedAt || text.createdAt,
  }));
  
  // 作成日時の古い順にソート
  return enrichedTexts.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

/**
 * IDでテキストを取得
 */
export async function getTextById(id: string): Promise<Text | null> {
  const db = await getDB();
  const text = await db.get('texts', id);
  
  if (!text) return null;
  
  // preview と updatedAt を追加（既存データ対応）
  return {
    ...text,
    preview: text.preview || generatePreview(text.content),
    updatedAt: text.updatedAt || text.createdAt,
  };
}

/**
 * テキストを作成
 */
export async function createText(data: {
  title: string;
  author: string;
  content: string;
  isCustom?: boolean;
}): Promise<Text> {
  const db = await getDB();
  
  const now = new Date().toISOString();
  const newText: Text = {
    id: uuidv4(),
    title: data.title,
    author: data.author,
    content: data.content,
    preview: generatePreview(data.content),
    isCustom: data.isCustom ?? true,
    createdAt: now,
    updatedAt: now,
  };

  await db.add('texts', newText);
  return newText;
}

/**
 * テキストを更新
 */
export async function updateText(
  id: string,
  data: {
    title?: string;
    author?: string;
    content?: string;
  }
): Promise<Text> {
  const db = await getDB();
  
  const existing = await db.get('texts', id);
  if (!existing) {
    throw new Error('テキストが見つかりません');
  }

  const updated: Text = {
    ...existing,
    ...data,
    preview: data.content ? generatePreview(data.content) : (existing.preview || generatePreview(existing.content)),
    updatedAt: new Date().toISOString(),
  };

  await db.put('texts', updated);
  return updated;
}

/**
 * テキストを削除
 */
export async function deleteText(id: string): Promise<void> {
  const db = await getDB();
  
  // テキストを削除
  await db.delete('texts', id);
  
  // 関連する録音も削除
  const recordings = await db.getAllFromIndex('recordings', 'by-text', id);
  const tx = db.transaction('recordings', 'readwrite');
  await Promise.all(
    recordings.map(recording => tx.store.delete(recording.id))
  );
  await tx.done;
}

/**
 * テキスト数を取得
 */
export async function getTextCount(): Promise<number> {
  const db = await getDB();
  return db.count('texts');
}

/**
 * 複数のテキストを一括インポート
 */
export async function importTexts(texts: Omit<Text, 'id' | 'createdAt' | 'updatedAt' | 'preview'>[]): Promise<number> {
  const db = await getDB();
  const tx = db.transaction('texts', 'readwrite');
  
  let importedCount = 0;
  const now = new Date().toISOString();
  
  for (const textData of texts) {
    const newText: Text = {
      id: uuidv4(),
      ...textData,
      preview: generatePreview(textData.content),
      createdAt: now,
      updatedAt: now,
    };
    await tx.store.add(newText);
    importedCount++;
  }
  
  await tx.done;
  return importedCount;
}