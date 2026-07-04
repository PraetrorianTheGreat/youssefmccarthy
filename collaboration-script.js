// Global Theme Switching and A/B Simulation

document.addEventListener('DOMContentLoaded', () => {
  initGlobalThemes();
  initABSimulator();
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
      body.classList.remove('theme-glass', 'theme-fluent', 'theme-neu', 'theme-brutal');
      // Add the selected theme class
      body.classList.add(`theme-${theme}`);
      
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
  
  if (!runBtn || !progressBar) return;

  // Variant A Data (Control - Grey Button)
  const varA = {
    visitorsEl: document.querySelector('#variant-a .val-visitors'),
    conversionsEl: document.querySelector('#variant-a .val-conversions'),
    rateEl: document.querySelector('#variant-a .val-rate'),
    cardEl: document.getElementById('variant-a'),
    trueRate: 0.015 // 1.5% Base conversion rate for dull button
  };

  // Variant B Data (Challenger - High Contrast Button)
  const varB = {
    visitorsEl: document.querySelector('#variant-b .val-visitors'),
    conversionsEl: document.querySelector('#variant-b .val-conversions'),
    rateEl: document.querySelector('#variant-b .val-rate'),
    cardEl: document.getElementById('variant-b'),
    trueRate: 0.032 // 3.2% Lifted conversion rate for stand-out button
  };

  let testRunning = false;

  runBtn.addEventListener('click', () => {
    if (testRunning) return;
    testRunning = true;
    
    // Reset state
    runBtn.disabled = true;
    runBtn.textContent = 'Testing in Progress...';
    progressBar.style.width = '0%';
    resultsDiv.innerHTML = '';
    
    varA.cardEl.classList.remove('winner');
    varB.cardEl.classList.remove('winner');

    let currentVisitors = 0;
    const totalVisitors = 5000;
    const step = 50; // Add 50 visitors per tick
    const intervalTime = 30; // ms per tick

    let conversionsA = 0;
    let conversionsB = 0;

    const interval = setInterval(() => {
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

      if (currentVisitors >= totalVisitors) {
        clearInterval(interval);
        finishTest(conversionsA, conversionsB, halfVisits);
      }
    }, intervalTime);
  });

  function finishTest(convA, convB, visitors) {
    testRunning = false;
    runBtn.disabled = false;
    runBtn.textContent = '🔄 Run Another Test';

    const rateA = convA / visitors;
    const rateB = convB / visitors;

    if (rateB > rateA) {
      varB.cardEl.classList.add('winner');
      const lift = (((rateB - rateA) / rateA) * 100).toFixed(1);
      resultsDiv.innerHTML = `
        <span style="color: var(--theme-success, #10b981);">🏆 Variant B Wins!</span><br>
        <span style="font-size: 0.9em; color: var(--theme-text-muted, #64748b);">The high-contrast "Add to Cart" button drove a ${lift}% lift in conversion rate over the low-contrast control.</span>
      `;
    } else {
      varA.cardEl.classList.add('winner');
      resultsDiv.innerHTML = `
        <span style="color: var(--theme-success, #10b981);">🏆 Variant A Wins!</span><br>
        <span style="font-size: 0.9em; color: var(--theme-text-muted, #64748b);">The challenger failed to beat the control.</span>
      `;
    }
  }
}
