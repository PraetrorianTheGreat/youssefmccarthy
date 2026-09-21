const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function debugEditorial() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8000/AgenticLoop/index.html', { waitUntil: 'networkidle0' });

  console.log('--- Initial State ---');
  console.log('Tag:', await page.$eval('.masthead__tag', el => el.textContent));
  console.log('Headline:', await page.$eval('.hero__headline', el => el.textContent));

  console.log('--- Setting FR via PortfolioI18n ---');
  await page.evaluate(() => window.PortfolioI18n.setLanguage('fr'));
  console.log('FR Tag:', await page.$eval('.masthead__tag', el => el.textContent));
  console.log('FR Headline:', await page.$eval('.hero__headline', el => el.textContent));

  console.log('--- Setting DE via PortfolioI18n ---');
  await page.evaluate(() => window.PortfolioI18n.setLanguage('de'));
  console.log('DE Tag:', await page.$eval('.masthead__tag', el => el.textContent));
  console.log('DE Headline:', await page.$eval('.hero__headline', el => el.textContent));

  console.log('--- Setting EN via PortfolioI18n ---');
  await page.evaluate(() => window.PortfolioI18n.setLanguage('en'));
  console.log('EN Restored Tag:', await page.$eval('.masthead__tag', el => el.textContent));
  console.log('EN Restored Headline:', await page.$eval('.hero__headline', el => el.textContent));

  await browser.close();
}

debugEditorial();
