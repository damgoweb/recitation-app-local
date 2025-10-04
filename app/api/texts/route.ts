import { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { successResponse, errorResponse } from '@/lib/api-helpers';
import { validateCreateText } from '@/lib/validation';
import { uploadText } from '@/lib/blob';
import { ValidationError, DatabaseError } from '@/lib/errors';

/**
 * GET /api/texts - テキスト一覧取得
 */
export async function GET() {
  try {
    // テキスト一覧を取得（録音情報も含む）
    const result = await sql`
      SELECT 
        t.id,
        t.title,
        t.author,
        t.preview,
        t.is_custom as "isCustom",
        t.created_at as "createdAt",
        CASE WHEN r.id IS NOT NULL THEN true ELSE false END as "hasRecording",
        r.recorded_at as "recordedAt"
      FROM texts t
      LEFT JOIN recordings r ON t.id = r.text_id
      ORDER BY t.created_at DESC
    `;

    return successResponse(result.rows);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/texts - テキスト作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    const validation = validateCreateText(body);
    if (!validation.success) {
      throw new ValidationError(
        'バリデーションエラー',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { title, author, content } = validation.data;

    // プレビュー作成（最初の50文字）
    const preview = content.substring(0, 50) + (content.length > 50 ? '...' : '');

    // トランザクション開始
    const result = await sql`
      INSERT INTO texts (title, author, content, preview, is_custom)
      VALUES (${title}, ${author || null}, ${content}, ${preview}, true)
      RETURNING 
        id,
        title,
        author,
        content,
        preview,
        is_custom as "isCustom",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    if (result.rows.length === 0) {
      throw new DatabaseError('テキストの作成に失敗しました');
    }

    const newText = result.rows[0];

    // Vercel Blobにテキストをアップロード
    try {
      const blobUrl = await uploadText(content, newText.id);
      
      // blob_urlを更新
      await sql`
        UPDATE texts 
        SET blob_url = ${blobUrl}
        WHERE id = ${newText.id}
      `;

      newText.blobUrl = blobUrl;
    } catch (uploadError) {
      console.warn('Blob upload failed, but text was created:', uploadError);
      // アップロード失敗してもテキストは作成済みなので続行
    }

    return successResponse(newText, 201);
  } catch (error) {
    return errorResponse(error);
  }
}