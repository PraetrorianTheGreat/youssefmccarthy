// Global Theme Switching and A/B Simulation

document.addEventListener('DOMContentLoaded', () => {
  initGlobalThemes();
  initABSimulator();
  initThemeOnboarding();
  initGlassPlayground();
});

function initGlobalThemes() {
  const themeBtns = document.querySelectorAll('.theme-btn');
  const body = document.body;

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      themeBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      btn.classList.add('active');

      // Change body theme class
      const theme = btn.getAttribute('data-theme');
      
      // Remove all theme classes first
      body.classList.remove('theme-glass', 'theme-fluent', 'theme-neu', 'theme-brutal', 'theme-default');
      
      const themeToggle = document.getElementById('themeToggle');

      // Add the selected theme class if it's not the default
      if (theme !== 'default') {
        body.classList.add(`theme-${theme}`);
        
        // Force the dark/light mode toggle to off (dark) for the specialized themes so they render correctly
        body.classList.remove('light-theme');
        if (themeToggle) {
          themeToggle.checked = false;
          themeToggle.disabled = true; // Disable the dark/light toggle when a specific theme is active
        }
      } else {
        // If "Default" is selected, respect the state of the dark/light switch
        if (themeToggle) {
          themeToggle.disabled = false;
          const isLight = themeToggle.checked;
          document.body.classList.toggle('light-theme', isLight);
        }
      }

      // Reset glass lens positioning and inline values when switching themes
      const glassLens = document.getElementById('glassLens');
      if (glassLens) {
        glassLens.style.left = '';
        glassLens.style.top = '';
        glassLens.style.right = '';
        glassLens.style.transform = '';
      }

      // Clear any custom inline background styles from ambient background orbs so other themes remain unaffected
      document.querySelectorAll('.orb').forEach(orb => {
        orb.style.background = '';
      });
      
      // Reset active preset button class
      document.querySelectorAll('.preset-btn').forEach((p, idx) => {
        if (idx === 0) p.classList.add('active');
        else p.classList.remove('active');
      });
      
      // Update theme info box
      document.querySelectorAll('.theme-info').forEach(info => info.classList.remove('active'));
      const activeInfo = document.getElementById(`info-${theme}`);
      if (activeInfo) activeInfo.classList.add('active');
    });
  });
}

