/**
 * Youssef McCarthy Portfolio — Internationalization & Multi-Language Engine (i18n)
 * Supports 12 Major World Languages with high-resolution flag icons,
 * instant full-DOM text replacement, RTL engine, and persistent session state.
 */

(function () {
  'use strict';

  // 1. Language Definitions with national flag codes and writing direction
  const LANGUAGES = [
    { code: 'en', country: 'us', flag: '🇺🇸', name: 'English', nativeName: 'English', dir: 'ltr' , accent: '#3C3B6E' },
    { code: 'es', country: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español', dir: 'ltr' , accent: '#F1BF00' },
    { code: 'fr', country: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français', dir: 'ltr' , accent: '#0055A4' },
    { code: 'de', country: 'de', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch', dir: 'ltr' , accent: '#E4002B' },
    { code: 'zh', country: 'cn', flag: '🇨🇳', name: 'Chinese', nativeName: '简体中文', dir: 'ltr', gtCode: 'zh-CN' , accent: '#D81E06' },
    { code: 'ja', country: 'jp', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語', dir: 'ltr' , accent: '#BC002D' },
    { code: 'ar', country: 'sa', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' , accent: '#006C35' },
    { code: 'pt', country: 'br', flag: '🇧🇷', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' , accent: '#00A650' },
    { code: 'ru', country: 'ru', flag: '🇷🇺', name: 'Russian', nativeName: 'Русский', dir: 'ltr' , accent: '#0039A6' },
    { code: 'it', country: 'it', flag: '🇮🇹', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' , accent: '#008C45' },
    { code: 'hi', country: 'in', flag: '🇮🇳', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' , accent: '#FF9933' },
    { code: 'ko', country: 'kr', flag: '🇰🇷', name: 'Korean', nativeName: '한국어', dir: 'ltr' , accent: '#CD2E3A' }
  ];

  /* Signature colour per language, taken from its flag. Raw flag colours fail
     WCAG 1.4.11 (3:1 for UI components) against one theme or the other -- US
     navy scores 1.81:1 on the dark dropdown -- so each has a lightness-adjusted
     variant per surface. Both are emitted; CSS picks by theme. All >= 3.49:1. */
  const ACCENT_BY_THEME = {
    en: { onDark: '#6563AC', onLight: '#3C3B6E' },
    es: { onDark: '#F1BF00', onLight: '#A48200' },
    fr: { onDark: '#006ACD', onLight: '#0055A4' },
    de: { onDark: '#E4002B', onLight: '#E4002B' },
    zh: { onDark: '#D81E06', onLight: '#D81E06' },
    ja: { onDark: '#DB0034', onLight: '#BC002D' },
    ar: { onDark: '#00803F', onLight: '#006C35' },
    pt: { onDark: '#00A650', onLight: '#009C4B' },
    ru: { onDark: '#085DFF', onLight: '#0039A6' },
    it: { onDark: '#008C45', onLight: '#008C45' },
    hi: { onDark: '#FF9933', onLight: '#D66B00' },
    ko: { onDark: '#CD2E3A', onLight: '#CD2E3A' }
  };

  function rgbParts(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function accentVars(langObj) {
    if (!langObj) return '';
    const pair = ACCENT_BY_THEME[langObj.code];
    if (!pair) return '';
    const [dr, dg, db] = rgbParts(pair.onDark);
    const [lr, lg, lb] = rgbParts(pair.onLight);
    /* Selected is deliberately ~2.5x the hover tint so the two states are never
       mistaken for one another (hover and selected must be distinguishable). */
    return `--lang-accent-d:${pair.onDark};--lang-accent-l:${pair.onLight};` +
           `--lang-hover-d:rgba(${dr},${dg},${db},0.12);--lang-hover-l:rgba(${lr},${lg},${lb},0.10);` +
           `--lang-sel-d:rgba(${dr},${dg},${db},0.30);--lang-sel-l:rgba(${lr},${lg},${lb},0.20);`;
  }

  function getFlagHtml(langObj, className = 'lang-flag-img') {
    if (!langObj) return '';
    /* Real flag artwork, with the Unicode flag as a fallback if the image
       cannot load (offline, blocked CDN) so it never renders as a broken icon. */
    const fallback = `<span class=\"${className} lang-flag-fallback\" role=\"img\" aria-label=\"${langObj.name}\">${langObj.flag}</span>`;
    return `<img src="https://flagcdn.com/w40/${langObj.country}.png" srcset="https://flagcdn.com/w80/${langObj.country}.png 2x" width="18" height="13" alt="${langObj.name}" class="${className}" loading="lazy" onerror="this.onerror=null; if(this.parentNode){this.outerHTML=this.getAttribute('data-fallback');}" data-fallback="${fallback.replace(/"/g, '&quot;')}">`;
  }

  // 2. High-Precision Curated UI Translation Dictionary
  const TRANSLATIONS = {
    en: {
      'skip.content': 'Skip to content',
      "chat.greeting2": "Hello! 👋 I'm Youssef's <strong>Site-Wide AI Copilot</strong>.<br><br>\n          I can guide you through every page, provide deep analytical &amp; CRO insights, or navigate you directly anywhere on the site.",
      "chat.placeholder2": "Ask about navigation, GA4, CRO, career...",
      "chat.chip.navigate": "🗺️ Site Navigation",
      "chat.chip.cro2": "📈 CRO &amp; A/B Testing",
      "chat.chip.experience2": "💼 14+ Yrs Career",
      "chat.chip.dashboard": "🚀 Live Dashboard",
      "chat.chip.collab": "🎨 UX Synergy",
      "chat.chip.skills": "🛠️ Tech Stack",
      "chat.chip.education": "🎓 Recommendations",
      "chat.subtitle": "Direct Interactive Guide",
      "chat.greeting": "Hi! I'm Youssef's strategic AI guide. Ask me anything about his GA4 metrics, CRO tests, agentic loop architectures, or explore his portfolio directly. I can navigate you across his portfolio using direct jumping links!",
      "chat.placeholder": "Type a message or click a prompt...",
      "chat.thinking": "Thinking...",
      "chat.loading_previews": "Loading editorial previews...",
      "chat.open": "Open AI Assistant",
      "chat.close": "Close assistant",
      "chat.reply_note": "The assistant currently replies in English.",
      "chat.chip.editorials": "📝 Editorials",
      "chat.chip.ga4": "📊 GA4 & Analytics",
      "chat.chip.cro": "📈 CRO Strategy",
      "chat.chip.ai": "🤖 Agentic Loop",
      "chat.chip.local": "🔒 Localist AI",
      "chat.chip.experience": "💼 Experience",
      'nav.home': 'Home', 'nav.about': 'About', 'nav.experience': 'Experience', 'nav.projects': 'Projects', 'nav.analytics': 'Live Dashboard', 'nav.collaboration': 'UX Collaboration', 'nav.editorials': 'Editorials', 'nav.skills': 'Skills', 'nav.education': 'Education & Recommendations',
      'nav_home': 'Home', 'nav_about': 'About', 'nav_experience': 'Experience', 'nav_projects': 'Projects', 'nav_analytics': 'Live Dashboard', 'nav_collaboration': 'UX Collaboration', 'nav_editorials': 'Editorials', 'nav_skills': 'Skills', 'nav_education': 'Education & Recommendations', 'nav_work': 'Work', 'nav_skills_education': 'Skills & Education',
      'next.label': 'Next', 'next.back_home': 'Back to Home',
      'theme.dark': 'Dark', 'theme.light': 'Light', 'bg.toggle': 'Try new background', 'bg.caution': 'Caution: Performance heavy',
      'lang.select': 'Select Language', 'lang.search_placeholder': 'Search language...',
      'hero.badge': 'Biography & Strategy', 'hero.role': 'Senior Digital Experience Specialist at Repligen', 'hero.view_experience': 'View Work History', 'hero.explore_analytics': 'Explore Live Analytics', 'hero.read_case_study': 'Read Case Study',
      'cta.back_editorials': 'Back to Editorials', 'cta.listen_article': 'Listen to Article', 'cta.listen_case_study': 'Listen to Case Study', 'cta.close': 'Close',
      'editorial.masthead_tag': 'Strategy &mdash; Case Study', 'editorial.slop_tag': 'AI Strategy &mdash; Essay', 'editorial.local_tag': 'AI Engineering &mdash; Architecture', 'editorial.next_essay': 'Next essay'
    }
  };

  // 3. Site-Wide Comprehensive Phrase Dictionary for Full-DOM Translation
  /* Every other language's TRANSLATIONS and PHRASES live in i18n/<code>.js and are
     added here by register() when that language is first needed. English needs
     neither: its text is already in the HTML. */
  const PHRASES = {};

  // 4. Clean & Normalize string helper for phrase matching
  function cleanText(str) {
    if (!str) return '';
    return str
      .replace(/<br\s*[\/]?>/gi, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&mdash;/g, '—')
      .replace(/&lsquo;|&rsquo;/g, "'")
      .replace(/&ldquo;|&rdquo;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 5. Sound Feedback Engine (Web Audio API)
  function playSoundFeedback() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // 6. Universal Full-DOM Text & Markup Translation Engine
  const STORAGE_KEY = 'portfolio_preferred_lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
  let appliedLang = 'en'; // the language the page text is actually showing

  /* On-demand dictionaries. Each non-English language lives in i18n/<code>.js next
     to this file, carries this file's ?v= so one bump busts both, and is requested
     only when that language is picked or restored. English never requests one. */
  const SELF_SRC = (document.currentScript && document.currentScript.src) ||
    (Array.from(document.scripts).map(s => s.src).find(s => /\/i18n\.js(\?|$)/.test(s)) || '');
  const DICT_VERSION = (SELF_SRC.match(/[?&]v=([^&#]+)/) || [])[1] || '';
  const dictLoads = {};

  function loadDictionary(code) {
    if (code === 'en' || (TRANSLATIONS[code] && PHRASES[code])) return Promise.resolve();
    if (dictLoads[code]) return dictLoads[code];
    dictLoads[code] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = new URL('i18n/' + code + '.js', SELF_SRC || document.baseURI).href +
        (DICT_VERSION ? '?v=' + DICT_VERSION : '');
      s.async = true;
      s.onload = () => (TRANSLATIONS[code] ? resolve() : reject(new Error('empty dictionary')));
      s.onerror = () => reject(new Error('could not load ' + s.src));
      document.head.appendChild(s);
    }).catch(err => {
      delete dictLoads[code]; // allow a later retry
      throw err;
    });
    return dictLoads[code];
  }

  function registerDictionary(code, translations, phrases) {
    TRANSLATIONS[code] = translations || {};
    PHRASES[code] = phrases || {};
  }

  /* The assistant's replies are generated in English. Rather than leave a
     non-English visitor guessing, state it once inside the chat window, in
     their language, and drop the notice again when they return to English. */
  function updateChatLanguageNotice(langObj) {
    const win = document.getElementById('aiChatWindow');
    if (!win) return;
    let note = win.querySelector('.ai-lang-note');
    if (langObj.code === 'en') { if (note) note.remove(); return; }
    if (!note) {
      note = document.createElement('p');
      note.className = 'ai-lang-note';
      note.setAttribute('role', 'note');
      const body = win.querySelector('.ai-chat-body');
      if (body && body.parentNode) body.parentNode.insertBefore(note, body);
      else win.appendChild(note);
    }
    const dict = TRANSLATIONS[langObj.code] || TRANSLATIONS.en;
    note.textContent = dict['chat.reply_note'] || TRANSLATIONS.en['chat.reply_note'];
    note.setAttribute('dir', langObj.dir);
  }

  function applyDOMTranslation(targetLangCode) {
    const isEnglish = targetLangCode === 'en';
    const langObj = LANGUAGES.find(l => l.code === targetLangCode) || LANGUAGES[0];
    const dict = TRANSLATIONS[targetLangCode] || TRANSLATIONS.en;
    const phraseMap = PHRASES[targetLangCode] || {};
    appliedLang = targetLangCode;

    // 1. Set document language and direction
    document.documentElement.lang = targetLangCode;
    document.documentElement.dir = langObj.dir;
    if (langObj.dir === 'rtl') {
      document.documentElement.classList.add('rtl-layout');
    } else {
      document.documentElement.classList.remove('rtl-layout');
    }

    // 2. Translate explicit [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (!el.hasAttribute('data-i18n-orig-html')) {
        el.setAttribute('data-i18n-orig-html', el.innerHTML);
      }
      if (isEnglish) {
        el.innerHTML = el.getAttribute('data-i18n-orig-html');
      } else {
        const key = el.getAttribute('data-i18n');
        const val = dict[key] || dict[key.replace(/_/g, '.')] || dict[key.replace(/\./g, '_')];
        if (val) el.innerHTML = val;
      }
    });

    // 3. Translate [data-i18n-placeholder] and [data-i18n-aria]
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = dict[key] || dict[key.replace(/_/g, '.')];
      if (val) el.placeholder = val;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const val = dict[key] || dict[key.replace(/_/g, '.')];
      if (val) el.setAttribute('aria-label', val);
    });

    // 4. Automatic DOM Tree Text Replacement
    const candidateSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'span', 'a', 'button', 'label', 'li',
      '.stat-label', '.hero-float-card', '.section-label', '.section-title',
      '.about-text', '.h-title', '.h-desc', '.teaser-content p',
      '.ds-trust-title', '.ds-trust-badges span', '.badge', '.tag',
      '.masthead__tag', '.masthead-tag', '.hero__headline', '.hero__subtitle', '.hero__label',
      '.audio-trigger', '.toc__title', '.callout__title'
    ];

    const elements = document.querySelectorAll(candidateSelectors.join(', '));
    elements.forEach(el => {
      // Skip language selector components
      // The main nav is fully keyed with [data-i18n] (step 2); rewriting its <li>/<button>
      // innerHTML here would drop its state and event wiring.
      if (el.closest('#navLinks')) return;
      if (el.closest('#langSelectorContainer') || el.closest('#editorialLangWrapper') || el.closest('#langDropdownMenu') || el.closest('#editorialLangDropdown')) {
        return;
      }

      // Store initial English content
      if (!el.hasAttribute('data-i18n-orig-html')) {
        el.setAttribute('data-i18n-orig-html', el.innerHTML);
      }
      if (!el.hasAttribute('data-i18n-orig-text')) {
        el.setAttribute('data-i18n-orig-text', cleanText(el.innerHTML));
      }

      const origHtml = el.getAttribute('data-i18n-orig-html');
      const origCleanText = el.getAttribute('data-i18n-orig-text');

      if (isEnglish) {
        // Direct clean restore to original English markup
        if (el.innerHTML !== origHtml) {
          el.innerHTML = origHtml;
        }
      } else {
        // Match in phrase dictionary
        const targetVal = phraseMap[origCleanText] || phraseMap[cleanText(el.textContent)];
        if (targetVal) {
          if (origHtml.includes('<br') || origHtml.includes('<span') || origHtml.includes('<strong') || origHtml.includes('<svg')) {
            const svg = el.querySelector('svg');
            if (svg) {
              el.innerHTML = `${svg.outerHTML} ${targetVal}`;
            } else {
              el.innerHTML = targetVal;
            }
          } else {
            el.textContent = targetVal;
          }
        }
      }
    });

    // 5. Update UI Badges & Buttons
    updateUIBadges(langObj);
  }

  // 7. Update UI Badges across navigation and mastheads
  function updateUIBadges(langObj) {
    const standardFlag = document.querySelector('.lang-flag-current');
    const standardCode = document.querySelector('.lang-code-current');
    if (standardFlag) standardFlag.innerHTML = getFlagHtml(langObj, 'lang-flag-current-img');
    if (standardCode) standardCode.textContent = langObj.code.toUpperCase();

    updateChatLanguageNotice(langObj);

    const editorialFlag = document.querySelector('.editorial-lang-flag');
    const editorialCode = document.querySelector('.editorial-lang-code');
    if (editorialFlag) editorialFlag.innerHTML = getFlagHtml(langObj, 'editorial-lang-flag-img');
    if (editorialCode) editorialCode.textContent = langObj.code.toUpperCase();

    // Carry the new language's signature colour onto the collapsed buttons
    document.querySelectorAll('.lang-selector-btn, .editorial-lang-btn').forEach(btn => {
      btn.setAttribute('style', accentVars(langObj));
    });

    // Mark active in dropdown lists
    document.querySelectorAll('.lang-option-item, .editorial-lang-item').forEach(item => {
      const code = item.getAttribute('data-lang-code');
      if (code === langObj.code) {
        item.classList.add('active');
        item.setAttribute('aria-selected', 'true');
      } else {
        item.classList.remove('active');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }

  // 8. Public API for Switching Language
  function setLanguage(langCode, isUserAction = true) {
    const found = LANGUAGES.find(l => l.code === langCode);
    if (!found) return;

    const previousLang = appliedLang;
    currentLang = langCode;
    localStorage.setItem(STORAGE_KEY, langCode);

    // Translate once the dictionary is here; the current text stays until then.
    // If the visitor picks again meanwhile, only the latest choice is applied.
    loadDictionary(langCode).then(() => {
      if (currentLang === langCode) applyDOMTranslation(langCode);
    }, err => {
      console.warn('[i18n] ' + err.message);
      if (currentLang === langCode && isUserAction) {
        currentLang = previousLang;
        localStorage.setItem(STORAGE_KEY, previousLang);
        updateUIBadges(LANGUAGES.find(l => l.code === previousLang) || LANGUAGES[0]);
      }
    });

    if (isUserAction) {
      playSoundFeedback();
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: 'language_change',
          language_code: langCode,
          language_name: found.name,
          timestamp: new Date().toISOString()
        });
      }
    }

    closeAllDropdowns();
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.lang-dropdown-menu, .editorial-lang-dropdown').forEach(d => {
      d.classList.remove('active');
      const btn = d.parentElement.querySelector('button');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  // 9. Render Standard Dropdown
  function renderStandardDropdown(dropdownEl) {
    if (!dropdownEl) return;
    const curObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
    dropdownEl.innerHTML = `
      <div class="lang-dropdown-header">
        <span class="lang-dropdown-title" data-i18n="lang.select">${TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang]['lang.select'] || 'Select Language'}</span>
        <span class="lang-dropdown-badge">12 Languages</span>
      </div>
      <div class="lang-dropdown-search-wrapper">
        <input type="text" class="lang-dropdown-search" placeholder="${TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang]['lang.search_placeholder'] || 'Search language...'}" aria-label="Search language">
      </div>
      <div class="lang-dropdown-grid" role="listbox" id="langListbox" aria-label="Select language">
        ${LANGUAGES.map(l => `
          <button type="button" class="lang-option-item ${l.code === currentLang ? 'active' : ''}" data-lang-code="${l.code}" role="option" aria-selected="${l.code === currentLang ? 'true' : 'false'}" tabindex="${l.code === currentLang ? '0' : '-1'}" style="${accentVars(l)}">
            <span class="lang-option-accent" aria-hidden="true"></span>
            <span class="lang-option-flag">${getFlagHtml(l, 'lang-flag-item-img')}</span>
            <div class="lang-option-info">
              <span class="lang-option-native">${l.nativeName}</span>
              <span class="lang-option-name">${l.name}</span>
            </div>
            <span class="lang-option-check">✓</span>
          </button>
        `).join('')}
      </div>
      <p class="lang-dropdown-empty" role="status" hidden>No language matches that search.</p>
    `;

    // Search filter event
    const searchInput = dropdownEl.querySelector('.lang-dropdown-search');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase().trim();
        dropdownEl.querySelectorAll('.lang-option-item').forEach(item => {
          const code = item.getAttribute('data-lang-code');
          const l = LANGUAGES.find(x => x.code === code);
          const match = l && (l.name.toLowerCase().includes(query) || l.nativeName.toLowerCase().includes(query) || l.code.toLowerCase().includes(query));
          item.style.display = match ? 'flex' : 'none';
        });
        const empty = dropdownEl.querySelector('.lang-dropdown-empty');
        const anyVisible = Array.from(dropdownEl.querySelectorAll('.lang-option-item'))
          .some(i => i.style.display !== 'none');
        if (empty) empty.hidden = anyVisible;
      });
      searchInput.addEventListener('click', e => e.stopPropagation());
    }

    /* role="listbox" commits us to arrow-key navigation, so implement it:
       roving tabindex, Up/Down, Home/End, Enter/Space, and Escape to dismiss. */
    dropdownEl.addEventListener('keydown', function (e) {
      const items = Array.from(dropdownEl.querySelectorAll('.lang-option-item'))
        .filter(i => i.style.display !== 'none');
      if (!items.length) return;
      const focusItem = (el) => {
        items.forEach(i => i.setAttribute('tabindex', '-1'));
        el.setAttribute('tabindex', '0');
        el.focus();
      };
      const current = document.activeElement.closest ? document.activeElement.closest('.lang-option-item') : null;
      const idx = current ? items.indexOf(current) : -1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          focusItem(items[idx < 0 ? 0 : (idx + 1) % items.length]);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (idx <= 0 && current) {
            const search = dropdownEl.querySelector('.lang-dropdown-search');
            if (search) { search.focus(); break; }
          }
          focusItem(items[idx < 0 ? items.length - 1 : (idx - 1 + items.length) % items.length]);
          break;
        case 'Home':
          if (current) { e.preventDefault(); focusItem(items[0]); }
          break;
        case 'End':
          if (current) { e.preventDefault(); focusItem(items[items.length - 1]); }
          break;
        case 'Enter':
        case ' ':
          if (current) {
            e.preventDefault();
            const code = current.getAttribute('data-lang-code');
            if (code) setLanguage(code, true);
          }
          break;
      }
    });

    // Direct event delegation on dropdown container
    dropdownEl.onclick = function (e) {
      const item = e.target.closest('.lang-option-item');
      if (item) {
        e.preventDefault();
        e.stopPropagation();
        const code = item.getAttribute('data-lang-code');
        if (code) setLanguage(code, true);
      }
    };
  }

  // 10. Render Editorial Dropdown
  function renderEditorialDropdown(dropdownEl) {
    if (!dropdownEl) return;
    dropdownEl.innerHTML = `
      <div class="editorial-lang-header">
        <span class="editorial-lang-title">Select Edition Language</span>
      </div>
      <div class="editorial-lang-grid" role="listbox">
        ${LANGUAGES.map(l => `
          <button type="button" class="editorial-lang-item ${l.code === currentLang ? 'active' : ''}" data-lang-code="${l.code}" role="option" aria-selected="${l.code === currentLang ? 'true' : 'false'}" style="${accentVars(l)}">
            <span class="editorial-lang-accent" aria-hidden="true"></span>
            <span class="editorial-lang-item-flag">${getFlagHtml(l, 'editorial-flag-item-img')}</span>
            <span class="editorial-lang-item-name">${l.nativeName}</span>
            <span class="editorial-lang-item-sub">(${l.code.toUpperCase()})</span>
          </button>
        `).join('')}
      </div>
    `;

    // Direct event delegation on editorial dropdown
    dropdownEl.onclick = function (e) {
      const item = e.target.closest('.editorial-lang-item');
      if (item) {
        e.preventDefault();
        e.stopPropagation();
        const code = item.getAttribute('data-lang-code');
        if (code) setLanguage(code, true);
      }
    };
  }

  // 11. Mount and Initialize Listeners
  let isInitialized = false;
  function initLanguageChanger() {
    if (isInitialized) return;
    isInitialized = true;
    const curObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

    // 1. Standard navigation container
    const standardContainer = document.getElementById('langSelectorContainer');
    if (standardContainer) {
      if (!standardContainer.querySelector('.lang-selector-btn')) {
        standardContainer.innerHTML = `
          <button class="lang-selector-btn" id="langSelectorBtn" style="${accentVars(curObj)}" aria-expanded="false" aria-haspopup="listbox" aria-controls="langListbox" aria-label="Select Language">
            <span class="lang-flag-current">${getFlagHtml(curObj, 'lang-flag-current-img')}</span>
            <span class="lang-code-current">${curObj.code.toUpperCase()}</span>
            <svg class="lang-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="lang-dropdown-menu" id="langDropdownMenu"></div>
        `;
      }
      const btn = standardContainer.querySelector('.lang-selector-btn');
      const dropdown = standardContainer.querySelector('.lang-dropdown-menu');
      renderStandardDropdown(dropdown);

      if (btn && dropdown) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const isActive = dropdown.classList.contains('active');
          closeAllDropdowns();
          if (!isActive) {
            dropdown.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
            playSoundFeedback();
            const search = dropdown.querySelector('.lang-dropdown-search');
            if (search) setTimeout(() => search.focus(), 80);
          }
        });
      }
    }

    // 2. Editorial masthead container
    const editorialWrapper = document.getElementById('editorialLangWrapper');
    if (editorialWrapper) {
      if (!editorialWrapper.querySelector('.editorial-lang-btn')) {
        editorialWrapper.innerHTML = `
          <button class="editorial-lang-btn" id="editorialLangBtn" style="${accentVars(curObj)}" aria-expanded="false" aria-haspopup="listbox" aria-label="Select Edition Language">
            <span class="editorial-lang-flag">${getFlagHtml(curObj, 'editorial-lang-flag-img')}</span>
            <span class="editorial-lang-code">${curObj.code.toUpperCase()}</span>
            <svg class="editorial-lang-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="editorial-lang-dropdown" id="editorialLangDropdown"></div>
        `;
      }
      const btn = editorialWrapper.querySelector('.editorial-lang-btn');
      const dropdown = editorialWrapper.querySelector('.editorial-lang-dropdown');
      renderEditorialDropdown(dropdown);

      if (btn && dropdown) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const isActive = dropdown.classList.contains('active');
          closeAllDropdowns();
          if (!isActive) {
            dropdown.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
            playSoundFeedback();
          }
        });
      }
    }

    // 3. Global click outside listener
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#langSelectorContainer') && !e.target.closest('#editorialLangWrapper')) {
        closeAllDropdowns();
      }
    });

    // 4. Escape key listener - returns focus to the trigger, so keyboard users
    //    are not dropped at the top of the document after dismissing the menu.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const openDropdown = document.querySelector('.lang-dropdown-menu.active, .editorial-lang-dropdown.active');
        if (!openDropdown) return;
        const trigger = openDropdown.previousElementSibling;
        closeAllDropdowns();
        if (trigger && typeof trigger.focus === 'function') trigger.focus();
      }
    });

    // 5. Apply initial language translation (English is already in the HTML;
    //    a restored choice waits for its dictionary, without a language_change push)
    if (currentLang === 'en') {
      applyDOMTranslation('en');
    } else {
      const restoring = currentLang;
      loadDictionary(restoring).then(() => {
        if (currentLang !== restoring) return;
        applyDOMTranslation(restoring);
        const dict = TRANSLATIONS[restoring] || {};
        const search = document.querySelector('#langDropdownMenu .lang-dropdown-search');
        if (search && dict['lang.search_placeholder']) search.placeholder = dict['lang.search_placeholder'];
      }, err => {
        // Keep the saved choice for next time, but show the page honestly as English.
        console.warn('[i18n] ' + err.message);
        if (currentLang === restoring) { currentLang = 'en'; updateUIBadges(LANGUAGES[0]); }
      });
    }
  }

  // Expose global controller
  window.PortfolioI18n = {
    languages: LANGUAGES,
    translations: TRANSLATIONS,
    phrases: PHRASES,
    getCurrentLanguage: () => currentLang,
    t: (key) => (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key])
                || (TRANSLATIONS.en && TRANSLATIONS.en[key]) || '',
    setLanguage: setLanguage,
    register: registerDictionary,
    init: initLanguageChanger
  };

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageChanger);
  } else {
    initLanguageChanger();
  }
})();
