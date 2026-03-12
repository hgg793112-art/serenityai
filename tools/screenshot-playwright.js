import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('啟動瀏覽器...');
  const browser = await chromium.launch({
    headless: true
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    console.log('正在導航到 http://localhost:3333...');
    await page.goto('http://localhost:3333', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    
    console.log('等待頁面載入完成...');
    await wait(2000);
    
    console.log('截圖 1: Hero Section (頂部)');
    await page.screenshot({
      path: path.join(screenshotDir, '01-hero-section.png')
    });
    console.log('✓ 截圖 1 完成');
    
    console.log('向下滾動...');
    await page.evaluate(() => window.scrollBy(0, 800));
    await wait(1000);
    
    console.log('截圖 2: Featured Product Section');
    await page.screenshot({
      path: path.join(screenshotDir, '02-featured-product.png')
    });
    console.log('✓ 截圖 2 完成');
    
    await page.evaluate(() => window.scrollBy(0, 800));
    await wait(1000);
    
    console.log('截圖 3: Projects and Experiments');
    await page.screenshot({
      path: path.join(screenshotDir, '03-projects-experiments.png')
    });
    console.log('✓ 截圖 3 完成');
    
    await page.evaluate(() => window.scrollBy(0, 800));
    await wait(1000);
    
    console.log('截圖 4: Build in Public Timeline');
    await page.screenshot({
      path: path.join(screenshotDir, '04-timeline.png')
    });
    console.log('✓ 截圖 4 完成');
    
    await page.evaluate(() => window.scrollBy(0, 800));
    await wait(1000);
    
    console.log('截圖 5: Footer Area');
    await page.screenshot({
      path: path.join(screenshotDir, '05-footer.png')
    });
    console.log('✓ 截圖 5 完成');
    
    console.log('返回頂部並截取完整頁面...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(1000);
    await page.screenshot({
      path: path.join(screenshotDir, '00-full-page.png'),
      fullPage: true
    });
    console.log('✓ 完整頁面截圖完成');
    
    console.log('\n所有截圖已完成！');
    console.log(`截圖儲存位置: ${screenshotDir}`);
    console.log('\n生成的截圖：');
    const files = fs.readdirSync(screenshotDir);
    files.forEach(file => {
      const stats = fs.statSync(path.join(screenshotDir, file));
      console.log(`  - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
    
  } catch (error) {
    console.error('錯誤:', error);
  } finally {
    await browser.close();
    console.log('\n瀏覽器已關閉');
  }
})();
