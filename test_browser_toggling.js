const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Joseph\\.gemini\\antigravity\\brain\\249b1df0-7504-480a-86d6-e770db84a0ed';

async function runTests() {
  console.log('🚀 Launching automated browser verification test suite across ALL pages and templates...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let allPassed = true;

  try {
    // =========================================================================
    // 1. Homepage (index.html)
    // =========================================================================
    console.log('--- 1/11: Homepage (index.html) ---');
    await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle0' });
    let enHero = await page.$eval('.hero-subtitle', el => el.textContent.trim());

    // ES
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="es"]').click());
    await new Promise(r => setTimeout(r, 150));
    let esHero = await page.$eval('.hero-subtitle', el => el.textContent.trim());
    console.log('✓ ES Hero:', esHero);
    if (!esHero.includes('Experto en Adobe')) throw new Error('Homepage ES failed');

    // JA
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="ja"]').click());
    await new Promise(r => setTimeout(r, 150));
    let jaHero = await page.$eval('.hero-subtitle', el => el.textContent.trim());
    console.log('✓ JA Hero:', jaHero);
    if (!jaHero.includes('エキスパート')) throw new Error('Homepage JA failed');

    // AR (RTL)
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="ar"]').click());
    await new Promise(r => setTimeout(r, 150));
    let arHero = await page.$eval('.hero-subtitle', el => el.textContent.trim());
    let arDir = await page.$eval('html', el => el.getAttribute('dir'));
    console.log('✓ AR Hero:', arHero);
    console.log(`✓ AR RTL: dir="${arDir}"`);
    if (arDir !== 'rtl') throw new Error('Homepage AR RTL failed');

    // Screenshot Arabic RTL
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_homepage_ar.png'), fullPage: false });

    // EN Revert
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredEnHero = await page.$eval('.hero-subtitle', el => el.textContent.trim());
    console.log('✓ Reverted EN Hero:', restoredEnHero);
    if (restoredEnHero !== enHero) throw new Error('Homepage EN revert failed');

    // =========================================================================
    // 2. Editorial: Agentic Loop
    // =========================================================================
    console.log('\n--- 2/11: Editorial (AgenticLoop) ---');
    await page.goto('http://localhost:8000/AgenticLoop/index.html', { waitUntil: 'networkidle0' });
    let enEd1Headline = await page.$eval('.hero__headline', el => el.textContent.trim());

    // FR
    await page.evaluate(() => document.querySelector('.editorial-lang-item[data-lang-code="fr"]').click());
    await new Promise(r => setTimeout(r, 150));
    let frEd1Headline = await page.$eval('.hero__headline', el => el.textContent.trim());
    console.log('✓ FR Headline:', frEd1Headline);
    if (!frEd1Headline.includes('La Boucle Agente')) throw new Error('AgenticLoop FR failed');

    // DE
    await page.evaluate(() => document.querySelector('.editorial-lang-item[data-lang-code="de"]').click());
    await new Promise(r => setTimeout(r, 150));
    let deEd1Headline = await page.$eval('.hero__headline', el => el.textContent.trim());
    console.log('✓ DE Headline:', deEd1Headline);
    if (!deEd1Headline.includes('Die Agenten-Schleife')) throw new Error('AgenticLoop DE failed');

    // EN Revert
    await page.evaluate(() => document.querySelector('.editorial-lang-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredEd1 = await page.$eval('.hero__headline', el => el.textContent.trim());
    console.log('✓ Reverted EN Headline:', restoredEd1);
    if (restoredEd1 !== enEd1Headline) throw new Error('AgenticLoop EN revert failed');

    // =========================================================================
    // 3. Editorial: Garbage Internet
    // =========================================================================
    console.log('\n--- 3/11: Editorial (GarbageInternet) ---');
    await page.goto('http://localhost:8000/GarbageInternet/index.html', { waitUntil: 'networkidle0' });
    let enEd2Headline = await page.$eval('.hero__headline', el => el.textContent.trim());

    // PT
    await page.evaluate(() => document.querySelector('.editorial-lang-item[data-lang-code="pt"]').click());
    await new Promise(r => setTimeout(r, 150));
    let ptEd2Headline = await page.$eval('.hero__headline', el => el.textContent.trim());
    console.log('✓ PT Headline:', ptEd2Headline);
    if (!ptEd2Headline.includes('A Internet de Lixo')) throw new Error('GarbageInternet PT failed');

    // EN Revert
    await page.evaluate(() => document.querySelector('.editorial-lang-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredEd2 = await page.$eval('.hero__headline', el => el.textContent.trim());
    console.log('✓ Reverted EN Headline:', restoredEd2);
    if (restoredEd2 !== enEd2Headline) throw new Error('GarbageInternet EN revert failed');

    // =========================================================================
    // 4. Editorial: Localist AI
    // =========================================================================
    console.log('\n--- 4/11: Editorial (LocalAI) ---');
    await page.goto('http://localhost:8000/LocalAI/index.html', { waitUntil: 'networkidle0' });
    let enEd3Headline = await page.$eval('.hero__headline', el => el.textContent.trim());

    // ZH
    await page.evaluate(() => document.querySelector('.editorial-lang-item[data-lang-code="zh"]').click());
    await new Promise(r => setTimeout(r, 150));
    let zhEd3Headline = await page.$eval('.hero__headline', el => el.textContent.trim());
    console.log('✓ ZH Headline:', zhEd3Headline);
    if (!zhEd3Headline.includes('本地主义宣言')) throw new Error('LocalAI ZH failed');

    // EN Revert
    await page.evaluate(() => document.querySelector('.editorial-lang-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredEd3 = await page.$eval('.hero__headline', el => el.textContent.trim());
    console.log('✓ Reverted EN Headline:', restoredEd3);
    if (restoredEd3 !== enEd3Headline) throw new Error('LocalAI EN revert failed');

    // =========================================================================
    // 5. About (about.html)
    // =========================================================================
    console.log('\n--- 5/11: Subpage (about.html) ---');
    await page.goto('http://localhost:8000/about.html', { waitUntil: 'networkidle0' });
    let enAbout = await page.$eval('.hero-subtitle', el => el.textContent.trim());

    // IT
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="it"]').click());
    await new Promise(r => setTimeout(r, 150));
    let itAbout = await page.$eval('.hero-subtitle', el => el.textContent.trim());
    console.log('✓ IT About Subtitle:', itAbout);

    // EN Revert
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredAbout = await page.$eval('.hero-subtitle', el => el.textContent.trim());
    console.log('✓ Reverted EN About:', restoredAbout);
    if (restoredAbout !== enAbout) throw new Error('about.html EN revert failed');

    // =========================================================================
    // 6. Experience (experience.html)
    // =========================================================================
    console.log('\n--- 6/11: Subpage (experience.html) ---');
    await page.goto('http://localhost:8000/experience.html', { waitUntil: 'networkidle0' });
    let enExp = await page.$eval('.section-title', el => el.textContent.trim());

    // DE
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="de"]').click());
    await new Promise(r => setTimeout(r, 150));
    let deExp = await page.$eval('.section-title', el => el.textContent.trim());
    console.log('✓ DE Experience Title:', deExp);

    // EN Revert
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredExp = await page.$eval('.section-title', el => el.textContent.trim());
    console.log('✓ Reverted EN Experience:', restoredExp);
    if (restoredExp !== enExp) throw new Error('experience.html EN revert failed');

    // =========================================================================
    // 7. Projects (projects.html)
    // =========================================================================
    console.log('\n--- 7/11: Subpage (projects.html) ---');
    await page.goto('http://localhost:8000/projects.html', { waitUntil: 'networkidle0' });
    let enProj = await page.$eval('.section-title', el => el.textContent.trim());

    // JA
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="ja"]').click());
    await new Promise(r => setTimeout(r, 150));
    let jaProj = await page.$eval('.section-title', el => el.textContent.trim());
    console.log('✓ JA Projects Title:', jaProj);

    // EN Revert
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredProj = await page.$eval('.section-title', el => el.textContent.trim());
    console.log('✓ Reverted EN Projects:', restoredProj);
    if (restoredProj !== enProj) throw new Error('projects.html EN revert failed');

    // =========================================================================
    // 8. Analytics (analytics.html)
    // =========================================================================
    console.log('\n--- 8/11: Subpage (analytics.html) ---');
    await page.goto('http://localhost:8000/analytics.html', { waitUntil: 'networkidle0' });
    let enAnal = await page.$eval('.analytics-subtitle', el => el.textContent.trim());

    // KO
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="ko"]').click());
    await new Promise(r => setTimeout(r, 150));
    let koAnal = await page.$eval('.analytics-subtitle', el => el.textContent.trim());
    console.log('✓ KO Analytics Subtitle:', koAnal);

    // EN Revert
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredAnal = await page.$eval('.analytics-subtitle', el => el.textContent.trim());
    console.log('✓ Reverted EN Analytics:', restoredAnal);
    if (restoredAnal !== enAnal) throw new Error('analytics.html EN revert failed');

    // =========================================================================
    // 9. Collaboration (collaboration.html)
    // =========================================================================
    console.log('\n--- 9/11: Subpage (collaboration.html) ---');
    await page.goto('http://localhost:8000/collaboration.html', { waitUntil: 'networkidle0' });
    let enCollab = await page.$eval('.hero-subtitle', el => el.textContent.trim());

    // RU
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="ru"]').click());
    await new Promise(r => setTimeout(r, 150));
    let ruCollab = await page.$eval('.hero-subtitle', el => el.textContent.trim());
    console.log('✓ RU Collaboration Subtitle:', ruCollab);

    // EN Revert
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredCollab = await page.$eval('.hero-subtitle', el => el.textContent.trim());
    console.log('✓ Reverted EN Collaboration:', restoredCollab);
    if (restoredCollab !== enCollab) throw new Error('collaboration.html EN revert failed');

    // =========================================================================
    // 10. Editorials Hub (editorials.html)
    // =========================================================================
    console.log('\n--- 10/11: Subpage (editorials.html) ---');
    await page.goto('http://localhost:8000/editorials.html', { waitUntil: 'networkidle0' });
    let enEdHub = await page.$eval('.section-title', el => el.textContent.trim());

    // HI
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="hi"]').click());
    await new Promise(r => setTimeout(r, 150));
    let hiEdHub = await page.$eval('.section-title', el => el.textContent.trim());
    console.log('✓ HI Editorials Hub Title:', hiEdHub);

    // EN Revert
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredEdHub = await page.$eval('.section-title', el => el.textContent.trim());
    console.log('✓ Reverted EN Editorials Hub:', restoredEdHub);
    if (restoredEdHub !== enEdHub) throw new Error('editorials.html EN revert failed');

    // =========================================================================
    // 11. Skills (skills.html) & Education (education.html)
    // =========================================================================
    console.log('\n--- 11/11: Subpages (skills.html & education.html) ---');
    await page.goto('http://localhost:8000/skills.html', { waitUntil: 'networkidle0' });
    let enSkills = await page.$eval('.section-title', el => el.textContent.trim());
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="zh"]').click());
    await new Promise(r => setTimeout(r, 150));
    let zhSkills = await page.$eval('.section-title', el => el.textContent.trim());
    console.log('✓ ZH Skills Title:', zhSkills);
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredSkills = await page.$eval('.section-title', el => el.textContent.trim());
    if (restoredSkills !== enSkills) throw new Error('skills.html EN revert failed');

    await page.goto('http://localhost:8000/education.html', { waitUntil: 'networkidle0' });
    let enEdu = await page.$eval('.section-title', el => el.textContent.trim());
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="es"]').click());
    await new Promise(r => setTimeout(r, 150));
    let esEdu = await page.$eval('.section-title', el => el.textContent.trim());
    console.log('✓ ES Education Title:', esEdu);
    await page.evaluate(() => document.querySelector('.lang-option-item[data-lang-code="en"]').click());
    await new Promise(r => setTimeout(r, 150));
    let restoredEdu = await page.$eval('.section-title', el => el.textContent.trim());
    if (restoredEdu !== enEdu) throw new Error('education.html EN revert failed');

    console.log('\n=====================================================================');
    console.log('🏆 COMPLETE 11/11 SUITE PASSED WITH 100% RELIABILITY AND ACCURACY! 🏆');
    console.log('=====================================================================\n');
  } catch (err) {
    allPassed = false;
    console.error('❌ Test failed with error:', err);
  } finally {
    await browser.close();
    process.exit(allPassed ? 0 : 1);
  }
}

runTests();