function initABSimulator() {
  const runBtn = document.getElementById('runTestBtn');
  const progressBar = document.getElementById('testProgress');
  const resultsDiv = document.getElementById('testResults');
  const testDaysEl = document.getElementById('testDays');
  
  if (!runBtn || !progressBar) return;

  const abTests = {
    color: {
      title: "Homepage Hero Layout",
      subtitle: "Simulate an A/B test measuring how replacing a standard left-aligned text-heavy layout (Control) with an interactive split isometric CTA page (Challenger) affects user conversions.",
      varA: {
        trueRate: 0.015,
        html: `
          <div class="website-hero-mock control-hero">
            <div class="hero-web-header">
              <div class="web-dots">
                <span class="web-dot red"></span>
                <span class="web-dot yellow"></span>
                <span class="web-dot green"></span>
              </div>
              <div class="web-url">https://legacy.cloudscale.io</div>
            </div>
            <div class="hero-web-body">
              <div class="hero-mock-left">
                <div class="mock-title-bars">
                  <div class="mock-bar bar-long"></div>
                  <div class="mock-bar bar-medium"></div>
                </div>
                <div class="mock-desc-bars">
                  <div class="mock-bar bar-short"></div>
                  <div class="mock-bar bar-short"></div>
                  <div class="mock-bar bar-short-mid"></div>
                </div>
                <button class="add-to-cart-btn btn-control mock-btn-flat" onclick="UISounds.click(); return false;">Read Whitepaper</button>
              </div>
              <div class="hero-mock-right">
                <div class="flat-mock-image">
                  <div class="flat-image-frame">
                    <svg class="flat-img-svg" viewBox="0 0 24 24" width="20" height="24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="3" x2="21" y2="21"></line>
                      <line x1="21" y1="3" x2="3" y2="21"></line>
                    </svg>
                    <span class="flat-image-label">Static Image</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      },
      varB: {
        trueRate: 0.032,
        html: `
          <div class="website-hero-mock challenger-hero">
            <div class="hero-web-header">
              <div class="web-dots">
                <span class="web-dot red"></span>
                <span class="web-dot yellow"></span>
                <span class="web-dot green"></span>
              </div>
              <div class="web-url text-accent">https://next.cloudscale.io</div>
            </div>
            <div class="hero-web-body">
              <div class="hero-mock-left">
                <span class="mock-mini-badge highlight-pulse">● LIVE 14k Clusters</span>
                <div class="mock-title-bars challenger">
                  <div class="mock-bar gradient-bar-1"></div>
                  <div class="mock-bar gradient-bar-2"></div>
                </div>
                <div class="mock-desc-bars challenger">
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                </div>
                <button class="add-to-cart-btn btn-challenger pulsing mock-btn-gradient" onclick="UISounds.confirm(); return false;">Launch Free Cluster ⚡</button>
              </div>
              <div class="hero-mock-right">
                <div class="isometric-scene">
                  <div class="iso-layers-group">
                    <div class="iso-layer layer-1"></div>
                    <div class="iso-layer layer-2"></div>
                    <div class="iso-layer layer-3">
                      <div class="iso-chart-bar column-1"></div>
                      <div class="iso-chart-bar column-2"></div>
                      <div class="iso-chart-bar column-3"></div>
                      <div class="iso-floating-sphere"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      },
      victoryText: "The interactive split-screen isometric layout with its pulsing, high-contrast CTA and live social proof drove a {lift}% lift in customer signups over the static text-heavy Control.",
      failureText: "The control text-heavy left-aligned layout maintained superior focus and clarity, matching or outperforming the split-isometric challenger."
    },
    copy: {
      title: "Subscription Pricing Presentation",
      subtitle: "Compare flat monochrome static pricing tables against an interactive pricing card featuring a dynamic billing frequency switch, ambient glow highlights, and glowing badges.",
      varA: {
        trueRate: 0.022,
        html: `
          <div class="saas-mock pricing-mock control">
            <div class="pricing-header">
              <h4 class="pricing-title">Standard Tiers</h4>
              <span class="billing-frequency-text">Static Monthly Billing</span>
            </div>
            <div class="pricing-tiers-list">
              <div class="pricing-tier-row">
                <span class="tier-name">Starter Plan</span>
                <span class="tier-price">$29/mo</span>
              </div>
              <div class="pricing-tier-row">
                <span class="tier-name">Premium Pro</span>
                <span class="tier-price">$79/mo</span>
              </div>
            </div>
            <button class="add-to-cart-btn btn-control" style="width:100%; margin-top:0.75rem;" onclick="UISounds.click(); return false;">Choose Standard</button>
          </div>
        `
      },
      varB: {
        trueRate: 0.045,
        html: `
          <div class="saas-mock pricing-mock challenger">
            <span class="product-badge" style="background:#10b981;">RECOMMENDED</span>
            <div class="pricing-header">
              <h4 class="pricing-title">Interactive Premium</h4>
              <div class="billing-toggle-pill" title="Click to swap billing cycles!">
                <span class="toggle-label monthly active">Monthly</span>
                <div class="toggle-slider-knob"></div>
                <span class="toggle-label annual">Annual (-20%)</span>
              </div>
            </div>
            <div class="pricing-cards-container">
              <div class="pricing-card-mini">
                <div class="mini-tier-header">Starter</div>
                <div class="mini-tier-price"><span class="starter-price">$29</span><span class="mini-mo">/mo</span></div>
              </div>
              <div class="pricing-card-mini popular-border-glow">
                <div class="mini-tier-header accent-text">Pro 🎉</div>
                <div class="mini-tier-price"><span class="pro-price">$79</span><span class="mini-mo">/mo</span></div>
              </div>
            </div>
            <button class="add-to-cart-btn btn-challenger" style="width:100%; margin-top:0.5rem;" onclick="UISounds.confirm(); return false;">Get Premium Pro ✨</button>
          </div>
        `
      },
      victoryText: "The interactive billing toggle combined with the visual prominence and ambient neon border of the Pro tier drove a massive {lift}% increase in recurring checkout activations.",
      failureText: "The standard flat tabular layout with explicit list pricing matched or outperformed the interactive billing cards."
    },
    trust: {
      title: "Express Checkout Optimization",
      subtitle: "Test if transforming a traditional credit card payment form into high-conversion quick-payment express chips (Apple Pay, Stripe Express) with verified shopper review badges increases order checkout completion.",
      varA: {
        trueRate: 0.024,
        html: `
          <div class="saas-mock checkout-mock control">
            <div class="checkout-header">
              <h4 class="checkout-title">Credit Card Payment</h4>
              <span class="secure-badge">🔒 Standard Checkout</span>
            </div>
            <div class="checkout-fields">
              <div class="checkout-field-row">
                <div class="mock-input placeholder">Card Number</div>
              </div>
              <div class="checkout-field-row split">
                <div class="mock-input placeholder">MM / YY</div>
                <div class="mock-input placeholder">CVC</div>
              </div>
            </div>
            <button class="add-to-cart-btn btn-control" style="width:100%; margin-top:0.5rem;" onclick="UISounds.click(); return false;">Submit Order ($49.00)</button>
          </div>
        `
      },
      varB: {
        trueRate: 0.042,
        html: `
          <div class="saas-mock checkout-mock challenger">
            <span class="product-badge highlight" style="background:var(--theme-accent, #8b5cf6);">SECURED WITH 256-BIT SSL</span>
            <div class="checkout-header">
              <h4 class="checkout-title">Express Secure Checkout</h4>
              <div class="social-proof-badges">⭐⭐★★★ 4.9 (12k Reviews)</div>
            </div>
            <div class="express-checkout-row">
              <button class="express-pay-btn apple-pay" onclick="UISounds.confirm(); return false;">
                <span class="express-icon"></span> Apple Pay
              </button>
              <button class="express-pay-btn stripe-pay" onclick="UISounds.confirm(); return false;">
                <span class="express-icon">💳</span> Express
              </button>
            </div>
            <div class="checkout-divider"><span>or manual card</span></div>
            <button class="add-to-cart-btn btn-challenger" style="width:100%; margin-top:0.25rem;" onclick="UISounds.confirm(); return false;">Instant Express Checkout</button>
          </div>
        `
      },
      victoryText: "Replacing tedious manual inputs with one-click express payment buttons and customer trust seals successfully bypassed checkout friction, yielding a {lift}% increase in order completions.",
      failureText: "The standard manual credit card payment form matched or outperformed the express payment chips."
    }
  };

  let activeTestKey = 'color';
  let simInterval = null;
  let testRunning = false;

  // Active Variant Data containers
  const varA = {
    visitorsEl: document.querySelector('#variant-a .val-visitors'),
    conversionsEl: document.querySelector('#variant-a .val-conversions'),
    rateEl: document.querySelector('#variant-a .val-rate'),
    cardEl: document.getElementById('variant-a'),
    trueRate: abTests.color.varA.trueRate
  };

  const varB = {
    visitorsEl: document.querySelector('#variant-b .val-visitors'),
    conversionsEl: document.querySelector('#variant-b .val-conversions'),
    rateEl: document.querySelector('#variant-b .val-rate'),
    cardEl: document.getElementById('variant-b'),
    trueRate: abTests.color.varB.trueRate
  };

  // Bind click listeners to selector buttons
  const navBtns = document.querySelectorAll('.ab-nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const testKey = btn.getAttribute('data-test');
      switchTestDeck(testKey);
    });
  });

  function switchTestDeck(testKey) {
    if (activeTestKey === testKey) return;
    activeTestKey = testKey;
    
    // Stop running test and reset simulator state
    if (simInterval) {
      clearInterval(simInterval);
    }
    testRunning = false;
    runBtn.disabled = false;
    runBtn.textContent = '▶ Run A/B Test';
    progressBar.style.width = '0%';
    resultsDiv.innerHTML = '';
    if (testDaysEl) {
      testDaysEl.textContent = 'Day 0 of 14';
    }
    
    varA.cardEl.classList.remove('winner');
    varB.cardEl.classList.remove('winner');
    document.querySelectorAll('.confetti-particle').forEach(el => el.remove());

    // Reset stat values in UI to 0
    varA.visitorsEl.textContent = '0';
    varA.conversionsEl.textContent = '0';
    varA.rateEl.textContent = '0.00%';
    varB.visitorsEl.textContent = '0';
    varB.conversionsEl.textContent = '0';
    varB.rateEl.textContent = '0.00%';

    const activeTest = abTests[testKey];
    varA.trueRate = activeTest.varA.trueRate;
    varB.trueRate = activeTest.varB.trueRate;

    // Apply high-fidelity 3D horizontal double-half flip transition
    const cards = [varA.cardEl, varB.cardEl];
    cards.forEach(card => {
      card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.transform = 'rotateY(90deg)';
    });

    setTimeout(() => {
      // Halfway through rotation: swap the contents dynamically when the card is completely thin (edge-on)
      
      // Update section titles
      const sectionTitle = document.getElementById('ab-section-title');
      const sectionSubtitle = document.getElementById('ab-section-subtitle');
      if (sectionTitle) sectionTitle.textContent = activeTest.title;
      if (sectionSubtitle) sectionSubtitle.textContent = activeTest.subtitle;

      // Update Variant A & B previews
      const previewA = varA.cardEl.querySelector('.variant-preview');
      const previewB = varB.cardEl.querySelector('.variant-preview');
      if (previewA) previewA.innerHTML = activeTest.varA.html;
      if (previewB) previewB.innerHTML = activeTest.varB.html;

      // Instantly snap to -90deg (so rotation continues smoothly in the same direction)
      cards.forEach(card => {
        card.style.transition = 'none';
        card.style.transform = 'rotateY(-90deg)';
        // Force browser layout reflow
        card.offsetHeight;
      });

      // Complete the remaining horizontal rotation back to 0deg
      requestAnimationFrame(() => {
        cards.forEach(card => {
          card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          card.style.transform = 'rotateY(0deg)';
        });
      });
    }, 300);
  }

  runBtn.addEventListener('click', () => {
    if (testRunning) return;
    testRunning = true;
    
    // Reset state
    runBtn.disabled = true;
    runBtn.textContent = 'Testing in Progress...';
    progressBar.style.width = '0%';
    resultsDiv.innerHTML = '';
    if (testDaysEl) {
      testDaysEl.textContent = 'Day 0 of 14';
    }
    
    varA.cardEl.classList.remove('winner');
    varB.cardEl.classList.remove('winner');

    let currentVisitors = 0;
    const totalVisitors = 5000;
    const step = 50; // Add 50 visitors per tick
    const intervalTime = 30; // ms per tick

    let conversionsA = 0;
    let conversionsB = 0;

    simInterval = setInterval(() => {
      currentVisitors += step;
      
      // Simulate random binomial conversions
      for (let i = 0; i < step / 2; i++) {
        if (Math.random() < varA.trueRate) conversionsA++;
        if (Math.random() < varB.trueRate) conversionsB++;
      }

      const halfVisits = currentVisitors / 2;

      // Update UI
      varA.visitorsEl.textContent = halfVisits.toLocaleString();
      varA.conversionsEl.textContent = conversionsA.toLocaleString();
      varA.rateEl.textContent = ((conversionsA / halfVisits) * 100).toFixed(2) + '%';

      varB.visitorsEl.textContent = halfVisits.toLocaleString();
      varB.conversionsEl.textContent = conversionsB.toLocaleString();
      varB.rateEl.textContent = ((conversionsB / halfVisits) * 100).toFixed(2) + '%';

      // Update progress bar
      progressBar.style.width = `${(currentVisitors / totalVisitors) * 100}%`;

      // Update days counter
      if (testDaysEl) {
        const currentDay = Math.min(14, Math.floor((currentVisitors / totalVisitors) * 14) + 1);
        testDaysEl.textContent = `Day ${currentDay} of 14`;
      }

      if (currentVisitors >= totalVisitors) {
        clearInterval(simInterval);
        finishTest(conversionsA, conversionsB, halfVisits);
      }
    }, intervalTime);
  });

  function finishTest(convA, convB, visitors) {
    testRunning = false;
    runBtn.disabled = false;
    runBtn.textContent = '🔄 Run Another Test';

    if (testDaysEl) {
      testDaysEl.textContent = 'Day 14 of 14 (Test Complete)';
    }

    const rateA = convA / visitors;
    const rateB = convB / visitors;

    // Clear any leftover confetti on both cards before triggering a new one
    document.querySelectorAll('.confetti-particle').forEach(el => el.remove());

    const activeTest = abTests[activeTestKey];

    if (rateB > rateA) {
      varB.cardEl.classList.add('winner');
      triggerConfetti(varB.cardEl);
      const lift = (((rateB - rateA) / rateA) * 100).toFixed(1);
      const msg = activeTest.victoryText.replace('{lift}', lift);
      resultsDiv.innerHTML = `
        <span style="color: var(--theme-success, #10b981); display: inline-block; margin-bottom: 0.25rem;">🏆 Variant B Wins!</span><br>
        <span style="font-size: 0.9em; color: var(--theme-text-muted, #64748b);">${msg}</span>
      `;
    } else {
      varA.cardEl.classList.add('winner');
      triggerConfetti(varA.cardEl);
      resultsDiv.innerHTML = `
        <span style="color: var(--theme-success, #10b981); display: inline-block; margin-bottom: 0.25rem;">🏆 Variant A Wins!</span><br>
        <span style="font-size: 0.9em; color: var(--theme-text-muted, #64748b);">${activeTest.failureText}</span>
      `;
    }
  }

  function triggerConfetti(container) {
    const confettiCount = 40;
    const colors = getThemeConfettiColors();

    for (let i = 0; i < confettiCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('confetti-particle');
      
      const size = Math.random() * 8 + 6; // 6px to 14px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100; // % position
      const duration = Math.random() * 1.5 + 1.8; // 1.8s to 3.3s
      const delay = Math.random() * 0.4; // random staggering delay
      const rotation = Math.random() * 360;
      const shape = Math.random() > 0.55 ? '50%' : '0%'; // circle or square/rectangle

      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.borderRadius = shape;
      particle.style.left = `${left}%`;
      particle.style.top = `-15px`; // start just above the card boundary
      particle.style.transform = `rotate(${rotation}deg)`;
      particle.style.zIndex = '50';
      particle.style.pointerEvents = 'none';
      
      // Use fallback properties for styling transitions
      particle.style.animation = `confettiFall ${duration}s cubic-bezier(0.12, 0.8, 0.35, 1) ${delay}s forwards`;

      container.appendChild(particle);
      
      // Garbage collect particle after animation completes
      setTimeout(() => {
        particle.remove();
      }, (duration + delay) * 1000);
    }
  }

  function getThemeConfettiColors() {
    const body = document.body;
    if (body.classList.contains('theme-glass')) {
      return ['#0a84ff', '#30d158', '#bf9af2', '#ff375f', '#ffffff'];
    } else if (body.classList.contains('theme-fluent')) {
      return ['#0078d4', '#6ccb5f', '#60cdff', '#00ff66', '#ffffff'];
    } else if (body.classList.contains('theme-neu')) {
      return ['#3182ce', '#38a169', '#dd6b20', '#319795', '#a3b1c6'];
    } else if (body.classList.contains('theme-brutal')) {
      return ['#ff007f', '#00ff66', '#000000', '#facc15', '#ffffff'];
    } else {
      // Default Theme (Cyber Neon)
      return ['#3b82f6', '#10b981', '#a855f7', '#ec4899', '#ffffff'];
    }
  }
}

