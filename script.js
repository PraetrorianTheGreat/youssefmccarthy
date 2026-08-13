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

// ── Google Analytics / GTM Event Tracking ──
const trackEvent = (name, params = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: name,
    ...params
  });
};

// ── Universal Event Tracking ──
document.addEventListener('click', function(e) {
  const link = e.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href') || '';
  const pageName = window.location.pathname;

  // 1. Email Clicks
  if (href.startsWith('mailto:')) {
    trackEvent('email_click', {
      email_target: href.replace('mailto:', ''),
      page_name: pageName
    });
    return; // Continue default behavior
  }

  // 2. LinkedIn Clicks
  if (href.includes('linkedin.com')) {
    trackEvent('linkedin_click', {
      link_url: href,
      page_name: pageName
    });
    // Let it fall through in case we still want outbound click for it, but early return is safer to prevent duplicate events. Let's return.
    return;
  }

  // 3. General Outbound Clicks
  if (href.startsWith('http') && !href.includes(window.location.hostname)) {
    let domain = '';
    try { domain = new URL(href).hostname; } catch(e) {}
    trackEvent('outbound_click', {
      link_url: href,
      link_text: link.textContent.trim(),
      link_domain: domain,
      page_location: window.location.href
    });
  }
});
// ── Page Loader ──
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('pageLoader');
    if (loader) {
      loader.classList.add('hidden');
    }
    UISounds.chime();
  }, 1400);
});

// ── Particle System (Mouse-Reactive) ──
const canvas = document.getElementById('particles');
let ctx;
let particles = [];
let mouse = { x: -1000, y: -1000 };

