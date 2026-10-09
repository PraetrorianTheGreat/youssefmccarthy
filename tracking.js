// tracking.js
//
// ===================================================================
// EVENT SCHEMA: every custom event this site pushes to window.dataLayer
// (read by GTM container GTM-M686VJGG). Parameters below were checked
// against the code that sends them. Names are relied on by GTM
// triggers: do not rename events or parameters.
// page_name is always window.location.pathname
// (production example: "/youssefmccarthy/experience.html").
// page_type is added to every push made by tracking.js (events 1a, 2,
// 3, 4, 7, 8, 9): the <body data-page-type> value of the page, one of
// "home", "section", "hub", "essay" ("unknown" if the attribute is
// missing).
// -------------------------------------------------------------------
// 1. nav_click  (two senders push this name with different parameters)
//    a) tracking.js, click on any link in the main nav (.nav-links a):
//       link_text   string  "Experience"  (link text, "Icon Link" if empty)
//       link_url    string  "experience.html"  (raw href attribute)
//       page_name   string  "/projects.html"
//    b) script.js, click on an in-page anchor (a[href^="#"], not the
//       skip link):
//       target      string  "#about"
//
// 2. outbound_link_click  (tracking.js, click on any a[target="_blank"])
//       link_url    string  "https://shop.googlemerchandisestore.com/"  (raw href)
//       page_name   string  "/experience.html"
//
// 3. project_card_click  (tracking.js, click on a .project-card)
//       project_title  string  "Digital Experience Revamp for AdvantageCare Physicians"
//       project_index  number  1  (0-based position among .project-card)
//       page_section   string  "projects"  (constant)
//
// 4. feature_toggle  (tracking.js, click on #webgl-toggle-btn)
//       feature_name  string  "webgl_background"  (constant)
//       new_state     string  "Back to Original"  (button label read
//                             after webgl-backgrounds.js has updated it)
//       page_name     string  "/experience.html"
//
// 5. recommendation_modal_open  (script.js, openRecommendationModal())
//       author_name   string  name from the recommendation data
//       author_role   string  role from the data, "&middot;" -> "-"
//       page_section  string  "recommendations_wall"  (constant)
//
// 6. language_change  (i18n.js, setLanguage() on a user action only)
//       language_code  string  "es"
//       language_name  string  "Spanish"
//       timestamp      string  "2026-10-04T21:05:00.000Z"  (ISO 8601)
//
// 7. section_view  (tracking.js, see "Reading depth" below)
//       section_id     string  "experience"  (element id; "essay_body"
//                              for the essay article; "section_<n>"
//                              when the section has no id)
//       section_index  number  0  (0-based order of tracked sections
//                              on the page)
//       page_name      string  "/GarbageInternet/"
//
// 8. page_meta  (tracking.js, pushed once per page view as soon as the
//    script runs, before any other tracking.js event)
//       page_type      string  "section"  ("home" index.html; "section"
//                              experience, projects, analytics,
//                              collaboration, skills, education; "hub"
//                              editorials.html; "essay" LocalAI,
//                              AgenticLoop, GarbageInternet)
//       page_name      string  "/experience.html"
//
// 9. internal_link_click  (tracking.js, one delegated click listener;
//    links inside .nav-links are skipped, they push nav_click)
//       link_type      string  "next_card"  (one of: "next_card" for
//                              .next-card a, "next_essay" for
//                              .next-essay__link, "editorial_card" for
//                              .editorial-card, "essay_nav" for
//                              .site-nav a on the essays)
//       link_url       string  "projects.html"  (raw href attribute)
//       page_type      string  "section"
//       page_name      string  "/experience.html"
// -------------------------------------------------------------------
// Note: script.js (trackEvent) and analytics-script.js also push other
// UI events (e.g. outbound_click, theme_change, experience_toggle,
// project_toggle, projects_filter_update, copy_to_clipboard). They are
// outside this file and not part of the schema above.
// ===================================================================

