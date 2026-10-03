// tracking.js

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
                'page_section': 'projects'
            });
        });
    });
});
