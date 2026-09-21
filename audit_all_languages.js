const puppeteer = require('puppeteer-core');

const PAGES = [
  { name: 'Home (index.html)', url: 'http://localhost:8000/index.html', isEditorial: false },
  { name: 'About (about.html)', url: 'http://localhost:8000/about.html', isEditorial: false },
  { name: 'Experience (experience.html)', url: 'http://localhost:8000/experience.html', isEditorial: false },
  { name: 'Projects (projects.html)', url: 'http://localhost:8000/projects.html', isEditorial: false },
  { name: 'Skills (skills.html)', url: 'http://localhost:8000/skills.html', isEditorial: false },
  { name: 'Education (education.html)', url: 'http://localhost:8000/education.html', isEditorial: false },
  { name: 'Analytics (analytics.html)', url: 'http://localhost:8000/analytics.html', isEditorial: false },
  { name: 'UX Collaboration (collaboration.html)', url: 'http://localhost:8000/collaboration.html', isEditorial: false },
  { name: 'Editorials Hub (editorials.html)', url: 'http://localhost:8000/editorials.html', isEditorial: false },
  { name: 'Editorial: AgenticLoop', url: 'http://localhost:8000/AgenticLoop/index.html', isEditorial: true },
  { name: 'Editorial: GarbageInternet', url: 'http://localhost:8000/GarbageInternet/index.html', isEditorial: true },
  { name: 'Editorial: LocalAI', url: 'http://localhost:8000/LocalAI/index.html', isEditorial: true }
];

const LANGUAGES = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'pt', 'ru', 'it', 'hi', 'ko'];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let totalChecks = 0;
  let passedChecks = 0;
  const errors = [];

  console.log(`Starting comprehensive audit of ${PAGES.length} pages across ${LANGUAGES.length} languages...\n`);

  for (const pageInfo of PAGES) {
    console.log(`------------------------------------------------------------`);
    console.log(`Testing Page: ${pageInfo.name} (${pageInfo.url})`);
    
    try {
      await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 600));

      // 1. Check if language selector container and button exists
      const selectorInfo = await page.evaluate((isEditorial) => {
        const btnSelector = isEditorial ? '#editorialLangBtn' : '#langSelectorBtn';
        const btn = document.querySelector(btnSelector);
        const codeEl = isEditorial ? document.querySelector('.editorial-lang-code') : document.querySelector('.lang-code-current');
        const flagEl = isEditorial ? document.querySelector('.editorial-lang-flag img') : document.querySelector('.lang-flag-current img');
        return {
          btnFound: !!btn,
          btnText: btn ? btn.innerText.trim() : null,
          codeFound: !!codeEl,
          flagFound: !!flagEl,
          i18nLoaded: !!window.PortfolioI18n
        };
      }, pageInfo.isEditorial);

      totalChecks += 4;
      if (selectorInfo.btnFound) {
        passedChecks++;
      } else {
        errors.push(`[${pageInfo.name}] Language button not found`);
      }
      if (selectorInfo.codeFound) passedChecks++;
      else errors.push(`[${pageInfo.name}] Language code badge not found`);

      if (selectorInfo.flagFound) passedChecks++;
      else errors.push(`[${pageInfo.name}] Flag image not found`);

      if (selectorInfo.i18nLoaded) passedChecks++;
      else errors.push(`[${pageInfo.name}] window.PortfolioI18n not initialized`);

      // 2. Test switching through all 12 languages on this page
      for (const lang of LANGUAGES) {
        totalChecks++;
        const switchResult = await page.evaluate((targetLang, isEditorial) => {
          window.PortfolioI18n.setLanguage(targetLang);
          const current = window.PortfolioI18n.getCurrentLanguage();
          const docLang = document.documentElement.getAttribute('lang');
          const docDir = document.documentElement.getAttribute('dir');
          const hasRtl = document.documentElement.classList.contains('rtl-layout');
          const codeEl = isEditorial ? document.querySelector('.editorial-lang-code') : document.querySelector('.lang-code-current');
          const flagEl = isEditorial ? document.querySelector('.editorial-lang-flag img') : document.querySelector('.lang-flag-current img');
          const localStored = localStorage.getItem('portfolio_preferred_lang');

          const expectedDir = targetLang === 'ar' ? 'rtl' : 'ltr';
          const expectedRtl = targetLang === 'ar';
          const badgeMatches = codeEl && codeEl.textContent.trim().toUpperCase() === targetLang.toUpperCase();
          const flagMatches = flagEl && flagEl.src.includes(targetLang === 'en' ? 'us' : (targetLang === 'zh' ? 'cn' : (targetLang === 'ja' ? 'jp' : (targetLang === 'ko' ? 'kr' : (targetLang === 'hi' ? 'in' : (targetLang === 'ar' ? 'sa' : (targetLang === 'pt' ? 'br' : targetLang)))))));

          // Check if any nav link or header changed
          let navSample = '';
          const firstNavLink = document.querySelector('.nav-links a, .masthead-tag');
          if (firstNavLink) navSample = firstNavLink.innerText.trim();

          // Check Google translate toolbar suppression
          const bodyTop = document.body ? document.body.style.top : '';

          const isSuccess = current === targetLang &&
            docLang === targetLang &&
            docDir === expectedDir &&
            hasRtl === expectedRtl &&
            badgeMatches &&
            localStored === targetLang;

          return {
            isSuccess,
            current,
            docLang,
            docDir,
            hasRtl,
            badgeMatches,
            flagMatches,
            localStored,
            navSample,
            bodyTop
          };
        }, lang, pageInfo.isEditorial);

        if (switchResult.isSuccess) {
          passedChecks++;
        } else {
          errors.push(`[${pageInfo.name}] Switching to '${lang}' failed: ${JSON.stringify(switchResult)}`);
        }
      }

      console.log(`  ✓ Checked all 12 languages on ${pageInfo.name}`);

    } catch (err) {
      errors.push(`[${pageInfo.name}] Unhandled error: ${err.message}`);
    }
  }

  await browser.close();

  console.log(`\n============================================================`);
  console.log(`AUDIT COMPLETE: ${passedChecks}/${totalChecks} checks passed.`);
  if (errors.length === 0) {
    console.log(`ALL 12 LANGUAGES SWITCHED CORRECTLY ACROSS ALL 12 PAGES! 🎉`);
  } else {
    console.log(`Errors found (${errors.length}):`);
    errors.forEach(e => console.error(` - ${e}`));
  }
  console.log(`============================================================`);
})();
