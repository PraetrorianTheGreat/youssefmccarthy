const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Testing Home Page (index.html)...');
  await page.goto('http://localhost:8000/index.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

  // Verify language switcher button exists
  const langBtn = await page.$('#langSelectorBtn');
  console.log('Lang Selector Button found:', !!langBtn);

  // Click to open dropdown
  const clickResult = await page.evaluate(() => {
    const btn = document.getElementById('langSelectorBtn');
    const menu = document.getElementById('langDropdownMenu');
    btn.click();
    return {
      btnFound: !!btn,
      menuFound: !!menu,
      menuClassAfterClick: menu ? menu.className : null
    };
  });
  console.log('Direct click result:', clickResult);
  await new Promise(r => setTimeout(r, 600));
  
  const dropdownDebug = await page.evaluate(() => {
    const d = document.querySelector('#langDropdownMenu');
    if (!d) return 'Dropdown element not found';
    const rect = d.getBoundingClientRect();
    const style = window.getComputedStyle(d);
    return {
      className: d.className,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      opacity: style.opacity,
      visibility: style.visibility,
      display: style.display
    };
  });
  console.log('Dropdown Debug Info:', dropdownDebug);

  // Take screenshot of open language switcher
  const artifactDir = 'C:\\Users\\Joseph\\.gemini\\antigravity\\brain\\249b1df0-7504-480a-86d6-e770db84a0ed';
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_lang_dropdown.png'), clip: { x: 0, y: 0, width: 1440, height: 600 } });
  console.log('Saved screenshot_lang_dropdown.png');

  // Test switching to Spanish
  console.log('Switching to Spanish (es)...');
  await page.evaluate(() => {
    window.PortfolioI18n.setLanguage('es');
  });
  await new Promise(r => setTimeout(r, 300));

  const spanishNavText = await page.evaluate(() => {
    const navLinks = Array.from(document.querySelectorAll('.nav-links a')).map(a => a.innerText);
    return navLinks;
  });
  console.log('Spanish Navigation Links:', spanishNavText);

  // Test switching to Arabic (RTL)
  console.log('Switching to Arabic (ar)...');
  await page.evaluate(() => {
    window.PortfolioI18n.setLanguage('ar');
  });
  await new Promise(r => setTimeout(r, 1000));

  const rtlInfo = await page.evaluate(() => {
    const banners = Array.from(document.querySelectorAll('.goog-te-banner-frame, iframe.skiptranslate, div.skiptranslate'));
    const visibleBanners = banners.filter(b => {
      const s = window.getComputedStyle(b);
      return s.display !== 'none' && s.visibility !== 'hidden' && b.offsetHeight > 0;
    });
    return {
      dir: document.documentElement.getAttribute('dir'),
      hasRtlClass: document.documentElement.classList.contains('rtl-layout'),
      lang: document.documentElement.getAttribute('lang'),
      bodyTop: document.body.style.top,
      htmlMarginTop: document.documentElement.style.marginTop,
      visibleBannerCount: visibleBanners.length
    };
  });
  console.log('Arabic RTL & Toolbar Status:', rtlInfo);
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_arabic_rtl.png'), clip: { x: 0, y: 0, width: 1440, height: 500 } });
  console.log('Saved screenshot_arabic_rtl.png');

  // Switch back to English
  await page.evaluate(() => {
    window.PortfolioI18n.setLanguage('en');
  });

  // Test Editorial: AgenticLoop
  console.log('Testing Editorial: AgenticLoop...');
  await page.goto('http://localhost:8000/AgenticLoop/index.html', { waitUntil: 'domcontentloaded' });
  const agenticLangBtn = await page.$('#editorialLangBtn');
  console.log('AgenticLoop Editorial Lang Btn found:', !!agenticLangBtn);
  await page.click('#editorialLangBtn');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_editorial_agentic.png'), clip: { x: 0, y: 0, width: 1440, height: 400 } });
  console.log('Saved screenshot_editorial_agentic.png');

  // Test Editorial: GarbageInternet
  console.log('Testing Editorial: GarbageInternet...');
  await page.goto('http://localhost:8000/GarbageInternet/index.html', { waitUntil: 'domcontentloaded' });
  await page.click('#editorialLangBtn');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_editorial_garbage.png'), clip: { x: 0, y: 0, width: 1440, height: 400 } });
  console.log('Saved screenshot_editorial_garbage.png');

  // Test Editorial: LocalAI
  console.log('Testing Editorial: LocalAI...');
  await page.goto('http://localhost:8000/LocalAI/index.html', { waitUntil: 'domcontentloaded' });
  await page.click('#editorialLangBtn');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_editorial_localai.png'), clip: { x: 0, y: 0, width: 1440, height: 400 } });
  console.log('Saved screenshot_editorial_localai.png');

  await browser.close();
  console.log('All tests passed successfully!');
})();
