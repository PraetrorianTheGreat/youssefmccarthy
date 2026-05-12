// ── Premium UI Sound Engine (Microsoft Fluent-Inspired) ──
const UISounds = (() => {
  let ctx;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  // Resume audio on first user interaction (browser autoplay policy)
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
    // Warm tap — nav links, general buttons (C4 note)
    click: () => play(262, 0.18, 'sine', 0.15),
    // Gentle two-note chime — page load (C4 → E4)
    chime: () => {
      play(262, 0.25, 'sine', 0.14);
      setTimeout(() => play(330, 0.25, 'sine', 0.11), 100);
    },
    // Mellow toggle snap (D4)
    toggle: () => play(294, 0.14, 'sine', 0.15, 3),
    // Card expand — warm rising interval (G3 → C4)
    expand: () => {
      play(196, 0.3, 'sine', 0.12);
      setTimeout(() => play(262, 0.25, 'sine', 0.1), 120);
    },
    // Card collapse — gentle descend (C4 → G3)
    collapse: () => {
      play(262, 0.2, 'sine', 0.12);
      setTimeout(() => play(196, 0.25, 'sine', 0.1), 100);
    },
    // Copy confirmation — soft double chime (E4 → G4)
    confirm: () => {
      play(330, 0.15, 'sine', 0.14);
      setTimeout(() => play(392, 0.2, 'sine', 0.11), 110);
    },
    // Back to top — ascending C major triad (C4 → E4 → G4)
    ascend: () => {
      play(262, 0.18, 'sine', 0.12);
      setTimeout(() => play(330, 0.18, 'sine', 0.1), 100);
      setTimeout(() => play(392, 0.22, 'sine', 0.08), 200);
    },
    // Testimonial slide — gentle tick (A3)
    slide: () => play(220, 0.12, 'sine', 0.13),
  };
})();

// ── Google Analytics Event Tracking ──
const trackEvent = (name, params = {}) => {
  if (typeof gtag === 'function') {
    gtag('event', name, params);
  }
};

// ── Page Loader ──
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('pageLoader').classList.add('hidden');
    UISounds.chime();
  }, 1400);
});

// ── Particle System (Mouse-Reactive) ──
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: -1000, y: -1000 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.baseX = this.x;
    this.baseY = this.y;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.4 + 0.1;
  }
  update() {
    // Mouse repulsion
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 150;
    if (dist < maxDist) {
      const force = (maxDist - dist) / maxDist;
      this.x -= dx * force * 0.03;
      this.y -= dy * force * 0.03;
    }
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
    ctx.fill();
  }
}

for (let i = 0; i < 60; i++) particles.push(new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  // Mouse glow
  if (mouse.x > 0 && mouse.y > 0) {
    const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 100);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.04)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(mouse.x - 100, mouse.y - 100, 200, 200);
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ── Navigation ──
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
  // Active section highlighting
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 150;
    if (window.scrollY >= top) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});

// Mobile menu
document.getElementById('mobileToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
  UISounds.click();
});
// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
    UISounds.click();
  });
});

// ── Theme Toggle ──
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light') {
  document.body.classList.add('light-theme');
  themeToggle.checked = true;
} else {
  document.body.classList.remove('light-theme');
  themeToggle.checked = false;
  localStorage.setItem('portfolio-theme', 'dark');
}
themeToggle.addEventListener('change', () => {
  const isLight = themeToggle.checked;
  document.body.classList.toggle('light-theme', isLight);
  localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
  UISounds.toggle();
  trackEvent('theme_change', { theme: isLight ? 'light' : 'dark' });
});

// ── Scroll Reveal Animations (Staggered) ──
const revealElements = document.querySelectorAll('.reveal, .timeline-item');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger children within the same parent
      const delay = entry.target.dataset.revealDelay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay * 100);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach((el, i) => {
  el.dataset.revealDelay = i % 5;
  revealObserver.observe(el);
});

// ── Animated Counters ──
const statNumbers = document.querySelectorAll('.stat-number');
let statsCounted = false;

function animateCounters() {
  if (statsCounted) return;
  statsCounted = true;
  statNumbers.forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString() + (progress >= 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) animateCounters();
  });
}, { threshold: 0.5 });
document.querySelectorAll('.hero-stats').forEach(el => statsObserver.observe(el));

// ── Skill Bar Animations ──
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skill-category').forEach(el => skillObserver.observe(el));

// ── Timeline Toggle ──
function toggleTimeline(card) {
  const expand = card.querySelector('.timeline-expand');
  const toggle = card.querySelector('.timeline-toggle');
  const isOpen = expand.classList.contains('open');
  expand.classList.toggle('open');
  toggle.textContent = isOpen ? 'Show more \u2193' : 'Show less \u2191';
  isOpen ? UISounds.collapse() : UISounds.expand();
  trackEvent('experience_toggle', { 
    company: card.querySelector('.timeline-company').textContent,
    action: isOpen ? 'collapse' : 'expand' 
  });
}

// ── Project Toggle ──
function toggleProject(card) {
  const details = card.querySelector('.project-details');
  const toggle = card.querySelector('.project-toggle');
  const isOpen = details.classList.contains('open');
  details.classList.toggle('open');
  toggle.textContent = isOpen ? 'Expand Case Study \u2192' : 'Collapse \u2191';
  isOpen ? UISounds.collapse() : UISounds.expand();
  trackEvent('project_toggle', { 
    project: card.querySelector('.project-title').textContent,
    action: isOpen ? 'collapse' : 'expand' 
  });
}

// ── Testimonial Carousel ──
let currentTestimonial = 0;
const testimonialCards = document.querySelectorAll('.testimonial-card');
const dotsContainer = document.getElementById('testimonialDots');

// Create dots
if (dotsContainer) {
  testimonialCards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToTestimonial(i));
    dotsContainer.appendChild(dot);
  });
}

function goToTestimonial(index) {
  testimonialCards.forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.testimonial-dot').forEach(d => d.classList.remove('active'));
  currentTestimonial = index;
  testimonialCards[currentTestimonial].classList.add('active');
  document.querySelectorAll('.testimonial-dot')[currentTestimonial].classList.add('active');
}

function changeTestimonial(dir, manual) {
  let next = currentTestimonial + dir;
  if (next < 0) next = testimonialCards.length - 1;
  if (next >= testimonialCards.length) next = 0;
  goToTestimonial(next);
  if (manual) UISounds.slide();
}

// Auto-rotate testimonials (silent)
setInterval(() => changeTestimonial(1, false), 6000);

// ── Copy to Clipboard ──
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    UISounds.confirm();
    trackEvent('copy_to_clipboard', { value: text });
    const original = btn.textContent;
    btn.textContent = '\u2713';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ── Back to Top ──
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
});
backToTop.addEventListener('click', () => {
  UISounds.ascend();
  trackEvent('back_to_top');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Smooth scroll for nav links ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    UISounds.click();
    const href = link.getAttribute('href');
    trackEvent('nav_click', { target: href });
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── CV Download Tracking ──
document.querySelectorAll('a[download]').forEach(link => {
  link.addEventListener('click', () => {
    trackEvent('cv_download', { file_name: link.getAttribute('href') });
  });
});