if (canvas) {
  ctx = canvas.getContext('2d');

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
    // 70% of particles are selected to circle the profile picture
    this.isCircler = Math.random() > 0.3;
    this.reset();
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.2;
    
    if (this.isCircler) {
      // Dynamic colors for circling particles (blue, green, purple, amber, pink)
      const colors = ['59, 130, 246', '16, 185, 129', '139, 92, 246', '245, 158, 11', '236, 72, 153'];
      this.specialColor = colors[Math.floor(Math.random() * colors.length)];
      // Dynamic analytics shapes
      const shapes = ['plus', 'bar', 'node', 'bracket', 'circle'];
      this.specialShape = shapes[Math.floor(Math.random() * shapes.length)];
    }
    this.isTargetingProfile = false;
  }
  update(time) {
    const timeSec = time * 0.001;
    
    // Cycle every 10 seconds for 4 seconds of animation
    const cycle = timeSec % 10;
    let effectStrength = 0;
    if (cycle > 5 && cycle < 9) {
       effectStrength = Math.sin((cycle - 5) / 4 * Math.PI); // 0 to 1 back to 0
    }
    
    const profilePicWrapper = document.querySelector('.hero-photo-wrapper');
    const interactiveCard = document.getElementById('interactive-experience-card');
    const profilePicRect = profilePicWrapper ? profilePicWrapper.getBoundingClientRect() : null;
    const isProfileVisible = profilePicRect && profilePicRect.bottom > -100; // Keep tracking even if mostly scrolled off
    const isHomepage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('youssefmccarthy/');
    
    let targetElement = null;
    let isContinuous = false;
    let customEffectStrength = null;
    this.isTargetingProfile = false;
    this.isTargetingCard = false;
    
    if (isHomepage) {
      if (isProfileVisible && profilePicWrapper) {
        // Disabled targeting profile picture to use the Tube Cursor effect instead
        // targetElement = profilePicWrapper; 
      } else if (interactiveCard) {
        const rect = interactiveCard.getBoundingClientRect();
        // Check if the interactive card is in the main view area
        if (rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2) {
          targetElement = interactiveCard;
          isContinuous = true;
          if (this.isCircler) this.isTargetingCard = true;
        }
      }
    }
    
    if (customEffectStrength !== null) {
      effectStrength = customEffectStrength;
    } else if (isContinuous) {
      effectStrength = 1; // Continuous movement for the card
    }
    
    this.targetStrength = effectStrength; // Store for fading in draw()
    
    if (this.isCircler && targetElement && effectStrength > 0) {
      const rect = targetElement.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      
      let targetRadius;
      let angle;
      
      if (targetElement === profilePicWrapper) {
        // Evenly distribute particles along the circular border
        // Use an assigned angle so particles spread out evenly
        if (this.assignedAngle === undefined) {
           this.assignedAngle = Math.random() * Math.PI * 2;
        }
        // Slowly move them around the circle over time
        this.assignedAngle += 0.002; // Slower orbit speed
        angle = this.assignedAngle;
        
        targetRadius = (Math.max(rect.width, rect.height) / 2) * 1.5;
        
        // Morphing shapes every 5 seconds
        const cycleLength = 5.0;
        const transitionLength = 1.0; // 1 second to morph
        
        const shapeIndex = Math.floor(timeSec / cycleLength);
        const nextShapeIndex = shapeIndex + 1;
        
        const timeInCycle = timeSec % cycleLength;
        const morphProgress = Math.max(0, (timeInCycle - (cycleLength - transitionLength)) / transitionLength);
        
        // Smoothstep easing for morph
        const morph = morphProgress * morphProgress * (3 - 2 * morphProgress);
        
        const getShapeCoords = (type, angle, radius) => {
           const shapes = 4;
           type = type % shapes;
           if (type === 0) { // Circle
             return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
           } else if (type === 1) { // 5-petal Flower / Star
             const r = radius * (0.8 + 0.3 * Math.sin(5 * angle));
             return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
           } else if (type === 2) { // Diamond / Square-ish
             const absCos = Math.abs(Math.cos(angle)) || 0.001;
             const absSin = Math.abs(Math.sin(angle)) || 0.001;
             const r = radius * 0.9 * Math.min(1 / absCos, 1 / absSin);
             return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
           } else { // Infinity / Lemniscate
             const scale = radius * 1.3;
             const den = 1 + Math.sin(angle) * Math.sin(angle);
             const x = (scale * Math.cos(angle)) / den;
             const y = (scale * Math.sin(angle) * Math.cos(angle)) / den;
             return { x, y };
           }
        };

        const shape1 = getShapeCoords(shapeIndex, angle, targetRadius);
        const shape2 = getShapeCoords(nextShapeIndex, angle, targetRadius);
        
        const targetOffsetX = shape1.x * (1 - morph) + shape2.x * morph;
        const targetOffsetY = shape1.y * (1 - morph) + shape2.y * morph;
        
        // Target position on the morphed border
        const circleX = targetX + targetOffsetX;
        const circleY = targetY + targetOffsetY;
        
        // Move towards target position on border
        const dx = circleX - this.x;
        const dy = circleY - this.y;
        
        if (effectStrength >= 0.99) {
          // Hard lock to target to prevent scrolling lag
          this.x = circleX;
          this.y = circleY;
        } else {
          this.x += dx * 0.1 * effectStrength;
          this.y += dy * 0.1 * effectStrength;
        }
        
      } else {
        // Evenly distribute shaking particles along the rectangular border
        // Use an assigned angle so particles spread out evenly
        if (this.assignedAngle === undefined) {
           this.assignedAngle = Math.random() * Math.PI * 2;
        }
        // Slowly move them around the border over time
        this.assignedAngle += 0.001; // Dramatically lowered speed
        angle = this.assignedAngle;
        
        // Trace the rectangular border of the card
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        const absCos = Math.abs(Math.cos(angle)) || 0.001;
        const absSin = Math.abs(Math.sin(angle)) || 0.001;
        targetRadius = Math.min(halfW / absCos, halfH / absSin) + 20; // 20px padding outside the border
        
        // Target position on the border
        const borderX = targetX + Math.cos(angle) * targetRadius;
        const borderY = targetY + Math.sin(angle) * targetRadius;
        
        // Move towards target position on border
        const dx = borderX - this.x;
        const dy = borderY - this.y;
        
        if (effectStrength >= 0.99) {
          // Hard lock to target to prevent scrolling lag
          this.x = borderX;
          this.y = borderY;
        } else {
          this.x += dx * 0.1 * effectStrength;
          this.y += dy * 0.1 * effectStrength;
        }
      }
      
    } else {
      // Default twirl behavior (flow field)
      const fieldX = Math.sin(this.y * 0.005 + timeSec) * 2.5 + Math.cos(this.x * 0.005 - timeSec) * 1.5;
      const fieldY = Math.cos(this.x * 0.005 + timeSec) * 2.5 + Math.sin(this.y * 0.005 - timeSec) * 1.5;
      
      this.x += this.speedX + fieldX * effectStrength * 0.5;
      this.y += this.speedY + fieldY * effectStrength * 0.5;
    }
    
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
    
    // Wrap around screen gracefully
    if (this.x < -10) this.x = canvas.width + 10;
    if (this.x > canvas.width + 10) this.x = -10;
    if (this.y < -10) this.y = canvas.height + 10;
    if (this.y > canvas.height + 10) this.y = -10;
  }
  draw() {
    ctx.beginPath();
    
    if (this.isTargetingProfile && this.isCircler && this.targetStrength > 0) {
      // Draw as large colored blobs for the liquid effect
      const blobRadius = this.size * 3.5; 
      ctx.fillStyle = `rgba(${this.specialColor}, 0.95)`;
      ctx.arc(this.x, this.y, blobRadius, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.isTargetingCard && this.isCircler) {
      // Draw as large colored blobs for the liquid effect (Green for interactive card)
      const blobRadius = this.size * 1.5; // Thinner blobs
      ctx.fillStyle = `rgba(16, 185, 129, 0.95)`;
      ctx.arc(this.x, this.y, blobRadius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Default normal blue particle
      ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

  // Increased particle count for better twirling effect
  for (let i = 0; i < 150; i++) particles.push(new Particle());

  let isCanvasVisible = true;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const wasVisible = isCanvasVisible;
      isCanvasVisible = entry.isIntersecting;
      // Restart loop if it becomes visible again
      if (isCanvasVisible && !wasVisible) {
        animateParticles();
      }
    });
  });
  observer.observe(canvas);

  let startTime = Date.now();
  function animateParticles() {
    if (!isCanvasVisible) return;

    const time = Date.now() - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => { p.update(time); p.draw(); });
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        
        const p1 = particles[i];
        const p2 = particles[j];
        
        // Normal radius for connections
        const maxDist = 100;
        
        // Quick distance check before sqrt
        if (Math.abs(dx) > maxDist || Math.abs(dy) > maxDist) continue;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Connect profile particles of the SAME color with a thick bridge to create a liquid/metaball effect
        if (p1.isTargetingProfile && p2.isTargetingProfile && p1.targetStrength > 0.8 && p2.targetStrength > 0.8) {
          if (p1.specialColor === p2.specialColor && dist < 60) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Thick bridge to merge the blobs seamlessly
            const thickness = (1 - dist / 60) * (p1.size * 3.5 + p2.size * 3.5);
            ctx.strokeStyle = `rgba(${p1.specialColor}, 0.95)`;
            ctx.lineWidth = Math.max(1, thickness);
            ctx.lineCap = 'round';
            ctx.stroke();
          }
          continue;
        }
        
        // Connect interactive card particles with a thick green bridge for a liquid effect
        if (p1.isTargetingCard && p2.isTargetingCard && p1.targetStrength > 0.8 && p2.targetStrength > 0.8) {
          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const thickness = (1 - dist / 60) * (p1.size * 1.5 + p2.size * 1.5); // Thinner bridges
            ctx.strokeStyle = `rgba(16, 185, 129, 0.95)`;
            ctx.lineWidth = Math.max(1, thickness);
            ctx.lineCap = 'round';
            ctx.stroke();
          }
          continue;
        }
        
        if (dist < 100) {
          // Default connection
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.08 * (1 - dist / 100)})`;
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
}

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

  // Find Live Dashboard nav link
  const liveDashboardLink = Array.from(document.querySelectorAll('.nav-links a')).find(link => link.getAttribute('href') === 'analytics.html');

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });

  if (liveDashboardLink) {
    if (current === 'dashboard-teaser') {
      liveDashboardLink.classList.add('live-active');
    } else {
      liveDashboardLink.classList.remove('live-active');
    }
  }
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

// ── Theme Toggle & Color Spectrum Background Engine ──
const themeToggle = document.getElementById('themeToggle');
const bgHueSlider = document.getElementById('bgHueSlider');

const applyBgHue = (hue) => {
  const h = parseInt(hue, 10) || 220;
  const isLight = document.body.classList.contains('light-theme');
  
  if (isLight) {
    const primaryHsl = `hsl(${h}, 30%, 96%)`;
    const secondaryHsl = `hsl(${(h + 30) % 360}, 35%, 90%)`;
    const accentHsl = `hsl(${h}, 80%, 45%)`;
    const accentLightHsl = `hsl(${h}, 85%, 35%)`;
    const accentGlowHsl = `hsla(${h}, 80%, 45%, 0.25)`;

    document.documentElement.style.setProperty('--bg-primary', primaryHsl);
    document.documentElement.style.setProperty('--bg-secondary', secondaryHsl);
    document.documentElement.style.setProperty('--accent', accentHsl);
    document.documentElement.style.setProperty('--accent-light', accentLightHsl);
    document.documentElement.style.setProperty('--accent-glow', accentGlowHsl);
  } else {
    const primaryHsl = `hsl(${h}, 45%, 7%)`;
    const secondaryHsl = `hsl(${(h + 40) % 360}, 50%, 12%)`;
    const accentHsl = `hsl(${h}, 85%, 60%)`;
    const accentLightHsl = `hsl(${h}, 90%, 75%)`;
    const accentGlowHsl = `hsla(${h}, 85%, 60%, 0.35)`;

    document.documentElement.style.setProperty('--bg-primary', primaryHsl);
    document.documentElement.style.setProperty('--bg-secondary', secondaryHsl);
    document.documentElement.style.setProperty('--accent', accentHsl);
    document.documentElement.style.setProperty('--accent-light', accentLightHsl);
    document.documentElement.style.setProperty('--accent-glow', accentGlowHsl);
  }

  document.body.style.background = `var(--bg-primary)`;
  localStorage.setItem('ym_bg_hue', h);
};

const savedHue = localStorage.getItem('ym_bg_hue') || '220';

if (themeToggle) {
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
    const currentHue = bgHueSlider ? bgHueSlider.value : (localStorage.getItem('ym_bg_hue') || '220');
    applyBgHue(currentHue);
  });
}

if (bgHueSlider) {
  bgHueSlider.value = savedHue;
  applyBgHue(savedHue);

  bgHueSlider.addEventListener('input', (e) => {
    applyBgHue(e.target.value);
  });

  bgHueSlider.addEventListener('change', (e) => {
    if (typeof trackEvent === 'function') {
      try { trackEvent('spectrum_hue_change', { hue: e.target.value }); } catch(err) {}
    }
  });
} else {
  applyBgHue(savedHue);
}


// ── Scroll Reveal Animations (Staggered with Failsafe) ──
const revealElements = document.querySelectorAll('.reveal, .timeline-item');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger children within the same parent
      const delay = entry.target.dataset.revealDelay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.01, rootMargin: '0px 0px 100px 0px' });

revealElements.forEach((el, i) => {
  el.dataset.revealDelay = i % 5;
  revealObserver.observe(el);
});

// Failsafe to ensure no section stays invisible on mobile or immediate scroll
setTimeout(() => {
  document.querySelectorAll('.reveal, .timeline-item').forEach(el => el.classList.add('visible'));
}, 800);

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
  if (!expand) return;
  const isOpen = expand.classList.contains('open');
  expand.classList.toggle('open');
  if (toggle) {
    toggle.textContent = isOpen ? 'Show more \u2193' : 'Show less \u2191';
  }
  if (typeof UISounds !== 'undefined') {
    isOpen ? UISounds.collapse() : UISounds.expand();
  }
  const companyEl = card.querySelector('.timeline-company') || card.querySelector('.company-name');
  const companyName = companyEl ? companyEl.textContent.trim() : 'Company';
  trackEvent('experience_toggle', { 
    company: companyName,
    action: isOpen ? 'collapse' : 'expand' 
  });
}

// ── Project Toggle & Controls Controller ──
function toggleProject(card, e) {
  // Prevent card expansion if clicking on tags or buttons inside card
  if (e && e.target && (e.target.closest('.project-tag') || e.target.closest('a'))) {
    return;
  }
  const details = card.querySelector('.project-details');
  const toggle = card.querySelector('.project-toggle');
  if (!details || !toggle) return;
  const isOpen = details.classList.contains('open');
  details.classList.toggle('open');
  toggle.textContent = isOpen ? 'Expand Case Study \u2192' : 'Collapse \u2191';
  isOpen ? UISounds.collapse() : UISounds.expand();
  trackEvent('project_toggle', { 
    project: card.querySelector('.project-title')?.textContent || 'Project',
    action: isOpen ? 'collapse' : 'expand' 
  });
}

// ── Interactive Projects Section Controller ──
(function initProjectsSection() {
  function setup() {
    const filterTabs = document.querySelectorAll('#projectFilterTabs .filter-tab');
    const searchInput = document.getElementById('projectSearchInput');
    const clearSearchBtn = document.getElementById('clearProjectSearch');
    const resetFiltersBtn = document.getElementById('resetProjectFiltersBtn');
    const viewButtons = document.querySelectorAll('.projects-view-toggle .view-btn');
    const projectsContainer = document.getElementById('projectsContainer');
    const projectCards = document.querySelectorAll('.project-card');
    const noProjectsMsg = document.getElementById('noProjectsMessage');
    const countDisplay = document.getElementById('projectCountDisplay');
    const tagPills = document.querySelectorAll('.project-tag');

    if (!projectsContainer || !projectCards.length) return;

    let activeCategory = 'all';
    let searchQuery = '';
    let activeTag = '';

    // Restore saved view mode preference
    const savedView = localStorage.getItem('portfolio_project_view') || 'grid';
    if (savedView === 'list') {
      projectsContainer.classList.add('is-list-view');
      viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === 'list');
      });
    }

    function applyFilters() {
      let visibleCount = 0;

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        const company = (card.getAttribute('data-company') || '').toLowerCase();
        const tags = (card.getAttribute('data-tags') || '').toLowerCase();
        const title = (card.querySelector('.project-title')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('.project-desc')?.textContent || '').toLowerCase();

        // Check category tab match
        const matchesCategory = (activeCategory === 'all' || category === activeCategory);

        // Check search query match
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || (
          title.includes(q) || 
          company.includes(q) || 
          tags.includes(q) || 
          desc.includes(q)
        );

        // Check tag match
        const matchesTag = !activeTag || tags.includes(activeTag.toLowerCase());

        const isVisible = matchesCategory && matchesSearch && matchesTag;

        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) visibleCount++;
      });

      // Update count chip & empty state
      if (countDisplay) countDisplay.textContent = visibleCount;
      if (noProjectsMsg) noProjectsMsg.style.display = (visibleCount === 0) ? 'block' : 'none';

      // Update category tab badge counts dynamically if active
      if (typeof trackEvent === 'function') {
        trackEvent('projects_filter_update', {
          category: activeCategory,
          search: searchQuery,
          tag: activeTag,
          visible_count: visibleCount
        });
      }
    }

    // Category Tabs click listeners
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        activeCategory = tab.dataset.filter || 'all';
        activeTag = ''; // clear tag filter when changing tabs

        // Remove active tag styling
        tagPills.forEach(p => p.classList.remove('active-tag'));

        if (typeof UISounds !== 'undefined' && UISounds.click) UISounds.click();
        applyFilters();
      });
    });

    // Search input listener
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        }
        applyFilters();
      });
    }

    // Clear search listener
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        if (typeof UISounds !== 'undefined' && UISounds.click) UISounds.click();
        applyFilters();
      });
    }

    // Reset all filters listener
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        activeCategory = 'all';
        searchQuery = '';
        activeTag = '';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';

        filterTabs.forEach(t => {
          const isAll = t.dataset.filter === 'all';
          t.classList.toggle('active', isAll);
          t.setAttribute('aria-selected', isAll ? 'true' : 'false');
        });

        tagPills.forEach(p => p.classList.remove('active-tag'));
        if (typeof UISounds !== 'undefined' && UISounds.click) UISounds.click();
        applyFilters();
      });
    }

    // View Toggle Buttons listener (Grid vs List)
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewMode = btn.dataset.view;
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (viewMode === 'list') {
          projectsContainer.classList.add('is-list-view');
        } else {
          projectsContainer.classList.remove('is-list-view');
        }

        localStorage.setItem('portfolio_project_view', viewMode);
        if (typeof UISounds !== 'undefined' && UISounds.click) UISounds.click();
        if (typeof trackEvent === 'function') {
          trackEvent('projects_view_change', { mode: viewMode });
        }
      });
    });

    // Tag pills click listener
    tagPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent card expand accordion trigger
        const clickedTag = pill.getAttribute('data-tag') || pill.textContent.trim();

        if (activeTag === clickedTag) {
          activeTag = '';
          pill.classList.remove('active-tag');
        } else {
          tagPills.forEach(p => p.classList.remove('active-tag'));
          pill.classList.add('active-tag');
          activeTag = clickedTag;
        }

        if (typeof UISounds !== 'undefined' && UISounds.click) UISounds.click();
        applyFilters();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();

// ── Wall of Recommendations Data & Modal Handlers ──
const recommendationsData = {
  cc: {
    initials: 'CC',
    avatarClass: 'avatar-cc',
    name: 'Christopher Clarke',
    role: 'Assistant Vice President, Corporate Marketing &middot; EmblemHealth',
    relationship: 'Executive Leadership',
    fullText: [
      "Youssef played a critical and highly valued role in supporting my team’s advertising/marketing efforts to drive patient volume for AdvantageCare Physicians and membership levels for EmblemHealth.",
      "Youssef possesses a rare blend of attributes: technical expertise; a strategic mindset; and an ability to convey complex concepts to non-technical leaders and colleagues so that they understand how his efforts will help them achieve their goals. Youssef routinely stepped in as the voice of reason and clarity when conversations or projects had become unfocused. He also mines experiences from his past roles and can transform and leverage them to meet new objectives. Youssef always brings with him a confident, inquisitive, and calming presence. Managers value his maturity, sterling work ethic, and reliability, and Youssef’s colleagues appreciate his smarts, grounding presence, and positive energy."
    ]
  },
  ce: {
    initials: 'CE',
    avatarClass: 'avatar-ce',
    name: 'Cate Engerrand',
    role: 'Director, Marketing Intelligence &middot; EmblemHealth',
    relationship: 'Department Director',
    fullText: [
      "I led a Marketing Intelligence team with competencies across Research, Advanced Analytics and Marketing Performance at the EmblemHealth Family of Companies. Youssef came into a complex environment across the healthcare system and was able to quickly bring his skills to make a significant impact to our Marketing performance team.",
      "<strong>Notable projects include:</strong>",
      "<ul><li>Leading the charge on recommending and updating our Paid Search strategy to allocate spend into most successful keywords and audience targets.</li><li>Recommending a new UX design on our Find Care tool for our Primary and Specialty Care Provider offices (ACPNY) which led to improvements in both member and provider satisfaction.</li><li>Led the ongoing tracking of website performance for 13 health & wellness retail locations (EmblemHealth Neighborhood Care) that helped improve website traffic but even more important, foot traffic.</li></ul>",
      "Not only did he step in to lead important overhauls, but he was a strong team player who brought a level of confidence and accountability given his background to support across a plethora of competencies. I highly recommend Youssef."
    ]
  },
  kn: {
    initials: 'KN',
    avatarClass: 'avatar-kn',
    name: 'Kyle Nowinski',
    role: 'Senior Analytics Specialist &middot; EmblemHealth',
    relationship: 'Direct Manager',
    fullText: [
      "I had the pleasure of working with and managing Youssef McCarthy from Nov 2023 to Jan 2025 and am happy to provide this letter of recommendation. During his employment at EmblemHealth his input was always welcomed and sought after on everything from new project to a fresh set of eyes on routine reporting. I have no doubts that Youssef would make a welcome addition to any team.",
      "He has a wonderful ability to synthesis data and manage the myriad of problems that arise in any professional endeavor. The strategies he helped craft are still in use at EmblemHealth and I suspect will be for some time to come. Youssef was instrumental in setting up and steering our 2025 annual campaign, getting involved in everything from landing page design, to keyword strategy for search engine marketing, to building and monitoring performance dashboards.",
      "In addition to his professional contributions, Youssef is also a reliable and cordial team member. He is a joy to work with and maintains a pleasant professional demeanor regardless of the work environment. I truly believe he would be a valued asset at any company."
    ]
  },
  am: {
    initials: 'AM',
    avatarClass: 'avatar-am',
    name: 'Andrea Mendes',
    role: 'Former Digital Sales Director &middot; Adtaxi.com',
    relationship: 'Former Direct Manager',
    fullText: [
      "I have had the pleasure of working with Youssef the past few years. He is a bright young man who is highly skilled in many areas of digital marketing especially in Google Analytics. In his role at Adtaxi.com, he spent a good part of the day troubleshooting for many problems that arose from several different platforms and operating systems we used, Salesforce being the most recent CRM we used.",
      "I hired Youssef along with another manager who he directly reported to for a while and I know that manager would highly recommend Youssef as well. His strong communication skills and problem solving skills plus attention to detail were top notch. Our company made some changes in our department last summer and as a result Youssef was aligned under my leadership and I can’t say enough about how he helped shape our new team to be the very best in the NorthEast for Adtaxi.com.",
      "Youssef was also given accolades from our corporate office for getting involved in many projects. He went over and above to build and deliver Google Data Studio dashboards for all our clients without even being asked, and our clients were very impressed and so were we. He would get direct calls from our clients, when usually the communication procedure went through the sales executive. He has that kind of rapport and they counted on him immensely.",
      "Another quality that Youssef has is that he really cares about the clients and their business, he spent many hours with me and my sales staff sitting in meetings with clients and understanding their challenges, goals, and struggles, and he was quick to lend a hand, provide direction on which way was the best, backed up with data to support what he was recommending.",
      "Youssef has my highest recommendation, and I am happy to furnish more details if you would like additional information. If he is applying to your company, look no further. He is a keeper and I would hire him back in a second if I am ever given the chance to work with him again."
    ]
  },
  jl: {
    initials: 'JL',
    avatarClass: 'avatar-jl',
    name: 'Jacob Loeb',
    role: 'Regional Operations Director &middot; Media News Group',
    relationship: 'Direct Supervisor',
    fullText: [
      "I would like to recommend Youssef McCarthy as a candidate for a position with your organization. I directly supervised Youssef while he was the Lead Digital Account Strategist at Media News Group’s Northeast Region between 2018 & 2020. Youssef did an exemplary job while in this position and demonstrated the critical skill that would make him an excellent employee for your company.",
      "During that timeframe Youssef was the lead Strategist on a digital operations team that fulfilled local digital campaigns for 7 daily newspaper websites, all advanced digital campaigns including Google Search Engine marketing, Programmatic display & Facebook. Youssef was an indispensable part of my team during this time frame. His ability to use critical thinking helped the company reorganize a shorted staffed department by creating efficiencies in the workflow, allowing us to operate at the same capacity that we had while full staffed.",
      "He has excellent verbal and written communication skills and can accomplish any task with little supervision in either an office or work from home setting.",
      "Youssef McCarthy would add tremendous value to any company, and I recommend him for any position that he chooses to pursue."
    ]
  },
  da: {
    initials: 'DA',
    avatarClass: 'avatar-da',
    name: 'Domenic Armano',
    role: 'Senior Analytics & Platform Project Manager &middot; Potpourri Group',
    relationship: 'Project Manager',
    fullText: [
      "I would like to recommend Youssef McCarthy as a digital marketer or any computer system support role.",
      "Youssef reported to me at Potpourri Group from August to December 2016 in a part-time temporary role. In this role he collected data from recorded user tests and collect and report on KPI's related to the fifteen websites that are part of our portfolio.",
      "I thoroughly enjoyed my time working with Youssef, and came to know him as a very valuable asset to any team. He is honest, dependable, and incredibly hard-working. What impressed me the most however, was his relentless pursuit of more knowledge, wanting to go above and beyond, doing more than he was asked consistently, and never being intimidated by challenges and obstacles he encountered. One such example, was work Youssef completed on a shopper's experience test. I was looking for Youssef to provide me some specific examples of the product detail page experience and some data points that might shed light on upcoming trends; Youssef created a report projecting transaction growth based on the improvement of specific pain points in the product detail page that would lead to more conversions, and the probable impact on conversion rates.",
      "Without a doubt, I confidently recommend Youssef to be a part of any eCommerce or IT team. As a driven and motivated employee and an all-around great person, I know that he will make a positive, productive impact to any organization."
    ]
  }
};

function openRecommendationModal(id) {
  const data = recommendationsData[id];
  if (!data) return;

  const overlay = document.getElementById('recModalOverlay');
  const avatar = document.getElementById('recModalAvatar');
  const name = document.getElementById('recModalName');
  const role = document.getElementById('recModalRole');
  const relationship = document.getElementById('recModalRelationship');
  const body = document.getElementById('recModalBody');

  if (avatar) {
    avatar.textContent = data.initials;
    avatar.className = `rec-modal-avatar ${data.avatarClass}`;
  }
  if (name) name.textContent = data.name;
  if (role) role.innerHTML = data.role;
  if (relationship) relationship.textContent = data.relationship;

  if (body) {
    body.innerHTML = data.fullText.map(para => `<p>${para}</p>`).join('');
  }

  if (overlay) {
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  if (window.UISounds && typeof UISounds.pop === 'function') {
    UISounds.pop();
  }

  if (window.dataLayer) {
    window.dataLayer.push({
      'event': 'recommendation_modal_open',
      'author_name': data.name,
      'author_role': data.role.replace('&middot;', '-'),
      'page_section': 'recommendations_wall'
    });
  }
}

function closeRecommendationModal() {
  const overlay = document.getElementById('recModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (window.UISounds && typeof UISounds.click === 'function') {
    UISounds.click();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('recModalOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeRecommendationModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeRecommendationModal();
    }
  });
});

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

// ── Reading Progress Bar ──
window.addEventListener('scroll', () => {
  const progressBar = document.getElementById('readingProgressBar');
  if (progressBar) {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = progress + '%';
  }
});

// ── AI Chat Assistant Logic ──
const aiToggleBtn = document.getElementById('aiToggleBtn');
const aiChatWindow = document.getElementById('aiChatWindow');
const aiCloseBtn = document.getElementById('aiCloseBtn');
const aiChatBody = document.getElementById('aiChatBody');
const aiPrompts = document.querySelectorAll('.ai-prompt-btn');
const aiChatForm = document.getElementById('aiChatForm');
const aiInputField = document.getElementById('aiInputField');

if (aiToggleBtn && aiChatWindow) {
  aiToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    aiChatWindow.classList.toggle('open');
    if (typeof UISounds !== 'undefined' && UISounds.click) {
      try { UISounds.click(); } catch(err) {}
    }
    if (typeof trackEvent === 'function') {
      try { trackEvent('ai_widget_toggle', { action: aiChatWindow.classList.contains('open') ? 'open' : 'close' }); } catch(err) {}
    }
  });

  if (aiCloseBtn) {
    aiCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      aiChatWindow.classList.remove('open');
      if (typeof UISounds !== 'undefined' && UISounds.collapse) {
        try { UISounds.collapse(); } catch(err) {}
      }
    });
  }
}



  // Overhauled Multi-Page AI Copilot & Intelligent Knowledge Engine
  function getBotResponse(userText) {
    const query = userText.toLowerCase().trim();
    
    // 1. Navigation / Directory Requests
    if (query === 'navigate' || query.includes('navigation') || query.includes('where is') || query.includes('site map') || query.includes('pages') || query.includes('directory') || query.includes('go to') || query.includes('sections') || query.includes('find')) {
      return `🗺️ <strong>Site Navigation Map</strong><br>I can guide you directly to any page or section across Youssef's portfolio:<br>
      <div class="chat-nav-group">
        <a href="index.html" class="chat-nav-btn">🏠 Home Overview</a>
        <a href="experience.html" class="chat-nav-btn">💼 Career Experience</a>
        <a href="projects.html" class="chat-nav-btn">🚀 High-Impact Projects</a>
        <a href="analytics.html" class="chat-nav-btn">📊 Live Analytics Hub</a>
        <a href="collaboration.html" class="chat-nav-btn">🎨 Strategic UX Synergy</a>
        <a href="editorials.html" class="chat-nav-btn">📝 Thought Leadership</a>
        <a href="skills.html" class="chat-nav-btn">🛠️ Technical Tech Stack</a>
        <a href="education.html" class="chat-nav-btn">🎓 Education &amp; Testimonials</a>
        <a href="Youssef_McCarthy_Resume.pdf" download class="chat-nav-btn">📄 Download Resume PDF</a>
      </div>`;
    }

    // 2. GA4 & Analytics Architecture
    if (query === 'ga4' || query.includes('analytics') || query.includes('tracking') || query.includes('measurement') || query.includes('gtm') || query.includes('data layer') || query.includes('taxonomy') || query.includes('bigquery') || query.includes('attribution')) {
      return `📊 <strong>Analytics &amp; Measurement Architecture</strong><br>
      Youssef McCarthy is an enterprise <strong>Analytics Director &amp; Architect</strong> with 14+ years of hands-on mastery in GA4, Adobe Analytics, custom GTM data layer design, BigQuery ELT pipelines, and multi-channel attribution.<br><br>
      • <strong>Taxonomy Audits:</strong> Eliminates data debt and cleans fragmented event parameters.<br>
      • <strong>Server-Side Tagging:</strong> First-party tracking resilience against ad blockers and ITP limits.<br>
      • <strong>BigQuery &amp; SQL:</strong> Advanced path analysis, cohort retention, and raw log queries.<br>
      <div class="chat-nav-group">
        <a href="analytics.html" class="chat-nav-btn">📊 Open Live Dashboard</a>
        <a href="projects.html#ga4" class="chat-nav-btn">🚀 GA4 Case Studies</a>
        <a href="skills.html" class="chat-nav-btn">🛠️ Analytics Tech Stack</a>
      </div>`;
    }

    // 3. CRO & A/B Testing
    if (query === 'cro' || query.includes('testing') || query.includes('experiment') || query.includes('a/b') || query.includes('multivariate') || query.includes('conversion') || query.includes('optimizely') || query.includes('vwo') || query.includes('friction') || query.includes('checkout') || query.includes('hotjar')) {
      return `📈 <strong>Conversion Rate Optimization &amp; Experimentation</strong><br>
      Youssef has led full-lifecycle CRO programs across major agencies and health enterprise brands:<br><br>
      • <strong>Scientific A/B &amp; MVT:</strong> Hypothesis generation, Bayesian/Frequentist significance models, and Optimizely/VWO executions.<br>
      • <strong>Cognitive UX Audits:</strong> Heatmapping, session replay analysis (Hotjar/Clarity), and Hick's Law checkout friction removal.<br>
      • <strong>Proven Impact:</strong> Engineered CRO overhauls yielding 300%+ ROAS gains and major transaction uplifts.<br>
      <div class="chat-nav-group">
        <a href="projects.html#cro" class="chat-nav-btn">🚀 View CRO Case Studies</a>
        <a href="collaboration.html" class="chat-nav-btn">🎨 Interactive UX Synergy</a>
        <a href="experience.html" class="chat-nav-btn">💼 Career Experience</a>
      </div>`;
    }

    // 4. Agentic AI & AI Automation
    if (query === 'ai' || query.includes('agent') || query.includes('loop') || query.includes('orchestration') || query.includes('claude') || query.includes('gemini') || query.includes('gpt') || query.includes('llama') || query.includes('autonomous') || query.includes('virtual war room')) {
      return `🤖 <strong>Agentic AI &amp; Automated Virtual War Room</strong><br>
      Youssef engineered the <strong>Agentic Loop Architecture</strong> — an autonomous multi-agent virtual war room that coordinates specialized LLM agents (Data Scientist, UX Designer, CRO Specialist) to analyze user telemetry and auto-deploy recommendations.<br><br>
      • <strong>Frontier LLM Routing:</strong> Dynamic task routing across Claude 3.7, Gemini 1.5, GPT-4o, and Llama 3.<br>
      • <strong>Automated Analytics:</strong> Agents digest GA4 raw logs, write SQL queries, and draft CRO hypotheses in real time.<br>
      <div class="chat-nav-group">
        <a href="editorials.html" class="chat-nav-btn">📝 Read Agentic Loop Essay</a>
        <a href="skills.html" class="chat-nav-btn">🛠️ AI Tech Stack</a>
        <a href="projects.html" class="chat-nav-btn">🚀 AI Case Studies</a>
      </div>`;
    }

    // 5. Localist AI & Data Privacy
    if (query === 'local' || query.includes('localist') || query.includes('privacy') || query.includes('sovereignty') || query.includes('onprem') || query.includes('hardware') || query.includes('open-weights') || query.includes('dhh') || query.includes('server')) {
      return `🔒 <strong>The Localist AI Manifesto &amp; Privacy</strong><br>
      Youssef is a pioneer in <strong>local open-weights AI deployment</strong> and hardware repatriation (inspired by DHH and Hugging Face):<br><br>
      • <strong>Data Sovereignty:</strong> Hosts fine-tuned open-weights models locally to guarantee zero corporate database leakage.<br>
      • <strong>Zero Token Tax:</strong> Eliminates unpredictable monthly API charges with dedicated local hardware.<br>
      <div class="chat-nav-group">
        <a href="editorials.html" class="chat-nav-btn">📝 Read Localist Essay</a>
        <a href="skills.html" class="chat-nav-btn">🛠️ Infrastructure Tech Stack</a>
      </div>`;
    }

    // 6. Career & Experience Timeline
    if (query === 'experience' || query.includes('emblem') || query.includes('c-4') || query.includes('timeline') || query.includes('career') || query.includes('history') || query.includes('leadership') || query.includes('management') || query.includes('budget') || query.includes('background')) {
      return `💼 <strong>14+ Years Career Leadership Timeline</strong><br>
      Youssef McCarthy's leadership record spans high-stakes enterprise health brands and digital agencies:<br><br>
      • <strong>EmblemHealth:</strong> Assistant Vice President, Corporate Marketing &amp; Analytics — directed multi-million dollar budgets, cross-channel attribution, and agency teams.<br>
      • <strong>C-4 Analytics:</strong> Analytics Lead / Architect — built automated client reporting hubs, CRO testing frameworks, and multi-channel attribution suites.<br>
      <div class="chat-nav-group">
        <a href="experience.html" class="chat-nav-btn">💼 Open Career Experience Page</a>
        <a href="education.html" class="chat-nav-btn">🎓 View Testimonials</a>
        <a href="Youssef_McCarthy_Resume.pdf" download class="chat-nav-btn">📄 Download Resume PDF</a>
      </div>`;
    }

    // 7. Case Studies & Projects
    if (query === 'projects' || query.includes('case study') || query.includes('portfolio') || query.includes('churn') || query.includes('roas') || query.includes('campaign') || query.includes('work')) {
      return `🚀 <strong>High-Impact Case Studies &amp; Portfolio Projects</strong><br>
      Explore Youssef's verified analytics and growth projects:<br><br>
      • <strong>GA4 Server-Side Multi-Channel Overhaul:</strong> Unified 12+ touchpoints into a real-time data layer.<br>
      • <strong>Predictive Churn Model:</strong> Machine learning model predicting high-value subscription churn.<br>
      • <strong>300%+ ROAS CRO Campaign:</strong> Checkout funnel restructuring driven by Bayesian A/B testing.<br>
      <div class="chat-nav-group">
        <a href="projects.html" class="chat-nav-btn">🚀 View All Case Studies</a>
        <a href="analytics.html" class="chat-nav-btn">📊 Launch Live Dashboard</a>
      </div>`;
    }

    // 8. Live Interactive Dashboard
    if (query === 'dashboard' || query.includes('looker') || query.includes('live') || query.includes('telemetry') || query.includes('metrics') || query.includes('data studio') || query.includes('hub')) {
      return `📊 <strong>Live Marketing Intelligence Showcase</strong><br>
      Experience Youssef's interactive Looker Studio / GA4 telemetry hub directly on the site:<br><br>
      • Real-time multi-channel traffic distribution, conversion pathways, and device split.<br>
      • E-commerce item velocity diagnostics and CRO strategic playbooks.<br>
      <div class="chat-nav-group">
        <a href="analytics.html" class="chat-nav-btn">🚀 Launch Live Analytics Hub</a>
      </div>`;
    }

    // 9. UX Collaboration & Design Systems
    if (query === 'collab' || query.includes('collaboration') || query.includes('synergy') || query.includes('design system') || query.includes('cyber') || query.includes('brutalism') || query.includes('ux') || query.includes('paradigm')) {
      return `🎨 <strong>Strategic UX Synergy &amp; Design Systems</strong><br>
      Experience the continuous feedback loop between analytics and design:<br><br>
      • <strong>5 Dynamic Design Systems:</strong> Instantly morph the entire layout across Cyber Neon, Minimalist Glass, Brutalism, Corporate Dark, and Warm Editorial.<br>
      • Interactive A/B test simulator demonstrating statistical power and conversion uplift.<br>
      <div class="chat-nav-group">
        <a href="collaboration.html" class="chat-nav-btn">🎨 Open UX Collaboration Hub</a>
      </div>`;
    }

    // 10. Technical Skills & Tech Stack
    if (query === 'skills' || query.includes('stack') || query.includes('tech') || query.includes('tools') || query.includes('languages') || query.includes('python') || query.includes('sql') || query.includes('react') || query.includes('node') || query.includes('adobe') || query.includes('google')) {
      return `🛠️ <strong>Comprehensive Technical Stack</strong><br>
      • <strong>Analytics &amp; Data:</strong> GA4, GTM (Client &amp; Server-side), Adobe Analytics, Adobe Target, BigQuery, SQL.<br>
      • <strong>Agentic AI:</strong> Claude 3.7, Gemini 1.5 Pro, GPT-4o, Llama 3, LangChain, Multi-Agent Architecture.<br>
      • <strong>CRO &amp; Research:</strong> Optimizely, VWO, Hotjar, Microsoft Clarity, UserTesting.<br>
      • <strong>Engineering &amp; Cloud:</strong> Python, Node.js, React, HTML5/CSS3, Three.js, GCP.<br>
      <div class="chat-nav-group">
        <a href="skills.html" class="chat-nav-btn">🛠️ View Full Skills Matrix</a>
        <a href="experience.html" class="chat-nav-btn">💼 View Experience</a>
      </div>`;
    }

    // 11. Education & Recommendations
    if (query === 'education' || query.includes('umass') || query.includes('degree') || query.includes('certification') || query.includes('recommend') || query.includes('testimonial') || query.includes('clarke') || query.includes('praise')) {
      return `🎓 <strong>Education &amp; Executive Testimonials</strong><br>
      • <strong>Education:</strong> University of Massachusetts (UMass) academic background.<br>
      • <strong>Certifications:</strong> Google Analytics Certified, Enterprise Data Strategy, Advanced CRO.<br>
      • <strong>Executive Praise:</strong> Read full recommendation letters from Christopher Clarke (Assistant Vice President, EmblemHealth) and corporate C-suite leadership.<br>
      <div class="chat-nav-group">
        <a href="education.html" class="chat-nav-btn">🎓 View Recommendations &amp; Education</a>
      </div>`;
    }

    // 12. Resume PDF Download
    if (query === 'resume' || query.includes('cv') || query.includes('pdf') || query.includes('download')) {
      return `📄 <strong>Youssef McCarthy — Formal Resume</strong><br>
      Download Youssef's official executive resume or inspect his detailed career timeline online:<br>
      <div class="chat-nav-group">
        <a href="Youssef_McCarthy_Resume.pdf" download class="chat-nav-btn">⬇️ Download Resume PDF</a>
        <a href="experience.html" class="chat-nav-btn">💼 View Online Career Timeline</a>
      </div>`;
    }

    // 13. Contact & Hiring Intent
    if (query === 'contact' || query.includes('hire') || query.includes('consulting') || query.includes('reach') || query.includes('email') || query.includes('meet') || query.includes('advisory') || query.includes('message')) {
      return `✉️ <strong>Connect &amp; Partner with Youssef</strong><br>
      Youssef is available for Director-level Analytics &amp; AI strategy roles, as well as enterprise CRO advisory consulting:<br>
      <div class="chat-nav-group">
        <a href="mailto:youssef.mccarthy@example.com" class="chat-nav-btn">✉️ Send Direct Email</a>
        <a href="https://linkedin.com/in/youssefmccarthy" target="_blank" rel="noopener" class="chat-nav-btn">🔗 Connect on LinkedIn</a>
        <a href="Youssef_McCarthy_Resume.pdf" download class="chat-nav-btn">📄 Download Resume PDF</a>
      </div>`;
    }

    // 14. Greetings & Orientation
    if (query.includes('hello') || query.includes('hi ') || query.startsWith('hi') || query.includes('hey') || query.includes('greetings') || query.includes('welcome') || query.includes('copilot') || query.includes('bot')) {
      return `Hello! 👋 I'm Youssef's <strong>Site-Wide AI Copilot</strong>.<br><br>
      How can I assist you today? You can ask me about his 14+ years in digital analytics, CRO experimentation, the Agentic Loop, or click any page below to navigate directly:<br>
      <div class="chat-nav-group">
        <a href="navigate" class="chat-nav-btn">🗺️ Site Navigation Map</a>
        <a href="analytics.html" class="chat-nav-btn">📊 Live Dashboard</a>
        <a href="experience.html" class="chat-nav-btn">💼 Career Experience</a>
        <a href="Youssef_McCarthy_Resume.pdf" download class="chat-nav-btn">📄 Resume PDF</a>
      </div>`;
    }

    // 15. Default Intelligent Fallback
    return `I am specialized in Youssef's portfolio, analytics architecture, CRO testing, and AI implementations! Here are some recommended areas to explore:<br>
    <div class="chat-nav-group">
      <a href="navigate" class="chat-nav-btn">🗺️ Site Navigation Map</a>
      <a href="analytics.html" class="chat-nav-btn">📊 Live Dashboard</a>
      <a href="experience.html" class="chat-nav-btn">💼 Career Timeline</a>
      <a href="projects.html" class="chat-nav-btn">🚀 Case Studies</a>
      <a href="Youssef_McCarthy_Resume.pdf" download class="chat-nav-btn">📄 Download Resume</a>
    </div>`;
  }

  // Handle Response Generation with pulsing Typing Indicator
  function handleResponse(inputText, queryKey = '') {
    // 1. Append User Bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message ai-user';
    userMsg.innerText = inputText;
    aiChatBody.appendChild(userMsg);
    UISounds.click();
    
    // Scroll to bottom
    aiChatBody.scrollTop = aiChatBody.scrollHeight;

    // 2. Append Pulsing Typing Indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'ai-message ai-system typing';
    typingIndicator.innerHTML = '<span class="thinking-text" style="color:var(--text-muted); opacity:0.6; font-style:italic;">Thinking...</span>';
    aiChatBody.appendChild(typingIndicator);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;

    // 3. Process & Display System Response
    const responseDelay = 500 + Math.random() * 400; // Fast responsive cognitive lag
    setTimeout(() => {
      // Remove typing bubble
      if (typingIndicator.parentNode) {
        typingIndicator.parentNode.removeChild(typingIndicator);
      }

      // Add system message bubble (allow HTML rendering)
      const aiMsg = document.createElement('div');
      aiMsg.className = 'ai-message ai-system';
      
      const searchKey = queryKey || inputText;
      aiMsg.innerHTML = getBotResponse(searchKey);
      aiChatBody.appendChild(aiMsg);
      
      UISounds.chime();
      aiChatBody.scrollTop = aiChatBody.scrollHeight;
      
      trackEvent('ai_chat_interaction', { input: inputText, matchKey: searchKey });
    }, responseDelay);
  }

  // Handle Quick-Chip Prompt Clicks (Using currentTarget for robust click-target detection)
  aiPrompts.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const query = e.currentTarget.dataset.query;
      const text = e.currentTarget.innerText;
      handleResponse(text, query);
    });
  });

  // ── Infinite Prompts Carousel Banner Logic ──
  const track = document.getElementById('aiChatPromptsTrack');
  const prevBtn = document.getElementById('aiCarouselPrev');
  const nextBtn = document.getElementById('aiCarouselNext');
  const carouselContainer = document.getElementById('aiPromptsCarousel');
  
  if (track && prevBtn && nextBtn && carouselContainer) {
    let isTransitioning = false;
    let autoRotateInterval = null;

    function slideNext() {
      if (isTransitioning) return;
      isTransitioning = true;
      
      const firstBtn = track.firstElementChild;
      if (!firstBtn) {
        isTransitioning = false;
        return;
      }
      
      // Calculate dynamic offset (button width + gap)
      const shiftWidth = firstBtn.offsetWidth + 8;
      
      // Perform smooth transition
      track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      track.style.transform = `translateX(-${shiftWidth}px)`;
      
      // When transition ends, append node to loop endlessly and reset translate position
      setTimeout(() => {
        track.style.transition = 'none';
        track.appendChild(firstBtn);
        track.style.transform = 'translateX(0)';
        // Force reflow
        track.offsetHeight;
        isTransitioning = false;
      }, 400);
    }

    function slidePrev() {
      if (isTransitioning) return;
      isTransitioning = true;
      
      const lastBtn = track.lastElementChild;
      if (!lastBtn) {
        isTransitioning = false;
        return;
      }
      
      const shiftWidth = lastBtn.offsetWidth + 8;
      
      // Instantly prepend the last button to the start and translate offset to align
      track.style.transition = 'none';
      track.insertBefore(lastBtn, track.firstElementChild);
      track.style.transform = `translateX(-${shiftWidth}px)`;
      
      // Force reflow
      track.offsetHeight;
      
      // Smoothly animate back to 0
      track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      track.style.transform = 'translateX(0)';
      
      setTimeout(() => {
        isTransitioning = false;
      }, 400);
    }

    // Manual navigation event listeners
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      slidePrev();
      UISounds.click();
      resetAutoRotate();
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      slideNext();
      UISounds.click();
      resetAutoRotate();
    });

    // Auto-rotation timer setup
    function startAutoRotate() {
      if (autoRotateInterval) return;
      autoRotateInterval = setInterval(() => {
        // Rotate only when the widget window is active and open
        if (aiChatWindow.classList.contains('open')) {
          slideNext();
        }
      }, 3500);
    }

    function stopAutoRotate() {
      if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
      }
    }

    function resetAutoRotate() {
      stopAutoRotate();
      startAutoRotate();
    }

    // Initialize auto rotation
    startAutoRotate();

    // Hover listeners to pause sliding when exploring
    carouselContainer.addEventListener('mouseenter', stopAutoRotate);
    carouselContainer.addEventListener('mouseleave', startAutoRotate);
  }

  // Handle Custom Message Submission
  if (aiChatForm && aiInputField) {
    aiChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = aiInputField.value.trim();
      if (message) {
        handleResponse(message);
        aiInputField.value = ''; // Reset input
      }
    });
  }

  // Handle delegate clicks on inside-chat navigation hyperlinks & action buttons
  aiChatBody.addEventListener('click', (e) => {
    const link = e.target.closest('.chat-link') || e.target.closest('.chat-nav-btn');
    if (link) {
      const href = link.getAttribute('href');
      if (href) {
        if (href === 'navigate') {
          e.preventDefault();
          handleResponse('Show Site Navigation Map', 'navigate');
        } else if (href.startsWith('#')) {
          e.preventDefault();
          
          // Collapse Chat Assistant Widget for visibility
          aiChatWindow.classList.remove('open');
          UISounds.collapse();
          
          // Find and smooth scroll to targeted section
          const targetEl = document.querySelector(href);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Trigger the pulse glow on section
            targetEl.classList.add('section-highlight');
            setTimeout(() => {
              targetEl.classList.remove('section-highlight');
            }, 2200);
          }
        } else if (!href.startsWith('http') && !href.startsWith('mailto:') && href.endsWith('.pdf')) {
        }
      }
    }
  });


// ── Live Marketing Intelligence Showcase Teaser Module ──
(function() {
  const tabs = document.querySelectorAll('.teaser-tab');
  const metricPill = document.getElementById('teaserMetricPill');
  const terminalBody = document.getElementById('teaserTerminalBody');
  const pageTitle = document.getElementById('teaserPageTitle');
  const pageDesc = document.getElementById('teaserPageDesc');
  const kpisContainer = document.getElementById('teaserKPIs');
  const takeawayText = document.getElementById('teaserTakeaway');
  const visualizationContainer = document.getElementById('teaserVisualization');

  if (!tabs.length || !terminalBody) return;

  // Pages Data Dictionary matching live analytics dashboard details
  const pagesData = {
    "1": {
      pill: "Telemetry Status: Active",
      title: "Page 1: Google Analytics Overview",
      desc: "The primary control panel of the dashboard. It delivers a high-level, consolidated diagnostic pulse of total user traffic, engagement rate, transaction velocity, and overall revenue yield at a glance.",
      kpis: [
        { label: "Users", num: "89,615" },
        { label: "Sessions", num: "105,601" },
        { label: "Conv. Rate", num: "1.03%" },
        { label: "Revenue", num: "$186,587" }
      ],
      takeaway: "Uncovers critical traffic drops and transactional deviations. Despite solid traffic, the low conversion rate (1.03%) highlights a major checkout abandonment bottleneck that requires immediate form-field optimization.",
      svg: `<div class="mini-chart chart-container">
              <svg viewBox="0 0 300 150">
                <defs>
                  <linearGradient id="chartGlow1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                  </linearGradient>
                  <linearGradient id="chartGlow1-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255,255,255,0.04)" />
                <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.04)" />
                <line x1="0" y1="120" x2="300" y2="120" stroke="rgba(255,255,255,0.04)" />
                <path d="M 0,130 Q 50,40 100,90 T 200,50 T 300,30 L 300,150 L 0,150 Z" fill="url(#chartGlow1)" />
                <path d="M 0,140 Q 60,70 120,110 T 240,65 T 300,45 L 300,150 L 0,150 Z" fill="url(#chartGlow1-rev)" />
                <path d="M 0,130 Q 50,40 100,90 T 200,50 T 300,30" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" />
                <path d="M 0,140 Q 60,70 120,110 T 240,65 T 300,45" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-dasharray="4,4" />
                <circle cx="300" cy="30" r="5" fill="#3b82f6" />
                <circle cx="300" cy="30" r="10" fill="none" stroke="#3b82f6" stroke-width="2" style="transform-origin: 300px 30px; animation: pulseGlow 1.5s infinite ease-out;" />
                <circle cx="300" cy="45" r="4.5" fill="#a78bfa" />
              </svg>
            </div>`
    },
    "2": {
      pill: "Cohort Segment Analysis",
      title: "Page 2: Website Demographics",
      desc: "Demystifies the store's user cohorts by dissecting demographic profiles, device preferences, browser ecosystems, and temporal engagement patterns.",
      kpis: [
        { label: "Mobile Users", num: "62,431" },
        { label: "Desktop Users", num: "44,879" },
        { label: "Chrome Users", num: "77,035" },
        { label: "Safari Users", num: "4,863" }
      ],
      takeaway: "Mobile sessions massively dominate desktop, yet Safari browser traffic accounts for only 4,863 users compared to Chrome's 77,035. This massive gap points to potential Safari rendering bugs or Safari-pay checkout errors that need to be audited.",
      svg: `<div class="mini-chart chart-container">
              <svg viewBox="0 0 300 150">
                <line x1="40" y1="10" x2="40" y2="120" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
                <line x1="40" y1="120" x2="280" y2="120" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
                <g>
                  <!-- Chrome (Mobile) -->
                  <rect x="65" y="30" width="22" height="90" rx="2" fill="#3b82f6" style="transform-origin: bottom; animation: growBar 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;" />
                  <text x="76" y="132" fill="rgba(255,255,255,0.5)" font-size="7.5" font-family="'JetBrains Mono', monospace" text-anchor="middle">Chrome</text>
                  
                  <!-- Safari (Mobile) -->
                  <rect x="115" y="105" width="22" height="15" rx="2" fill="#a78bfa" style="transform-origin: bottom; animation: growBar 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;" />
                  <text x="126" y="132" fill="rgba(255,255,255,0.5)" font-size="7.5" font-family="'JetBrains Mono', monospace" text-anchor="middle">Safari</text>
                  
                  <!-- Chrome (Desktop) -->
                  <rect x="165" y="50" width="22" height="70" rx="2" fill="#10b981" style="transform-origin: bottom; animation: growBar 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;" />
                  <text x="176" y="132" fill="rgba(255,255,255,0.5)" font-size="7.5" font-family="'JetBrains Mono', monospace" text-anchor="middle">Chrome Desk</text>

                  <!-- Edge (Desktop) -->
                  <rect x="215" y="95" width="22" height="25" rx="2" fill="#f59e0b" style="transform-origin: bottom; animation: growBar 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;" />
                  <text x="226" y="132" fill="rgba(255,255,255,0.5)" font-size="7.5" font-family="'JetBrains Mono', monospace" text-anchor="middle">Edge Desk</text>
                </g>
              </svg>
            </div>`
    },
    "3": {
      pill: "Spatial Valuation",
      title: "Page 3: Geography",
      desc: "Exposes the spatial distribution of your traffic, cross-referencing user density with local monetary value to identify geographic zones with the highest return on investment.",
      kpis: [
        { label: "US Share", num: "50.9%" },
        { label: "India Share", num: "15.1%" },
        { label: "SF Valuation", num: "$16.73" },
        { label: "Toronto Value", num: "$12.73" }
      ],
      takeaway: "California and Ontario yield premium valuations (e.g., $16.73 per user in San Francisco and $12.73 in Toronto). Conversely, India holds a high user volume (15.1% of total) but yields $0.00 revenue, signaling localized shipping limits or payment gateway integration gaps.",
      svg: `<div class="mini-chart chart-container">
              <svg viewBox="0 0 300 150">
                <circle cx="50" cy="80" r="2.5" fill="rgba(255,255,255,0.06)" />
                <circle cx="70" cy="60" r="2.5" fill="rgba(255,255,255,0.06)" />
                <circle cx="100" cy="50" r="2.5" fill="rgba(255,255,255,0.06)" />
                <circle cx="120" cy="90" r="2.5" fill="rgba(255,255,255,0.06)" />
                <circle cx="150" cy="110" r="2.5" fill="rgba(255,255,255,0.06)" />
                <circle cx="180" cy="70" r="2.5" fill="rgba(255,255,255,0.06)" />
                <circle cx="210" cy="80" r="2.5" fill="rgba(255,255,255,0.06)" />
                <circle cx="240" cy="60" r="2.5" fill="rgba(255,255,255,0.06)" />
                <circle cx="260" cy="100" r="2.5" fill="rgba(255,255,255,0.06)" />
                <g>
                  <line x1="80" y1="55" x2="135" y2="35" stroke="rgba(59, 130, 246, 0.4)" stroke-width="1" stroke-dasharray="3,3" />
                  <circle cx="80" cy="55" r="4.5" fill="#3b82f6" />
                  <circle cx="80" cy="55" r="11" fill="none" stroke="#3b82f6" stroke-width="1.5" style="transform-origin: 80px 55px; animation: pulseGlow 1.8s infinite ease-out;" />
                  <text x="140" y="38" fill="#3b82f6" font-size="7.5" font-family="'JetBrains Mono', monospace" font-weight="700">SF: $16.73</text>
                </g>
                <g>
                  <line x1="110" y1="65" x2="165" y2="55" stroke="rgba(167, 139, 250, 0.4)" stroke-width="1" stroke-dasharray="3,3" />
                  <circle cx="110" cy="65" r="4" fill="#a78bfa" />
                  <circle cx="110" cy="65" r="9" fill="none" stroke="#a78bfa" stroke-width="1.5" style="transform-origin: 110px 65px; animation: pulseGlow 1.8s infinite ease-out; animation-delay: 0.5s;" />
                  <text x="170" y="58" fill="#a78bfa" font-size="7.5" font-family="'JetBrains Mono', monospace" font-weight="700">Toronto: $12.73</text>
                </g>
                <g>
                  <circle cx="225" cy="85" r="4" fill="#ef4444" />
                  <circle cx="225" cy="85" r="8" fill="none" stroke="#ef4444" stroke-width="1" style="transform-origin: 225px 85px; animation: pulseGlow 1.5s infinite ease-out; animation-delay: 1s;" />
                  <text x="225" y="103" fill="#ef4444" font-size="7" font-weight="700" text-anchor="middle">India: High Vol / $0 Revenue</text>
                </g>
              </svg>
            </div>`
    },
    "4": {
      pill: "Spatial High-Precision Logistics",
      title: "Page 4: World Map",
      desc: "A full-screen, high-precision spatial mapping interface designed to track physical store locations, popup events, or regional warehouse shipping distributions.",
      kpis: [
        { label: "Points Indexed", num: "142" },
        { label: "Regional Hubs", num: "8" },
        { label: "Core POS Hubs", num: "3" },
        { label: "GPS Precision", num: "High" }
      ],
      takeaway: "Allows for hyper-localized offline promotions and geo-fenced search ad campaigns within a 5-mile radius of pins showing high physical sales volume.",
      svg: `<div class="mini-chart chart-container">
              <svg viewBox="0 0 300 150">
                <defs>
                  <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18"/>
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                  </radialGradient>
                </defs>
                <path d="M15 0 L15 150 M60 0 L60 150 M105 0 L105 150 M150 0 L150 150 M195 0 L195 150 M240 0 L240 150 M285 0 L285 150" stroke="rgba(255,255,255,0.015)" stroke-width="0.75" />
                <path d="M0 20 L300 20 M0 55 L300 55 M0 90 L300 90 M0 125 L300 125" stroke="rgba(255,255,255,0.015)" stroke-width="0.75" />
                <circle cx="150" cy="75" r="55" fill="url(#radarGlow)" stroke="rgba(59, 130, 246, 0.15)" stroke-width="1" stroke-dasharray="2,2" />
                <line x1="150" y1="5" x2="150" y2="145" stroke="rgba(59, 130, 246, 0.1)" stroke-width="0.5" />
                <line x1="5" y1="75" x2="295" y2="75" stroke="rgba(59, 130, 246, 0.1)" stroke-width="0.5" />
                <g style="transform-origin: 175px 55px; animation: pulseTarget 2.5s infinite ease-in-out;">
                  <circle cx="175" cy="55" r="5" fill="none" stroke="#10b981" stroke-width="1.5" />
                  <path d="M167 55 L171 55 M183 55 L179 55 M175 47 L175 51 M175 63 L175 59" stroke="#10b981" stroke-width="1.25" />
                  <text x="186" y="58" fill="#10b981" font-size="7" font-family="'JetBrains Mono', monospace" font-weight="700">POS.HUB_03</text>
                </g>
              </svg>
            </div>`
    },
    "5": {
      pill: "Conversion Funnel Diagnostics",
      title: "Page 5: Cart Process & Revenue",
      desc: "The ultimate checkout health-monitor. This screen compares cart additions, checkouts, and transactional yields against the previous year to identify friction leaks in the purchase journey.",
      kpis: [
        { label: "Cart Adds", num: "11,682 (-20%)" },
        { label: "Checkouts", num: "3,808 (-18%)" },
        { label: "YoY Rev Chg", num: "-17%" },
        { label: "Rev Yield", num: "$186,587" }
      ],
      takeaway: "A severe drop-off is visible between Cart Adds (11,682) and Checkouts (3,808). Mitigate this by introducing slide-out cart drawers, mini-cart reminders, or automated recovery triggers to convert cart-adders.",
      svg: `<div class="mini-chart chart-container">
              <svg viewBox="0 0 300 150">
                <defs>
                  <linearGradient id="funnelGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.8"/>
                  </linearGradient>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                  </marker>
                </defs>
                <polygon points="50,15 250,15 225,40 75,40" fill="url(#funnelGrad)" opacity="0.9" />
                <text x="150" y="27" fill="#fff" font-size="7.5" font-weight="800" text-anchor="middle">Product Views (100%)</text>
                
                <polygon points="77,44 223,44 200,69 100,69" fill="url(#funnelGrad)" opacity="0.75" />
                <text x="150" y="56" fill="#fff" font-size="7.5" font-weight="800" text-anchor="middle">Add To Carts: 11,682 (11.0%)</text>
                
                <path d="M215,56 L235,56 L235,80" fill="none" stroke="#ef4444" stroke-width="1.25" marker-end="url(#arrow)" stroke-dasharray="3,3" />
                <text x="240" y="71" fill="#ef4444" font-size="6.5" font-weight="700">-67% Abandon</text>
                
                <polygon points="102,73 198,73 180,98 120,98" fill="url(#funnelGrad)" opacity="0.6" />
                <text x="150" y="85" fill="#fff" font-size="7.5" font-weight="800" text-anchor="middle">Checkouts: 3,808 (3.6%)</text>
                
                <polygon points="122,102 178,102 165,127 135,127" fill="url(#funnelGrad)" opacity="0.45" />
                <text x="150" y="114" fill="#fff" font-size="7.5" font-weight="800" text-anchor="middle">Purchases (1.03%)</text>
              </svg>
            </div>`
    },
    "6": {
      pill: "Attribution & Acquisition Audit",
      title: "Page 6: Revenue Sources",
      desc: "Audits the financial yield of marketing channels, isolating revenue from direct links, paid ads, organic channels, and referring domains to optimize acquisition budgets.",
      kpis: [
        { label: "Direct Rev", num: "$96,803 (51.9%)" },
        { label: "Referral Rev", num: "$15,285 (+10%)" },
        { label: "CPC Share", num: "11.1%" },
        { label: "Organic Rev", num: "$53,651" }
      ],
      takeaway: "Direct traffic dominates revenue (51.9%, $96,803), while referral channels display strong positive growth (+10%, $15,285) led by domains like art-analytics.appspot.com ($8,848). Partnerships and cross-promotions with these high-converting referral sources should be prioritized.",
      svg: `<div class="mini-chart chart-container">
              <svg viewBox="0 0 300 150">
                <g transform="translate(100, 75)">
                  <circle r="42" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="12" />
                  <circle r="42" fill="none" stroke="#3b82f6" stroke-width="12" stroke-dasharray="137 264" stroke-dashoffset="0" transform="rotate(-90)" />
                  <circle r="42" fill="none" stroke="#a78bfa" stroke-width="12" stroke-dasharray="40 264" stroke-dashoffset="-137" transform="rotate(-90)" />
                  <circle r="42" fill="none" stroke="#10b981" stroke-width="12" stroke-dasharray="87 264" stroke-dashoffset="-177" transform="rotate(-90)" />
                  <text x="0" y="3.5" fill="#fff" font-size="8" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">CHANNELS</text>
                </g>
                <g transform="translate(185, 45)">
                  <rect x="0" y="0" width="8" height="8" rx="1.5" fill="#3b82f6" />
                  <text x="14" y="7" fill="rgba(255,255,255,0.7)" font-size="7.5" font-weight="700">Direct: 51.9%</text>
                  
                  <rect x="0" y="16" width="8" height="8" rx="1.5" fill="#a78bfa" />
                  <text x="14" y="23" fill="rgba(255,255,255,0.7)" font-size="7.5" font-weight="700">Referrals: 15%</text>
                  
                  <rect x="0" y="32" width="8" height="8" rx="1.5" fill="#10b981" />
                  <text x="14" y="39" fill="rgba(255,255,255,0.7)" font-size="7.5" font-weight="700">Organic/CPC</text>
                </g>
              </svg>
            </div>`
    },
    "7": {
      pill: "Search Query Integrity",
      title: "Page 7: Google Ads Keyword Analysis",
      desc: "Connects search query intent directly with marketing spend. It audits Google Ads keywords to verify which search queries drive e-commerce revenue and which waste budget.",
      kpis: [
        { label: "Branded Clicks", num: "784" },
        { label: "Avg. Ad CPC", num: "$0.30" },
        { label: "Paid Revenue", num: "$20,739" },
        { label: "Untracked Rev", num: "$19,183 (92%)" }
      ],
      takeaway: "Branded search drives high clicks (784) at a low CPC ($0.30). However, a massive portion of ads revenue ($19,183 of $20,739) is labeled as (not set), indicating a severe auto-tagging or parameter-tracking bug that needs to be resolved immediately.",
      svg: `<div class="mini-chart chart-container">
              <svg viewBox="0 0 300 150">
                <line x1="40" y1="20" x2="40" y2="120" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
                <line x1="40" y1="120" x2="280" y2="120" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
                <rect x="58" y="90" width="14" height="30" fill="rgba(239, 68, 68, 0.35)" rx="1.5" />
                <rect x="108" y="80" width="14" height="40" fill="rgba(239, 68, 68, 0.35)" rx="1.5" />
                <rect x="158" y="70" width="14" height="50" fill="rgba(239, 68, 68, 0.35)" rx="1.5" />
                <rect x="208" y="105" width="14" height="15" fill="rgba(239, 68, 68, 0.35)" rx="1.5" />
                <rect x="248" y="95" width="14" height="25" fill="rgba(239, 68, 68, 0.35)" rx="1.5" />
                <text x="14" y="70" fill="#ef4444" font-size="6" font-weight="700" transform="rotate(-90, 14, 70)">AD COST</text>
                
                <path d="M 65,105 Q 115,45 165,35 T 255,95" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" />
                <circle cx="165" cy="35" r="4" fill="#10b981" />
                <circle cx="165" cy="35" r="9" fill="none" stroke="#10b981" stroke-width="1.5" style="transform-origin: 165px 35px; animation: pulseGlow 1.5s infinite ease-out;" />
                <text x="175" y="32" fill="#10b981" font-size="7.5" font-family="'JetBrains Mono', monospace" font-weight="700">Not Set: $19.1K</text>
                <text x="292" y="100" fill="#10b981" font-size="6" font-weight="700" transform="rotate(-90, 292, 100)">REVENUE</text>
              </svg>
            </div>`
    },
    "8": {
      pill: "Catalog & E-commerce Deep-Dive",
      title: "Page 8: Item Analysis",
      desc: "A granular audit of product performance. It tracks views, purchase volume, and sales revenue for individual items to isolate catalog performance and high-appeal items.",
      kpis: [
        { label: "Tote Views", num: "445 (High)" },
        { label: "Tote Sales", num: "Low (Friction)" },
        { label: "Sticker Sales", num: "784 (Massive)" },
        { label: "Sticker Rev", num: "$3,136 (Cross-sell)" }
      ],
      takeaway: "The Google Regatta Tote has high details views (445) but low transactions, indicating that pricing, photos, or descriptions on the product page are causing friction. Conversely, low-friction add-ons like the Google Bike Party Sticker sell in massive quantities (784 items purchased, $3,136 revenue) with almost zero detail views, indicating they should be promoted as checkout cross-sells.",
      svg: `<div class="mini-chart chart-container">
              <svg viewBox="0 0 300 150">
                <line x1="85" y1="15" x2="85" y2="135" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
                <text x="10" y="35" fill="rgba(255,255,255,0.5)" font-size="7" font-weight="700">Regatta Tote</text>
                <rect x="90" y="26" width="130" height="10" rx="1.5" fill="#3b82f6" opacity="0.8" style="transform-origin: left; animation: growBarHoriz 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;" />
                <text x="226" y="34" fill="#3b82f6" font-size="7" font-family="'JetBrains Mono', monospace" font-weight="700">445 Views</text>
                <rect x="90" y="40" width="15" height="3" rx="0.75" fill="#ef4444" />
                <text x="110" y="44" fill="#ef4444" font-size="6" font-weight="700">Friction Bottleneck</text>
                
                <text x="10" y="85" fill="rgba(255,255,255,0.5)" font-size="7" font-weight="700">Bike Sticker</text>
                <rect x="90" y="76" width="25" height="10" rx="1.5" fill="#3b82f6" opacity="0.8" style="transform-origin: left; animation: growBarHoriz 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;" />
                <text x="120" y="84" fill="#3b82f6" font-size="7" font-family="'JetBrains Mono', monospace" font-weight="700">35 Views</text>
                <rect x="90" y="90" width="170" height="3" rx="0.75" fill="#10b981" />
                <text x="266" y="94" fill="#10b981" font-size="6.5" font-family="'JetBrains Mono', monospace" font-weight="700">784 Sales (100% Cross-sell)</text>
              </svg>
            </div>`
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;

      const pageId = tab.getAttribute('data-page');
      const data = pagesData[pageId];
      if (!data) return;

      // Toggle active classes on tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Play interaction feedback sound
      if (typeof UISounds !== 'undefined' && UISounds.click) {
        UISounds.click();
      }

      // Event tracking
      trackEvent('dashboard_teaser_tab_click', {
        page_index: pageId,
        page_title: data.title
      });

      // Smooth opacity cross-fade
      terminalBody.style.opacity = '0';
      terminalBody.style.transform = 'translateY(8px)';

      setTimeout(() => {
        // Update details while invisible
        metricPill.textContent = data.pill;
        pageTitle.textContent = data.title;
        pageDesc.textContent = data.desc;
        takeawayText.textContent = data.takeaway;

        // Build and inject KPI elements
        kpisContainer.innerHTML = '';
        data.kpis.forEach(kpi => {
          const kpiPill = document.createElement('div');
          kpiPill.className = 'kpi-pill';
          kpiPill.innerHTML = `<strong>${kpi.label}:</strong> <span class="kpi-num">${kpi.num}</span>`;
          kpisContainer.appendChild(kpiPill);
        });

        // Inject visualization
        visualizationContainer.innerHTML = data.svg;

        // Fade back in smoothly
        terminalBody.style.opacity = '1';
        terminalBody.style.transform = 'translateY(0)';
      }, 220); // Sync with CSS transition
    });
  });

  // Live Page Search in Teaser Navigator
  const searchInput = document.getElementById('teaserPageSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      let matchCount = 0;
      tabs.forEach(tab => {
        const searchData = (tab.getAttribute('data-search') || '').toLowerCase();
        const nameText = tab.querySelector('.tab-name')?.textContent.toLowerCase() || '';
        const matches = !query || nameText.includes(query) || searchData.includes(query);
        tab.style.display = matches ? 'flex' : 'none';
        if (matches) matchCount++;
      });
      const viewsCountEl = document.getElementById('teaserActiveViewsCount');
      if (viewsCountEl) viewsCountEl.textContent = `${matchCount} Telemetry Views`;
    });
  }

  // Autoplay Cycle Feature
  const autoplayBtn = document.getElementById('teaserAutoplayBtn');
  let autoplayTimer = null;
  if (autoplayBtn) {
    autoplayBtn.addEventListener('click', () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
        autoplayBtn.classList.remove('is-playing');
        const playText = autoplayBtn.querySelector('.play-text');
        const playIcon = autoplayBtn.querySelector('.play-icon');
        if (playText) playText.textContent = 'Autoplay';
        if (playIcon) playIcon.textContent = '▶';
      } else {
        autoplayBtn.classList.add('is-playing');
        const playText = autoplayBtn.querySelector('.play-text');
        const playIcon = autoplayBtn.querySelector('.play-icon');
        if (playText) playText.textContent = 'Pause';
        if (playIcon) playIcon.textContent = '⏸';

        autoplayTimer = setInterval(() => {
          const visibleTabs = Array.from(tabs).filter(t => t.style.display !== 'none');
          if (!visibleTabs.length) return;
          const activeIdx = visibleTabs.findIndex(t => t.classList.contains('active'));
          const nextIdx = (activeIdx + 1) % visibleTabs.length;
          visibleTabs[nextIdx].click();
        }, 3500);
      }
    });
  }
})();

// ── Strategic UX Synergy Controller ──
(function initCollaborationTeaserController() {
  function setup() {
    const viewTabs = document.querySelectorAll('#collabViewTabs .collab-tab');
    const lensesContainer = document.getElementById('collabLensesContainer');
    const loopContainer = document.getElementById('collabLoopContainer');
    const themePresetBtns = document.querySelectorAll('[data-theme-preset]');

    if (!viewTabs.length) return;

    // View Perspective Switcher
    viewTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        viewTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const view = tab.dataset.collabView || 'all';

        const grid = document.getElementById('collabTeaserGrid');
        if (grid) {
          grid.classList.remove('view-all', 'view-strategist', 'view-designer', 'view-loop');
          grid.classList.add(`view-${view}`);
        }

        if (typeof UISounds !== 'undefined' && UISounds.click) UISounds.click();
        if (typeof trackEvent === 'function') {
          trackEvent('collaboration_view_change', { view });
        }
      });
    });

    // Theme Swatch Preset Preview Listener
    themePresetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const preset = btn.dataset.themePreset;
        
        // Apply pulse feedback glow to designer lens card
        const mockGlass = document.querySelector('.mock-glass-card');
        if (mockGlass) {
          mockGlass.style.boxShadow = `0 0 25px rgba(59, 130, 246, 0.5)`;
          setTimeout(() => { mockGlass.style.boxShadow = ''; }, 1500);
        }

        if (typeof UISounds !== 'undefined' && UISounds.click) UISounds.click();
        if (typeof trackEvent === 'function') {
          trackEvent('collaboration_preset_preview', { preset });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();