function initThemeOnboarding() {
  const bubble = document.getElementById('themeOnboardingBubble');
  const closeBtn = document.getElementById('closeOnboardingBtn');
  const themeBtns = document.querySelectorAll('.theme-btn');

  if (!bubble) return;

  // Show the bubble after a premium 1.0-second delay
  const showTimeout = setTimeout(() => {
    bubble.classList.add('active');
    
    // Play a gentle notification sound to attract attention!
    if (window.UISounds && typeof window.UISounds.click === 'function') {
      window.UISounds.click();
    }
  }, 1000);

  // Auto-dismiss after 10 seconds of active presentation
  const autoDismissTimeout = setTimeout(() => {
    dismissBubble();
  }, 11000);

  function dismissBubble() {
    clearTimeout(showTimeout);
    clearTimeout(autoDismissTimeout);
    bubble.classList.remove('active');
  }

  // Dismiss on close button click
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissBubble();
    });
  }

  // Dismiss on clicking any theme buttons
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dismissBubble();
    });
  });
}

/**
 * visionOS Glass Lens Interactive Playground
 * Features dragging physics with desktop bounds constraints, reactive filter slider inputs,
 * and high-fidelity, hardware-accelerated ambient backdrop orb preset switching.
 */
function initGlassPlayground() {
  const lens = document.getElementById('glassLens');
  const header = document.getElementById('glassLensHeader');
  const blurSlider = document.getElementById('blurSlider');
  const satSlider = document.getElementById('satSlider');
  const blurVal = document.getElementById('blurVal');
  const satVal = document.getElementById('satVal');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const orbs = {
    orb1: document.querySelector('.orb-1'),
    orb2: document.querySelector('.orb-2'),
    orb3: document.querySelector('.orb-3')
  };

  if (!lens || !header) return;

  // 1. Reactive Sliders for real-time backdrop-filter adjustment
  function updateLensFilter() {
    const blur = blurSlider ? blurSlider.value : 30;
    const sat = satSlider ? satSlider.value : 180;
    if (blurVal) blurVal.textContent = blur;
    if (satVal) satVal.textContent = sat;
    lens.style.backdropFilter = `blur(${blur}px) saturate(${sat}%)`;
    lens.style.webkitBackdropFilter = `blur(${blur}px) saturate(${sat}%)`;
  }

  if (blurSlider) {
    blurSlider.addEventListener('input', updateLensFilter);
  }
  if (satSlider) {
    satSlider.addEventListener('input', updateLensFilter);
  }

  // 2. High-transmission background ambient color presets
  const presets = {
    aurora: {
      orb1: 'rgba(0, 113, 227, 0.16)',
      orb2: 'rgba(175, 82, 222, 0.13)',
      orb3: 'rgba(255, 45, 85, 0.09)'
    },
    sunset: {
      orb1: 'rgba(255, 112, 10, 0.18)',
      orb2: 'rgba(120, 40, 200, 0.14)',
      orb3: 'rgba(255, 200, 10, 0.1)'
    },
    emerald: {
      orb1: 'rgba(52, 199, 89, 0.18)',
      orb2: 'rgba(0, 160, 220, 0.14)',
      orb3: 'rgba(10, 210, 160, 0.09)'
    }
  };

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetName = btn.getAttribute('data-preset');
      const config = presets[presetName];
      if (config) {
        if (orbs.orb1) orbs.orb1.style.background = config.orb1;
        if (orbs.orb2) orbs.orb2.style.background = config.orb2;
        if (orbs.orb3) orbs.orb3.style.background = config.orb3;
      }
    });
  });

  // 3. Ergonomic Desktop Dragging Physics (reverts to static placement on mobile / tablet width)
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  header.addEventListener('mousedown', startDrag);
  header.addEventListener('touchstart', startDrag, { passive: true });

  function startDrag(e) {
    // Only permit dragging if screen width corresponds to desktop layout (>1024px)
    if (window.innerWidth <= 1024) return;

    isDragging = true;
    lens.classList.add('dragging');

    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;

    // Retrieve active layout coordinates
    const rect = lens.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    // Reposition floating element from right-relative to left/top explicitly to unlock smooth dragging transitions
    lens.style.left = `${initialLeft}px`;
    lens.style.top = `${initialTop}px`;
    lens.style.right = 'auto';
    lens.style.transform = 'none';

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
  }

  function drag(e) {
    if (!isDragging) return;

    // Prevent touch scrolling behavior during drag events on touch devices (if any)
    if (e.type.startsWith('touch')) {
      e.preventDefault();
    }

    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    // Constrain the lens boundaries strictly to prevent it from sliding off the screen
    const rect = lens.getBoundingClientRect();
    const padding = 12;
    const minLeft = padding;
    const maxLeft = window.innerWidth - rect.width - padding;
    const minTop = padding;
    const maxTop = window.innerHeight - rect.height - padding;

    newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
    newTop = Math.max(minTop, Math.min(maxTop, newTop));

    lens.style.left = `${newLeft}px`;
    lens.style.top = `${newTop}px`;
  }

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    lens.classList.remove('dragging');
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
  }

  // Viewport resize watcher to reset position seamlessly
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 1024) {
      lens.style.left = '';
      lens.style.top = '';
      lens.style.right = '';
      lens.style.transform = '';
    }
  });
}



// Dynamic Event Delegation for Billing Toggles inside Variant B
document.addEventListener('click', (e) => {
  const pill = e.target.closest('.billing-toggle-pill');
  if (!pill) return;

  e.preventDefault();
  e.stopPropagation();

  const isAnnual = pill.classList.toggle('annual-active');
  
  // Play toggle sound chime
  if (window.UISounds) {
    if (typeof window.UISounds.toggle === 'function') {
      window.UISounds.toggle();
    } else if (typeof window.UISounds.click === 'function') {
      window.UISounds.click();
    }
  }

  const starterPrice = document.querySelector('.starter-price');
  const proPrice = document.querySelector('.pro-price');

  if (isAnnual) {
    pill.querySelector('.monthly').classList.remove('active');
    pill.querySelector('.annual').classList.add('active');
    if (starterPrice) starterPrice.textContent = '$23';
    if (proPrice) proPrice.textContent = '$63';
  } else {
    pill.querySelector('.monthly').classList.add('active');
    pill.querySelector('.annual').classList.remove('active');
    if (starterPrice) starterPrice.textContent = '$29';
    if (proPrice) proPrice.textContent = '$79';
  }
});
