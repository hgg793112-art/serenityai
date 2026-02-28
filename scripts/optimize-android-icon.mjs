#!/usr/bin/env node
/**
 * 將 Android 啟動圖標縮成 512×512 並壓縮 PNG，減小 APK 體積。
 * 使用方式：在專案根目錄執行 node scripts/optimize-android-icon.mjs
 * 可選參數：--size=768 則輸出 768×768
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ICON_PATH = path.join(ROOT, 'android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png');

const sizeArg = process.argv.find((a) => a.startsWith('--size='));
const SIZE = sizeArg ? parseInt(sizeArg.split('=')[1], 10) : 512;
if (!Number.isFinite(SIZE) || SIZE < 48 || SIZE > 1024) {
  console.error('無效的 --size=，請使用 48～1024 之間的數字，例如 --size=768');
  process.exit(1);
}

async function main() {
  if (!fs.existsSync(ICON_PATH)) {
    console.error('找不到圖標檔案：', ICON_PATH);
    process.exit(1);
  }

  const statBefore = fs.statSync(ICON_PATH);
  const sizeBeforeMB = (statBefore.size / 1024 / 1024).toFixed(2);

  const buffer = await sharp(ICON_PATH)
    .resize(SIZE, SIZE)
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  fs.writeFileSync(ICON_PATH, buffer);
  const statAfter = fs.statSync(ICON_PATH);
  const sizeAfterKB = (statAfter.size / 1024).toFixed(1);

  console.log('Android 啟動圖標已優化');
  console.log('  路徑:', path.relative(ROOT, ICON_PATH));
  console.log('  尺寸:', SIZE + '×' + SIZE);
  console.log('  優化前:', sizeBeforeMB, 'MB');
  console.log('  優化後:', sizeAfterKB, 'KB');
  console.log('  請重新打包 APK（本機 build 或推送到 GitHub Actions）');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
