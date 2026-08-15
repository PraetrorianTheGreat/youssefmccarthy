// ── Premium Luxury Sound Engine (Bespoke Glass & Silk Synthesis) ──
if (typeof window.UISounds === 'undefined') {
  window.UISounds = (() => {
    let ctx;
    let soundMuted = false;
    let lastPlayTime = 0;

    const getCtx = () => {
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) ctx = new AudioCtx();
      }
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    };

    const unlock = () => {
      getCtx();
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock, { passive: true });
    document.addEventListener('touchstart', unlock, { passive: true });
    document.addEventListener('keydown', unlock, { passive: true });

    function playLuxuryNote(c, freq, duration, vol = 0.07, overtoneRatio = 1.5, overtoneVol = 0.18) {
      try {
        const now = c.currentTime;
        const osc1 = c.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        const osc2 = c.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * overtoneRatio, now);

        const gain2 = c.createGain();
        gain2.gain.setValueAtTime(overtoneVol, now);
        osc2.connect(gain2);

        const mainGain = c.createGain();
        mainGain.gain.setValueAtTime(0.0001, now);
        mainGain.gain.linearRampToValueAtTime(vol, now + 0.012);
        mainGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, now);
        filter.frequency.exponentialRampToValueAtTime(600, now + duration);
        filter.Q.value = 0.5;

        osc1.connect(mainGain);
        gain2.connect(mainGain);
        mainGain.connect(filter);
        filter.connect(c.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
      } catch(e) {}
    }

    function play(freq, duration, vol = 0.07, overtoneRatio = 1.5, overtoneVol = 0.18) {
      if (soundMuted) return;
      const now = Date.now();
      if (now - lastPlayTime < 35) return;
      lastPlayTime = now;

      try {
        const c = getCtx();
        if (!c) return;
        if (c.state === 'suspended') {
          c.resume().then(() => playLuxuryNote(c, freq, duration, vol, overtoneRatio, overtoneVol)).catch(() => {});
        } else {
          playLuxuryNote(c, freq, duration, vol, overtoneRatio, overtoneVol);
        }
      } catch(e) {}
    }

    return {
      isMuted: () => soundMuted,
      setMuted: (val) => { soundMuted = !!val; },
      toggleMute: () => { soundMuted = !soundMuted; return soundMuted; },
      click: () => play(698.46, 0.12, 0.07, 1.5, 0.18),
      chime: () => {
        if (soundMuted) return;
        const c = getCtx();
        if (!c) return;
        playLuxuryNote(c, 622.25, 0.45, 0.06, 2.0, 0.15);
        setTimeout(() => playLuxuryNote(c, 830.61, 0.45, 0.05, 1.5, 0.15), 110);
        setTimeout(() => playLuxuryNote(c, 1046.50, 0.55, 0.04, 1.5, 0.12), 220);
      },
      pop: () => {
        if (soundMuted) return;
        const c = getCtx();
        if (!c) return;
        playLuxuryNote(c, 523.25, 0.18, 0.07, 1.5, 0.15);
        setTimeout(() => playLuxuryNote(c, 783.99, 0.22, 0.06, 1.5, 0.15), 60);
      },
      toggle: () => {
        if (soundMuted) return;
        const c = getCtx();
        if (!c) return;
        playLuxuryNote(c, 830.61, 0.10, 0.08, 1.33, 0.2);
        setTimeout(() => playLuxuryNote(c, 932.33, 0.12, 0.06, 1.5, 0.15), 45);
      },
      expand: () => {
        if (soundMuted) return;
        const c = getCtx();
        if (!c) return;
        playLuxuryNote(c, 698.46, 0.25, 0.06, 1.5, 0.15);
        setTimeout(() => playLuxuryNote(c, 880.00, 0.25, 0.05, 1.5, 0.12), 80);
        setTimeout(() => playLuxuryNote(c, 1046.50, 0.30, 0.04, 1.5, 0.10), 160);
      },
      collapse: () => {
        if (soundMuted) return;
        const c = getCtx();
        if (!c) return;
        playLuxuryNote(c, 1046.50, 0.20, 0.06, 1.5, 0.15);
        setTimeout(() => playLuxuryNote(c, 698.46, 0.25, 0.05, 1.5, 0.12), 80);
      },
      confirm: () => {
        if (soundMuted) return;
        const c = getCtx();
        if (!c) return;
        playLuxuryNote(c, 830.61, 0.20, 0.08, 1.5, 0.2);
        setTimeout(() => playLuxuryNote(c, 1244.51, 0.30, 0.07, 1.5, 0.15), 90);
      },
      ascend: () => {
        if (soundMuted) return;
        const c = getCtx();
        if (!c) return;
        playLuxuryNote(c, 622.25, 0.20, 0.06, 1.5, 0.15);
        setTimeout(() => playLuxuryNote(c, 783.99, 0.20, 0.05, 1.5, 0.15), 70);
        setTimeout(() => playLuxuryNote(c, 932.33, 0.22, 0.05, 1.5, 0.12), 140);
        setTimeout(() => playLuxuryNote(c, 1244.51, 0.35, 0.04, 1.5, 0.10), 210);
      },
      slide: () => play(698.46, 0.10, 0.05, 1.5, 0.15),
      hover: () => play(1046.50, 0.04, 0.02, 1.5, 0.10),
    };
  })();
}
var UISounds = window.UISounds;

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
    let revealed = false;
    const revealDashboard = () => {
      if (!revealed) {
        revealed = true;
        loader.classList.add('fade-out');
        iframe.classList.add('loaded');
        if (typeof UISounds !== 'undefined' && UISounds.chime) UISounds.chime();
      }
    };

    iframe.addEventListener('load', () => {
      setTimeout(revealDashboard, 300);
    });

    // Fallback reveal after 1.8s so Looker Studio displays seamlessly
    setTimeout(revealDashboard, 1800);
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
