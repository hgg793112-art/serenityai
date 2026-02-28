#!/usr/bin/env node
/**
 * 生成符合產品調性的啟動頁（薰衣草紫漸層 + 小寧圖標居中）
 * 用法：node scripts/generate-splash.mjs
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ICON_PATH = path.join(ROOT, 'android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png');

const SIZES = {
  'drawable': { w: 480, h: 800 },
  'drawable-port-mdpi': { w: 320, h: 480 },
  'drawable-port-hdpi': { w: 480, h: 800 },
  'drawable-port-xhdpi': { w: 720, h: 1280 },
  'drawable-port-xxhdpi': { w: 1080, h: 1920 },
  'drawable-port-xxxhdpi': { w: 1440, h: 2560 },
  'drawable-land-mdpi': { w: 480, h: 320 },
  'drawable-land-hdpi': { w: 800, h: 480 },
  'drawable-land-xhdpi': { w: 1280, h: 720 },
  'drawable-land-xxhdpi': { w: 1920, h: 1080 },
  'drawable-land-xxxhdpi': { w: 2560, h: 1440 },
};

async function generateSplash() {
  const iconExists = fs.existsSync(ICON_PATH);
  let iconBuffer;
  if (iconExists) {
    iconBuffer = await sharp(ICON_PATH)
      .resize(192, 192)
      .png()
      .toBuffer();
  }

  for (const [folder, { w, h }] of Object.entries(SIZES)) {
    const bgSvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#faf8ff"/>
      <stop offset="35%" stop-color="#f0ebf8"/>
      <stop offset="70%" stop-color="#e8e0f5"/>
      <stop offset="100%" stop-color="#f5f0fc"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <text x="${w / 2}" y="${h / 2 + (iconExists ? 130 : 10)}" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="${Math.round(w * 0.06)}" fill="#7c6ba8">小寧陪你</text>
  <text x="${w / 2}" y="${h / 2 + (iconExists ? 165 : 45)}" text-anchor="middle" font-family="sans-serif" font-weight="400" font-size="${Math.round(w * 0.03)}" fill="#9b87c4">寧靜島 · 你的情緒小夥伴</text>
</svg>`;

    let image = sharp(Buffer.from(bgSvg));

    if (iconExists) {
      const iconResized = await sharp(iconBuffer)
        .resize(Math.round(Math.min(w, h) * 0.28), Math.round(Math.min(w, h) * 0.28))
        .png()
        .toBuffer();
      const iconSize = Math.round(Math.min(w, h) * 0.28);
      image = image.composite([{
        input: iconResized,
        left: Math.round((w - iconSize) / 2),
        top: Math.round((h - iconSize) / 2 - 40),
      }]);
    }

    const outDir = path.join(ROOT, 'android/app/src/main/res', folder);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'splash.png');
    await image.png({ compressionLevel: 9 }).toFile(outPath);
    const stat = fs.statSync(outPath);
    console.log(`  ${folder}/splash.png  ${w}x${h}  ${(stat.size / 1024).toFixed(1)} KB`);
  }
  console.log('\n啟動頁已生成，與產品薰衣草紫調性一致。');
}

generateSplash().catch(e => { console.error(e); process.exit(1); });
