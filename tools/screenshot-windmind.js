import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:3333...');
  await page.goto('http://localhost:3333', { waitUntil: 'networkidle' });
  
  // 截圖 1: Hero section (頂部)
  console.log('Taking screenshot 1: Hero section');
  await page.screenshot({ 
    path: 'windmind-screenshot-1-hero.png',
    fullPage: false
  });
  
  // 等待一下讓頁面完全載入
  await page.waitForTimeout(1000);
  
  // 截圖 2: 向下滾動到中間區域
  console.log('Scrolling down and taking screenshot 2: Featured products');
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: 'windmind-screenshot-2-featured.png',
    fullPage: false
  });
  
  // 截圖 3: 繼續向下滾動
  console.log('Scrolling down and taking screenshot 3: Projects section');
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: 'windmind-screenshot-3-projects.png',
    fullPage: false
  });
  
  // 截圖 4: 繼續向下滾動到 timeline
  console.log('Scrolling down and taking screenshot 4: Timeline section');
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: 'windmind-screenshot-4-timeline.png',
    fullPage: false
  });
  
  // 截圖 5: 滾動到底部 (footer)
  console.log('Scrolling to bottom and taking screenshot 5: Footer');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: 'windmind-screenshot-5-footer.png',
    fullPage: false
  });
  
  // 額外：全頁截圖
  console.log('Taking full page screenshot');
  await page.screenshot({ 
    path: 'windmind-screenshot-full-page.png',
    fullPage: true
  });
  
  console.log('All screenshots saved successfully!');
  console.log('Files created:');
  console.log('  - windmind-screenshot-1-hero.png');
  console.log('  - windmind-screenshot-2-featured.png');
  console.log('  - windmind-screenshot-3-projects.png');
  console.log('  - windmind-screenshot-4-timeline.png');
  console.log('  - windmind-screenshot-5-footer.png');
  console.log('  - windmind-screenshot-full-page.png');
  
  await browser.close();
})();
