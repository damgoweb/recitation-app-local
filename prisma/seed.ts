import { sql } from '@vercel/postgres';
import { initialTexts } from './data/initial-texts';
import * as dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config({ path: '.env.local' });

async function seed() {
  console.log('🌱 Starting seed...');

  try {
    for (const text of initialTexts) {
      console.log(`📝 Seeding: ${text.title}`);

      // テキストをデータベースに挿入（IDは自動生成）
      await sql`
        INSERT INTO texts (title, author, content, preview, is_custom, created_at, updated_at)
        VALUES (
          ${text.title},
          ${text.author},
          ${text.content},
          ${text.preview},
          false,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `;

      console.log(`✅ ${text.title} seeded`);
    }

    console.log('🎉 Seed completed successfully!');

    // 確認
    const result = await sql`SELECT COUNT(*) as count FROM texts WHERE is_custom = false`;
    console.log(`📊 Total initial texts: ${result.rows[0].count}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });