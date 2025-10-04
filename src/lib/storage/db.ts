import { openDB, DBSchema, IDBPDatabase } from 'idb';

// データベーススキーマの定義
interface RecitationDB extends DBSchema {
  texts: {
    key: string; // id
    value: {
      id: string;
      title: string;
      author: string;
      content: string;
      preview?: string;      // 追加（オプショナル）
      isCustom: boolean;
      blobUrl?: string;      // 追加（オプショナル）
      createdAt: string;
      updatedAt?: string;    // 追加（オプショナル）
    };
    indexes: {
      'by-created': string; // createdAt
    };
  };
  recordings: {
    key: string; // id
    value: {
      id: string;
      textId: string;
      audioBlob: Blob;
      duration: number;
      fileSize: number;
      mimeType: string;
      recordedAt: string;
      createdAt: string;
    };
    indexes: {
      'by-text': string; // textId
      'by-recorded': string; // recordedAt
    };
  };
}

const DB_NAME = 'recitation-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<RecitationDB> | null = null;

/**
 * IndexedDBを初期化して接続を返す
 */
export async function getDB(): Promise<IDBPDatabase<RecitationDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<RecitationDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // textsストアの作成
      if (!db.objectStoreNames.contains('texts')) {
        const textStore = db.createObjectStore('texts', {
          keyPath: 'id',
        });
        textStore.createIndex('by-created', 'createdAt');
      }

      // recordingsストアの作成
      if (!db.objectStoreNames.contains('recordings')) {
        const recordingStore = db.createObjectStore('recordings', {
          keyPath: 'id',
        });
        recordingStore.createIndex('by-text', 'textId');
        recordingStore.createIndex('by-recorded', 'recordedAt');
      }
    },
  });

  return dbInstance;
}

/**
 * データベース接続を閉じる（通常は不要）
 */
export function closeDB() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * データベースを完全に削除（開発・デバッグ用）
 */
export async function deleteDB() {
  closeDB();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}