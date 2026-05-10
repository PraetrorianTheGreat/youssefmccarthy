// ── Particle System ──
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.4 + 0.1;
  }
  update() {
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
});
// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'));
});

// ── Scroll Reveal Animations ──
const revealElements = document.querySelectorAll('.reveal, .timeline-item');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

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
  toggle.textContent = isOpen ? 'Show more ↓' : 'Show less ↑';
}

// ── Project Toggle ──
function toggleProject(card) {
  const details = card.querySelector('.project-details');
  const toggle = card.querySelector('.project-toggle');
  const isOpen = details.classList.contains('open');
  details.classList.toggle('open');
  toggle.textContent = isOpen ? 'Expand Case Study →' : 'Collapse ↑';
}

// ── Contact Form ──
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = '✓ Message Sent!';
  btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  setTimeout(() => {
    btn.textContent = 'Send Message →';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
}

// ── Smooth scroll for nav links ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
