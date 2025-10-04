import { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { successResponse, errorResponse } from '@/lib/api-helpers';
import { validateUpdateText } from '@/lib/validation';
import { uploadText, deleteBlob } from '@/lib/blob';
import { NotFoundError, ValidationError, DatabaseError } from '@/lib/errors';

/**
 * GET /api/texts/[id] - テキスト詳細取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await sql`
      SELECT 
        id,
        title,
        author,
        content,
        preview,
        is_custom as "isCustom",
        blob_url as "blobUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM texts
      WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      throw new NotFoundError('テキスト');
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/texts/[id] - テキスト更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // バリデーション
    const validation = validateUpdateText(body);
    if (!validation.success) {
      throw new ValidationError(
        'バリデーションエラー',
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updates = validation.data;

    // テキストの存在確認
    const checkResult = await sql`
      SELECT id, is_custom as "isCustom", blob_url as "blobUrl"
      FROM texts 
      WHERE id = ${id}
    `;

    if (checkResult.rows.length === 0) {
      throw new NotFoundError('テキスト');
    }

    const existingText = checkResult.rows[0];

    // カスタムテキストのみ編集可能
    if (!existingText.isCustom) {
      throw new ValidationError('初期搭載テキストは編集できません');
    }

    // 更新するフィールドを構築
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      updateValues.push(updates.title);
    }

    if (updates.author !== undefined) {
      updateFields.push(`author = $${paramCount++}`);
      updateValues.push(updates.author || null);
    }

    if (updates.content !== undefined) {
      updateFields.push(`content = $${paramCount++}`);
      updateValues.push(updates.content);

      // プレビューも更新
      const preview = updates.content.substring(0, 50) + 
        (updates.content.length > 50 ? '...' : '');
      updateFields.push(`preview = $${paramCount++}`);
      updateValues.push(preview);

      // Blobも更新
      try {
        // 古いBlobを削除
        if (existingText.blobUrl) {
          await deleteBlob(existingText.blobUrl);
        }

        // 新しいBlobをアップロード
        const newBlobUrl = await uploadText(updates.content, id);
        updateFields.push(`blob_url = $${paramCount++}`);
        updateValues.push(newBlobUrl);
      } catch (uploadError) {
        console.warn('Blob update failed:', uploadError);
      }
    }

    if (updateFields.length === 0) {
      throw new ValidationError('更新するフィールドが指定されていません');
    }

    // 更新実行
    updateValues.push(id);
    const updateQuery = `
      UPDATE texts 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING 
        id,
        title,
        author,
        content,
        preview,
        is_custom as "isCustom",
        blob_url as "blobUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await sql.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      throw new DatabaseError('テキストの更新に失敗しました');
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/texts/[id] - テキスト削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // テキストの存在確認
    const checkResult = await sql`
      SELECT id, is_custom as "isCustom", blob_url as "blobUrl"
      FROM texts 
      WHERE id = ${id}
    `;

    if (checkResult.rows.length === 0) {
      throw new NotFoundError('テキスト');
    }

    const text = checkResult.rows[0];

    // カスタムテキストのみ削除可能
    if (!text.isCustom) {
      throw new ValidationError('初期搭載テキストは削除できません');
    }

    // Blobを削除
    if (text.blobUrl) {
      try {
        await deleteBlob(text.blobUrl);
      } catch (blobError) {
        console.warn('Blob deletion failed:', blobError);
      }
    }

    // テキストを削除（録音も CASCADE で自動削除される）
    await sql`DELETE FROM texts WHERE id = ${id}`;

    return successResponse({ message: 'テキストを削除しました' });
  } catch (error) {
    return errorResponse(error);
  }
}