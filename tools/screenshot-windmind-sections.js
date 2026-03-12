import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  });
  
  const page = await browser.newPage();
  
  console.log('正在導航到 http://localhost:3333...');
  await page.goto('http://localhost:3333', { waitUntil: 'networkidle2' });
  
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  console.log('截圖 1: Hero Section (頂部)');
  await page.screenshot({
    path: path.join(screenshotDir, '01-hero-section.png'),
    fullPage: false
  });
  
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  
  console.log('截圖 2: Featured Product Section');
  await page.screenshot({
    path: path.join(screenshotDir, '02-featured-product.png'),
    fullPage: false
  });
  
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  
  console.log('截圖 3: Projects and Experiments');
  await page.screenshot({
    path: path.join(screenshotDir, '03-projects-experiments.png'),
    fullPage: false
  });
  
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  
  console.log('截圖 4: Build in Public Timeline');
  await page.screenshot({
    path: path.join(screenshotDir, '04-timeline.png'),
    fullPage: false
  });
  
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  
  console.log('截圖 5: Footer Area');
  await page.screenshot({
    path: path.join(screenshotDir, '05-footer.png'),
    fullPage: false
  });
  
  console.log('截圖 6: 完整頁面');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(screenshotDir, '00-full-page.png'),
    fullPage: true
  });
  
  console.log('所有截圖已完成！');
  console.log(`截圖儲存位置: ${screenshotDir}`);
  
  await browser.close();
})();
