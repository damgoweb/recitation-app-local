import { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { successResponse, errorResponse } from '@/lib/api-helpers';
import { validateCreateRecording } from '@/lib/validation';
import { uploadAudio } from '@/lib/blob';
import { ValidationError, NotFoundError, DatabaseError } from '@/lib/errors';

/**
 * GET /api/recordings - 録音一覧取得
 */
export async function GET() {
  try {
    const result = await sql`
      SELECT 
        r.id,
        r.text_id as "textId",
        r.audio_blob_url as "audioBlobUrl",
        r.duration,
        r.file_size as "fileSize",
        r.mime_type as "mimeType",
        r.recorded_at as "recordedAt",
        r.created_at as "createdAt",
        t.title as "textTitle"
      FROM recordings r
      JOIN texts t ON r.text_id = t.id
      ORDER BY r.recorded_at DESC
    `;

    return successResponse(result.rows);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/recordings - 録音作成・アップロード
 */
export async function POST(request: NextRequest) {
  try {
    // FormDataを取得
    const formData = await request.formData();
    
    const textId = formData.get('textId') as string;
    const audioFile = formData.get('audioFile') as File;
    const duration = Number(formData.get('duration'));
    const recordedAt = formData.get('recordedAt') as string;

    // 基本的なバリデーション
    if (!textId || !audioFile || !duration || !recordedAt) {
      throw new ValidationError('必須フィールドが不足しています');
    }

    // 詳細なバリデーション
    const validation = validateCreateRecording({
      textId,
      duration,
      fileSize: audioFile.size,
      mimeType: audioFile.type,
      recordedAt,
    });

    if (!validation.success) {
      throw new ValidationError(
        'バリデーションエラー',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // テキストの存在確認
    const textCheck = await sql`
      SELECT id FROM texts WHERE id = ${textId}
    `;

    if (textCheck.rows.length === 0) {
      throw new NotFoundError('テキスト');
    }

    // 既存の録音を確認（上書き）
    const existingRecording = await sql`
      SELECT id, audio_blob_url as "audioBlobUrl"
      FROM recordings 
      WHERE text_id = ${textId}
    `;

    // 音声ファイルをVercel Blobにアップロード
    const audioBlobUrl = await uploadAudio(audioFile, textId);

    let result;

    if (existingRecording.rows.length > 0) {
      // 既存の録音を更新
      const oldRecording = existingRecording.rows[0];
      
      result = await sql`
        UPDATE recordings
        SET 
          audio_blob_url = ${audioBlobUrl},
          duration = ${duration},
          file_size = ${audioFile.size},
          mime_type = ${audioFile.type},
          recorded_at = ${recordedAt},
          updated_at = CURRENT_TIMESTAMP
        WHERE text_id = ${textId}
        RETURNING 
          id,
          text_id as "textId",
          audio_blob_url as "audioBlobUrl",
          duration,
          file_size as "fileSize",
          mime_type as "mimeType",
          recorded_at as "recordedAt",
          created_at as "createdAt"
      `;

      // 古い音声ファイルを削除（非同期・エラーは無視）
      if (oldRecording.audioBlobUrl) {
        import('@/lib/blob').then(({ deleteBlob }) => {
          deleteBlob(oldRecording.audioBlobUrl).catch(err => 
            console.warn('Old audio deletion failed:', err)
          );
        });
      }
    } else {
      // 新規録音を作成
      result = await sql`
        INSERT INTO recordings (text_id, audio_blob_url, duration, file_size, mime_type, recorded_at)
        VALUES (${textId}, ${audioBlobUrl}, ${duration}, ${audioFile.size}, ${audioFile.type}, ${recordedAt})
        RETURNING 
          id,
          text_id as "textId",
          audio_blob_url as "audioBlobUrl",
          duration,
          file_size as "fileSize",
          mime_type as "mimeType",
          recorded_at as "recordedAt",
          created_at as "createdAt"
      `;
    }

    if (result.rows.length === 0) {
      throw new DatabaseError('録音の保存に失敗しました');
    }

    return successResponse(result.rows[0], 201);
  } catch (error) {
    return errorResponse(error);
  }
}

// ファイルサイズ制限を設定（100MB）
export const config = {
  api: {
    bodyParser: false,
  },
};