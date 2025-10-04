import { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { successResponse, errorResponse } from '@/lib/api-helpers';

/**
 * GET /api/export/texts - すべてのテキストをエクスポート
 */
export async function GET(request: NextRequest) {
  try {
    const result = await sql`
      SELECT 
        id,
        title,
        author,
        content,
        is_custom as "isCustom",
        created_at as "createdAt"
      FROM texts
      ORDER BY created_at ASC
    `;

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      texts: result.rows,
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="recitation-texts-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}