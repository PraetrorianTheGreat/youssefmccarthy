const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function debug() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle0' });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log('Testing direct PortfolioI18n call...');
  const res = await page.evaluate(() => {
    window.PortfolioI18n.setLanguage('es');
    return {
      lang: document.documentElement.lang,
      heroSubtitle: document.querySelector('.hero-subtitle').textContent,
      badge: document.querySelector('.lang-code-current').textContent
    };
  });
  console.log('Direct call result:', res);

  console.log('Testing UI click on dropdown item...');
  await page.evaluate(() => {
    window.PortfolioI18n.setLanguage('en');
  });

  await page.click('#langSelectorBtn');
  const isDropdownActive = await page.$eval('#langDropdownMenu', el => el.classList.contains('active'));
  console.log('Dropdown active:', isDropdownActive);

  const esBtn = await page.$('.lang-option-item[data-lang-code="es"]');
  console.log('esBtn exists:', !!esBtn);

  await page.evaluate(() => {
    const btn = document.querySelector('.lang-option-item[data-lang-code="es"]');
    btn.click();
  });

  const afterClick = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    heroSubtitle: document.querySelector('.hero-subtitle').textContent,
    badge: document.querySelector('.lang-code-current').textContent
  }));
  console.log('After UI click result:', afterClick);

  await browser.close();
}

debug();