// --- Page type: page_meta (once per page view) and internal_link_click ---
// Runs before any other listener in this file. Pages load tracking.js
// at the end of <body>, so document.body exists here.
window.dataLayer = window.dataLayer || [];
var ymPageType = (document.body && document.body.getAttribute('data-page-type')) || 'unknown';
if (!window.__ymPageMetaSent) {
    window.__ymPageMetaSent = true;
    window.dataLayer.push({
        'event': 'page_meta',
        'page_type': ymPageType,
        'page_name': window.location.pathname
    });

    // Delegated: Next cards, Next essay links, editorial cards, essay nav.
    document.addEventListener('click', function(e) {
        var el = e.target && e.target.closest ? e.target : (e.target && e.target.parentElement);
        if (!el) return;
        if (el.closest('.nav-links')) return; // already sent as nav_click
        var link, type;
        if ((link = el.closest('.next-card a'))) type = 'next_card';
        else if ((link = el.closest('.next-essay__link'))) type = 'next_essay';
        else if ((link = el.closest('.editorial-card'))) type = 'editorial_card';
        else if ((link = el.closest('.site-nav a'))) type = 'essay_nav';
        else return;
        window.dataLayer.push({
            'event': 'internal_link_click',
            'link_type': type,
            'link_url': link.getAttribute('href'),
            'page_type': ymPageType,
            'page_name': window.location.pathname
        });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    window.dataLayer = window.dataLayer || [];

    // --- Global Event Trackers ---

    // 1. Navigation Clicks
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            let linkText = this.innerText.trim() || 'Icon Link';
            let href = this.getAttribute('href');
            window.dataLayer.push({
                'event': 'nav_click',
                'link_text': linkText,
                'link_url': href,
                'page_type': ymPageType,
                'page_name': window.location.pathname
            });
        });
    });

    // 2. Outbound Links
    const outboundLinks = document.querySelectorAll('a[target="_blank"]');
    outboundLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            let href = this.getAttribute('href');
            window.dataLayer.push({
                'event': 'outbound_link_click',
                'link_url': href,
                'page_type': ymPageType,
                'page_name': window.location.pathname
            });
        });
    });

    // 3. Interactive Toggles (e.g. WebGL toggle)
    const webglToggle = document.getElementById('webgl-toggle-btn');
    if(webglToggle) {
        webglToggle.addEventListener('click', function() {
            // Find current state text
            let toggleText = this.querySelector('.webgl-toggle-text');
            let state = toggleText ? toggleText.innerText : 'Unknown';
            window.dataLayer.push({
                'event': 'feature_toggle',
                'feature_name': 'webgl_background',
                'new_state': state,
                'page_type': ymPageType,
                'page_name': window.location.pathname
            });
        });
    }

    // --- Page Specific Trackers (from previous inline scripts) ---



    // Project Card Interactions
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('click', function() {
            let titleEl = this.querySelector('.project-title');
            let projectName = titleEl ? titleEl.innerText : 'Project';
            window.dataLayer.push({
                'event': 'project_card_click',
                'project_title': projectName,
                'project_index': Array.from(projectCards).indexOf(card),
                'page_section': 'projects',
                'page_type': ymPageType
            });
        });
    });

    // Reading depth: section_view
    // Fires once per section per page view when the section has been
    // visible enough: 50% of the section, or, for sections taller than
    // twice the viewport (where 50% can never be on screen at once),
    // 90% of the viewport filled by the section, i.e. the required
    // ratio is min(0.5, 0.9 * viewportHeight / sectionHeight). The
    // ratio is computed in the callback, so resizes and sections that
    // grow (accordions) are handled. IntersectionObserver only, no
    // scroll listeners. Tracked: top-level <section> elements inside
    // <main> (not nested in another section); on the essays, the essay
    // body (main article.article) instead.
    if ('IntersectionObserver' in window) {
        const mainEl = document.querySelector('main') || document.body;
        const essayBody = mainEl.querySelector('article.article');
        const tracked = essayBody ? [essayBody] : Array.from(mainEl.querySelectorAll('section'))
            .filter(el => !(el.parentElement && el.parentElement.closest('section')));

        if (tracked.length) {
            const thresholds = [];
            for (let i = 0; i <= 100; i++) thresholds.push(i / 200); // 0 .. 0.5
            const seen = new Set();
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    const el = entry.target;
                    if (seen.has(el) || !entry.isIntersecting) return;
                    const height = entry.boundingClientRect.height;
                    if (!height) return;
                    const viewport = window.innerHeight || document.documentElement.clientHeight;
                    const required = Math.min(0.5, 0.9 * viewport / height);
                    if (entry.intersectionRatio + 0.001 < required) return;
                    seen.add(el);
                    observer.unobserve(el);
                    const index = tracked.indexOf(el);
                    window.dataLayer.push({
                        'event': 'section_view',
                        'section_id': el === essayBody ? 'essay_body' : (el.id || ('section_' + index)),
                        'section_index': index,
                        'page_type': ymPageType,
                        'page_name': window.location.pathname
                    });
                });
            }, { threshold: thresholds });
            tracked.forEach(el => observer.observe(el));
        }
    }
});
