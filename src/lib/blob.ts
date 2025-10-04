import { put, del } from '@vercel/blob';

/**
 * 音声ファイルをVercel Blobにアップロード
 */
export async function uploadAudio(
  file: File | Blob,
  textId: string
): Promise<string> {
  try {
    const filename = `recordings/${textId}/${Date.now()}.${getExtension(file.type)}`;
    
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });
    
    return blob.url;
  } catch (error) {
    console.error('Audio upload error:', error);
    throw new Error('音声ファイルのアップロードに失敗しました');
  }
}

/**
 * テキストファイルをVercel Blobにアップロード
 */
export async function uploadText(
  content: string,
  textId: string
): Promise<string> {
  try {
    const filename = `texts/${textId}.txt`;
    const textBlob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    
    const blob = await put(filename, textBlob, {
      access: 'public',
      contentType: 'text/plain; charset=utf-8',
    });
    
    return blob.url;
  } catch (error) {
    console.error('Text upload error:', error);
    throw new Error('テキストのアップロードに失敗しました');
  }
}

/**
 * Blobストレージからファイルを削除
 */
export async function deleteBlob(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Blob deletion error:', error);
    throw new Error('ファイルの削除に失敗しました');
  }
}

/**
 * MIMEタイプから拡張子を取得
 */
function getExtension(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp4': 'mp4',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
  };
  
  return mimeMap[mimeType] || 'webm';
}