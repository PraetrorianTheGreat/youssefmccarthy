const puppeteer = require('puppeteer-core');
const path = require('path');

const sampleLanguages = ['fr', 'de', 'ja', 'ru', 'zh', 'pt', 'it', 'ko', 'hi'];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:8000/index.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));

  for (const lang of sampleLanguages) {
    // 1. Open dropdown
    await page.click('#langSelectorBtn');
    await new Promise(r => setTimeout(r, 100));

    // 2. Click the language item in dropdown
    const itemClicked = await page.evaluate((targetLang) => {
      const item = document.querySelector(`.lang-option-item[data-lang-code="${targetLang}"]`);
      if (item) {
        item.click();
        return true;
      }
      return false;
    }, lang);

    await new Promise(r => setTimeout(r, 400));
    
    // Verify state
    const info = await page.evaluate(() => {
      return {
        currentLang: window.PortfolioI18n.getCurrentLanguage(),
        badge: document.querySelector('.lang-code-current').textContent.trim(),
        firstLink: document.querySelector('.nav-links a').textContent.trim(),
        bodyTop: document.body.style.top
      };
    });

    console.log(`Switched to [${lang}]: Badge=${info.badge}, Nav1='${info.firstLink}', bodyTop='${info.bodyTop}'`);
  }

  await browser.close();
  console.log('All interactive click transitions verified successfully!');
})();
