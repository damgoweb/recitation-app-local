import { getDB } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface Recording {
  id: string;
  textId: string;
  audioBlob: Blob;
  duration: number;
  fileSize: number;
  mimeType: string;
  recordedAt: string;
  createdAt: string;
}

export interface RecordingWithUrl extends Omit<Recording, 'audioBlob'> {
  audioBlobUrl: string;
}

/**
 * テキストIDで録音を取得
 */
export async function getRecordingByTextId(textId: string): Promise<Recording | null> {
  const db = await getDB();
  const recordings = await db.getAllFromIndex('recordings', 'by-text', textId);
  
  // 最新の録音を返す（通常1つのテキストに1つの録音）
  if (recordings.length === 0) {
    return null;
  }
  
  return recordings[0];
}

/**
 * 録音IDで取得
 */
export async function getRecordingById(id: string): Promise<Recording | null> {
  const db = await getDB();
  const recording = await db.get('recordings', id);
  return recording || null;
}

/**
 * すべての録音を取得
 */
export async function getAllRecordings(): Promise<Recording[]> {
  const db = await getDB();
  return db.getAll('recordings');
}

/**
 * 録音を保存（既存の録音があれば上書き）
 */
export async function saveRecording(data: {
  textId: string;
  audioBlob: Blob;
  duration: number;
  recordedAt: string;
}): Promise<Recording> {
  const db = await getDB();
  
  // 既存の録音を削除
  const existing = await getRecordingByTextId(data.textId);
  if (existing) {
    await db.delete('recordings', existing.id);
  }
  
  // 新しい録音を保存
  const newRecording: Recording = {
    id: uuidv4(),
    textId: data.textId,
    audioBlob: data.audioBlob,
    duration: data.duration,
    fileSize: data.audioBlob.size,
    mimeType: data.audioBlob.type || 'audio/webm',
    recordedAt: data.recordedAt,
    createdAt: new Date().toISOString(),
  };

  await db.add('recordings', newRecording);
  return newRecording;
}

/**
 * 録音を削除
 */
export async function deleteRecording(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('recordings', id);
}

/**
 * テキストIDに紐づく録音を削除
 */
export async function deleteRecordingByTextId(textId: string): Promise<void> {
  const db = await getDB();
  const recordings = await db.getAllFromIndex('recordings', 'by-text', textId);
  
  const tx = db.transaction('recordings', 'readwrite');
  await Promise.all(
    recordings.map(recording => tx.store.delete(recording.id))
  );
  await tx.done;
}

/**
 * 録音数を取得
 */
export async function getRecordingCount(): Promise<number> {
  const db = await getDB();
  return db.count('recordings');
}

/**
 * BlobからURLを生成（再生用）
 */
export function createAudioUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * 生成したURLを解放（メモリリーク防止）
 */
export function revokeAudioUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * すべての録音をテキストIDとともに取得
 */
export async function getRecordingsWithTextIds(): Promise<Map<string, Recording>> {
  const recordings = await getAllRecordings();
  const map = new Map<string, Recording>();
  
  recordings.forEach(recording => {
    map.set(recording.textId, recording);
  });
  
  return map;
}