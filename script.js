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

// ── Theme Toggle ──
const themeToggle = document.getElementById('themeToggle');
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
  });
}

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
  if (testimonialCards.length === 0) return;
  let next = currentTestimonial + dir;
  if (next < 0) next = testimonialCards.length - 1;
  if (next >= testimonialCards.length) next = 0;
  goToTestimonial(next);
  if (manual) UISounds.slide();
}

// Auto-rotate testimonials (silent)
if (testimonialCards.length > 0) {
  setInterval(() => changeTestimonial(1, false), 6000);
}

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
  // Toggle Window
  aiToggleBtn.addEventListener('click', () => {
    aiChatWindow.classList.toggle('open');
    UISounds.click();
    trackEvent('ai_widget_toggle', { action: aiChatWindow.classList.contains('open') ? 'open' : 'close' });
  });

  aiCloseBtn.addEventListener('click', () => {
    aiChatWindow.classList.remove('open');
    UISounds.collapse();
  });

  // Intelligent Conversational Response Database & Matching Engine
  function getBotResponse(userText) {
    const query = userText.toLowerCase().trim();
    
    // Keyword Matching Rules
    if (query === 'ga4' || query.includes('analytics') || query.includes('data') || query.includes('tracking') || query.includes('measurement') || query.includes('tag')) {
      return "Youssef McCarthy is an enterprise Analytics Authority with 14+ years of hands-on experience in GA4, tag audits, GTM data layer design, and advanced path analysis. He designs clean taxonomy blueprints that turn unstructured noise into raw strategic power.<br><br>Explore his active work in the <a href='#analytics' class='chat-link'>Analytics &amp; Intelligence section</a>.";
    }
    if (query === 'cro' || query.includes('testing') || query.includes('experiment') || query.includes('ab') || query.includes('conversion') || query.includes('multivariate') || query.includes('auditing')) {
      return "Youssef has led conversion optimization lifecycles for major agencies, specializing in cognitive UX audits, heatmapping, and rigorous multivariate testing. His scientific experiments focus on removing digital checkout friction.<br><br>Explore his methodology in the <a href='#experience' class='chat-link'>Experience timeline</a> or examine his <a href='#projects' class='chat-link'>Case Studies</a>.";
    }
    if (query === 'ai' || query.includes('agent') || query.includes('loop') || query.includes('orchestration') || query.includes('autonomous') || query.includes('cognitive') || query.includes('fleet')) {
      return "Youssef engineered the <strong>Agentic Loop Architecture</strong>, which runs an automated multi-agent virtual war room (featuring custom Data Scientist, UX, and CRO agents) validating visitor behavior and auto-deploying UX recommendations.<br><br>Read the premium case study: <a href='./AgenticLoop/index.html' class='chat-link'>The Agentic Loop Case Study</a>.";
    }
    if (query === 'local' || query.includes('localist') || query.includes('onprem') || query.includes('hardware') || query.includes('privacy') || query.includes('security') || query.includes('sovereignty') || query.includes('dhh') || query.includes('server')) {
      return "Youssef advocates for on-premises hardware repatriation, inspired by DHH and Hugging Face. He hosts fine-tuned open-weights models locally to eliminate unpredictable token subscription taxes and protect corporate database privacy.<br><br>Read the full essay: <a href='./LocalAI/index.html' class='chat-link'>The Localist Manifesto</a>.";
    }
    if (query === 'resume' || query.includes('cv') || query.includes('pdf') || query.includes('download') || query.includes('background') || query.includes('experience')) {
      return "Youssef has over 14 years of digital strategy experience spanning analytics engineering, client growth, and AI-led automation. You can review his full corporate timeline or download his formal resume:<br><br>⬇️ <a href='./Youssef_McCarthy_Resume.pdf' download class='chat-link'>Download Resume PDF</a><br>📂 Explore his <a href='#experience' class='chat-link'>Experience Timeline</a>.";
    }
    if (query === 'contact' || query.includes('hire') || query.includes('consulting') || query.includes('advisory') || query.includes('meet') || query.includes('email') || query.includes('work') || query.includes('message')) {
      return "You can partner with Youssef for strategic GA4/CRO audits, custom agentic loop development, or private local AI implementations.<br><br>✉️ Send a message: <a href='#contact' class='chat-link'>Contact Youssef McCarthy</a><br>💼 View his <a href='#consulting' class='chat-link'>Consulting &amp; Advisory Panel</a>.";
    }
    if (query.includes('hello') || query.includes('hi ') || query.startsWith('hi') || query.includes('hey') || query.includes('greetings') || query.includes('yo') || query.includes('bot') || query.includes('welcome')) {
      return "Hello! I'm Youssef's AI strategy assistant. You can ask me custom questions about his GA4 consulting, CRO optimization, the Agentic Loop, or the Localist hardware architecture. I'll provide direct linking maps to guide you around!";
    }
    if (query.includes('help') || query.includes('menu') || query.includes('options') || query.includes('prompt') || query.includes('capabilities')) {
      return "I can navigate you to any section of Youssef's portfolio! Try asking me about:<br>• <strong>Analytics</strong> &mdash; 'Tell me about your GA4 experience'<br>• <strong>CRO</strong> &mdash; 'How do you run A/B testing?'<br>• <strong>Agentic AI</strong> &mdash; 'What is the Agentic Loop?'<br>• <strong>Local AI</strong> &mdash; 'Tell me about local server security'<br>• <strong>Resume</strong> &mdash; 'Can I download your CV?'<br>• <strong>Consulting</strong> &mdash; 'How do I hire you?'";
    }
    
    // Default response fallback
    return "That is an interesting question! I am specialized in Youssef's professional history, GA4/CRO expertise, and custom AI implementations. Please ask me about his <strong>analytics</strong>, <strong>testing</strong>, <strong>Agentic Loop</strong>, or <strong>local servers</strong>, or download his <a href='./Youssef_McCarthy_Resume.pdf' download class='chat-link'>Resume PDF</a>!";
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
    const responseDelay = 800 + Math.random() * 600; // Realistic human-like cognitive lag
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

  // Handle delegate clicks on inside-chat navigation hyperlinks
  aiChatBody.addEventListener('click', (e) => {
    const link = e.target.closest('.chat-link');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
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
      }
    }
  });
}

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
})();

