import { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { successResponse, errorResponse } from '@/lib/api-helpers';
import { deleteBlob } from '@/lib/blob';
import { NotFoundError } from '@/lib/errors';

/**
 * GET /api/recordings/[id] - 録音詳細取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
        r.updated_at as "updatedAt",
        t.title as "textTitle",
        t.author as "textAuthor"
      FROM recordings r
      JOIN texts t ON r.text_id = t.id
      WHERE r.id = ${id}
    `;

    if (result.rows.length === 0) {
      throw new NotFoundError('録音');
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/recordings/[id] - 録音削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 録音の存在確認
    const checkResult = await sql`
      SELECT id, audio_blob_url as "audioBlobUrl"
      FROM recordings 
      WHERE id = ${id}
    `;

    if (checkResult.rows.length === 0) {
      throw new NotFoundError('録音');
    }

    const recording = checkResult.rows[0];

    // Blobから音声ファイルを削除
    if (recording.audioBlobUrl) {
      try {
        await deleteBlob(recording.audioBlobUrl);
      } catch (blobError) {
        console.warn('Audio blob deletion failed:', blobError);
      }
    }

    // データベースから録音を削除
    await sql`DELETE FROM recordings WHERE id = ${id}`;

    return successResponse({ message: '録音を削除しました' });
  } catch (error) {
    return errorResponse(error);
  }
}