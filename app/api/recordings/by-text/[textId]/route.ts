import { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { successResponse, errorResponse } from '@/lib/api-helpers';

/**
 * GET /api/recordings/by-text/[textId] - テキストIDで録音取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ textId: string }> }
) {
  try {
    const { textId } = await params;

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
        r.updated_at as "updatedAt"
      FROM recordings r
      WHERE r.text_id = ${textId}
    `;

    // 録音が存在しない場合はnullを返す（エラーではない）
    if (result.rows.length === 0) {
      return successResponse(null);
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse(error);
  }
}