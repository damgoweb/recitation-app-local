import { sql } from '@vercel/postgres';

export { sql };

/**
 * データベースクエリを実行し、結果を返す
 */
export async function query<T = any>(
  queryText: string,
  values?: any[]
): Promise<T[]> {
  try {
    const result = await sql.query(queryText, values);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * 単一行を取得
 */
export async function queryOne<T = any>(
  queryText: string,
  values?: any[]
): Promise<T | null> {
  const rows = await query<T>(queryText, values);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * トランザクション実行
 */
export async function transaction<T>(
  callback: () => Promise<T>
): Promise<T> {
  try {
    await sql`BEGIN`;
    const result = await callback();
    await sql`COMMIT`;
    return result;
  } catch (error) {
    await sql`ROLLBACK`;
    throw error;
  }
}