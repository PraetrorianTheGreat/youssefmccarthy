// ── Premium UI Sound Engine (Microsoft Fluent-Inspired) ──
const UISounds = (() => {
  let ctx;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const unlock = () => {
    getCtx();
    document.removeEventListener('click', unlock);
    document.removeEventListener('touchstart', unlock);
  };
  document.addEventListener('click', unlock);
  document.addEventListener('touchstart', unlock);

  function play(freq, duration, type = 'sine', vol = 0.25, detune = 0) {
    try {
      const c = getCtx();
      if (c.state === 'suspended') c.resume();
      const osc = c.createOscillator();
      const gain = c.createGain();
      const filter = c.createBiquadFilter();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      filter.type = 'lowpass';
      filter.frequency.value = 3000;
      filter.Q.value = 0.7;
      gain.gain.setValueAtTime(0, c.currentTime);
      gain.gain.linearRampToValueAtTime(vol, c.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    } catch(e) {}
  }

  return {
    click: () => play(262, 0.18, 'sine', 0.15),
    chime: () => {
      play(262, 0.25, 'sine', 0.14);
      setTimeout(() => play(330, 0.25, 'sine', 0.11), 100);
    },
    toggle: () => play(294, 0.14, 'sine', 0.15, 3),
    expand: () => {
      play(196, 0.3, 'sine', 0.12);
      setTimeout(() => play(262, 0.25, 'sine', 0.1), 120);
    },
    collapse: () => {
      play(262, 0.2, 'sine', 0.12);
      setTimeout(() => play(196, 0.25, 'sine', 0.1), 100);
    },
    confirm: () => {
      play(330, 0.15, 'sine', 0.14);
      setTimeout(() => play(392, 0.2, 'sine', 0.11), 110);
    }
  };
})();

// ── Google Analytics / GTM Event Tracking ──
const trackEvent = (name, params = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: name,
    ...params
  });
};

document.addEventListener('DOMContentLoaded', () => {
  // ── Particle System (Mouse-Reactive) ──
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 10;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -Math.random() * 0.5 - 0.2;
        this.size = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.3 + 0.15;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Mouse repelling force
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          this.x += (dx / dist) * force * 2;
          this.y += (dy / dist) * force * 2;
        }

        if (this.y < -10 || this.x < 0 || this.x > canvas.width) {
          this.reset();
        }
      }
      draw() {
        ctx.fillStyle = `rgba(59, 130, 246, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 45; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();
  }

  // ── Scroll Progress Bar ──
  window.addEventListener('scroll', () => {
    const progressBar = document.getElementById('readingProgressBar');
    if (progressBar) {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = progress + '%';
    }
  });

  // ── Navigation Scroll Background Effect ──
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ── Mobile Menu Toggle ──
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      UISounds.click();
      trackEvent('mobile_nav_toggle', { action: navLinks.classList.contains('open') ? 'open' : 'close' });
    });
  }

  // ── Theme Switch & Persistent Logic ──
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      themeToggle.checked = true;
    } else {
      document.body.classList.remove('light-theme');
      themeToggle.checked = false;
    }

    themeToggle.addEventListener('change', () => {
      const isLight = themeToggle.checked;
      document.body.classList.toggle('light-theme', isLight);
      localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
      UISounds.toggle();
      trackEvent('theme_change', { theme: isLight ? 'light' : 'dark', page_location: 'analytics_showcase' });
    });
  }

  // ── Looker Studio Iframe Loading Orchestrator ──
  const iframe = document.getElementById('dashboardIframe');
  const loader = document.getElementById('skeletonLoader');
  if (iframe && loader) {
    // Timeout backup to remove skeleton loader if Looker Studio takes more than 10s or has blocks
    const backupTimeout = setTimeout(() => {
      if (!iframe.classList.contains('loaded')) {
        loader.classList.add('fade-out');
        iframe.classList.add('loaded');
        console.warn('Iframe load fallback triggered');
      }
    }, 10000);

    iframe.onload = () => {
      clearTimeout(backupTimeout);
      setTimeout(() => {
        loader.classList.add('fade-out');
        iframe.classList.add('loaded');
        UISounds.chime();
        trackEvent('iframe_loaded_successfully', { source: 'LookerStudio' });
      }, 500); // Small delay for visual fluid transition
    };
  }

  // ── Interactive Dashboard Controls ──
  const reloadBtn = document.getElementById('reloadBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const card = document.querySelector('.dashboard-card');

  if (reloadBtn && iframe && loader) {
    reloadBtn.addEventListener('click', () => {
      UISounds.click();
      iframe.classList.remove('loaded');
      loader.classList.remove('fade-out');
      
      // Force iframe refresh
      const currentSrc = iframe.src;
      iframe.src = '';
      iframe.src = currentSrc;

      trackEvent('dashboard_refresh_clicked');
    });
  }

  if (fullscreenBtn && card) {
    fullscreenBtn.addEventListener('click', () => {
      const isFullscreen = card.classList.toggle('fullscreen');
      if (isFullscreen) {
        UISounds.expand();
        fullscreenBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4"></path>
          </svg>
          Exit Screen
        `;
      } else {
        UISounds.collapse();
        fullscreenBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
          Fullscreen
        `;
      }
      trackEvent('dashboard_fullscreen_toggled', { mode: isFullscreen ? 'fullscreen' : 'window' });
    });
  }

  const outboundBtn = document.getElementById('outboundBtn');
  if (outboundBtn) {
    outboundBtn.addEventListener('click', () => {
      UISounds.click();
      trackEvent('dashboard_outbound_clicked');
    });
  }

  // ── Accordion System Interactivity ──
  const accordionItems = document.querySelectorAll('.accordion-item');
  
  // Initialize accordion heights on page load
  accordionItems.forEach(item => {
    const content = item.querySelector('.accordion-content');
    if (item.classList.contains('active')) {
      content.style.maxHeight = content.scrollHeight + 'px';
    } else {
      content.style.maxHeight = '0px';
    }
  });

  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Collapse all items
      accordionItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        otherItem.querySelector('.accordion-content').style.maxHeight = '0px';
      });

      // Toggle clicked item
      if (!isActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
        UISounds.expand();
        
        const sectionTitle = header.querySelector('h3').innerText;
        trackEvent('accordion_section_expanded', { section: sectionTitle });
      } else {
        UISounds.collapse();
      }
    });
  });

  // Recalculate heights on window resize
  window.addEventListener('resize', () => {
    accordionItems.forEach(item => {
      if (item.classList.contains('active')) {
        const content = item.querySelector('.accordion-content');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // Safety backup to recalculate heights after all images and fonts are loaded
  window.addEventListener('load', () => {
    accordionItems.forEach(item => {
      if (item.classList.contains('active')) {
        const content = item.querySelector('.accordion-content');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // Track sticky CTA click
  const cta = document.getElementById('ds-floating-cta');
  if (cta) {
    cta.addEventListener('click', () => {
      UISounds.confirm();
      trackEvent('cta_click', { button_name: 'consulting_showcase_sticky' });
    });
  }
});
