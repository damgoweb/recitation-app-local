const fs = require('fs');
const path = require('path');

// 入力ファイルと出力ディレクトリ
const INPUT_FILE = './recitation-texts-1759554734906.json';
const OUTPUT_DIR = './public/data';
const TEXTS_DIR = path.join(OUTPUT_DIR, 'texts');

// ファイル名のマッピング
const FILE_NAMES = {
  '竹取物語': '01-taketori',
  '平家物語': '02-heike',
  '源氏物語（桐壺）': '03-genji',
  '徒然草（序段・第一段）': '04-tsurezure',
  '枕草子（春はあけぼの）': '05-makura',
  '方丈記': '06-hojoki',
  '更級日記（冒頭）': '07-sarashina',
  '奥の細道（序文）': '08-okunosomichi',
  '古今和歌集（選抜）': '09-kokin',
  '教育勅語': '10-kyoiku-chokugo',
};

// ディレクトリを作成
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ ディレクトリを作成: ${dir}`);
  }
}

// メイン処理
function splitTexts() {
  console.log('📚 テキスト分割スクリプトを開始します...\n');

  // ディレクトリを作成
  ensureDirectoryExists(OUTPUT_DIR);
  ensureDirectoryExists(TEXTS_DIR);

  // JSONファイルを読み込む
  console.log(`📖 入力ファイルを読み込み: ${INPUT_FILE}`);
  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

  // 全作品ファイルをコピー
  const allTextsPath = path.join(OUTPUT_DIR, 'all-texts.json');
  fs.writeFileSync(allTextsPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ 全作品ファイルを作成: ${allTextsPath}\n`);

  // 各テキストを個別ファイルに分割
  console.log('📝 個別ファイルを作成中...');
  data.texts.forEach((text, index) => {
    const fileName = FILE_NAMES[text.title] || `${String(index + 1).padStart(2, '0')}-unknown`;
    const filePath = path.join(TEXTS_DIR, `${fileName}.json`);

    // 個別ファイル用のデータ構造
    const individualData = {
      version: data.version,
      exportedAt: new Date().toISOString(),
      texts: [text],
    };

    fs.writeFileSync(filePath, JSON.stringify(individualData, null, 2), 'utf8');
    console.log(`  ✓ ${fileName}.json - ${text.title}`);
  });

  console.log(`\n✅ 完了: ${data.texts.length}個のファイルを作成しました`);
  console.log(`\n📁 出力先:`);
  console.log(`  - ${allTextsPath}`);
  console.log(`  - ${TEXTS_DIR}/`);
}

// エラーハンドリング
try {
  splitTexts();
} catch (error) {
  console.error('\n❌ エラーが発生しました:', error.message);
  process.exit(1);
}