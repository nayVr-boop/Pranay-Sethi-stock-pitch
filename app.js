// ===========================
// THEME TOGGLE
// ===========================
(function(){
  const t = document.querySelector('[data-theme-toggle]');
  const r = document.documentElement;
  let d = matchMedia('(prefers-color-scheme: light)').matches ? 'dark' : 'light';
  // Default to light mode
  d = 'light';
  r.setAttribute('data-theme', d);
  
  if (t) {
    t.addEventListener('click', () => {
      d = d === 'dark' ? 'light' : 'dark';
      r.setAttribute('data-theme', d);
      t.setAttribute('aria-label', 'Switch to ' + (d === 'dark' ? 'light' : 'dark') + ' mode');
      t.innerHTML = d === 'dark' 
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      
      // Update charts for theme
      updateChartColors();
    });
  }
})();

// ===========================
// SCROLL REVEAL
// ===========================
const revealElements = document.querySelectorAll('.pillar, .risk-card, .method-card, .stat-card, .insider-card, .timeline-item');
revealElements.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => observer.observe(el));

// ===========================
// NAV SCROLL EFFECT
// ===========================
const nav = document.getElementById('nav');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 100) {
    nav.style.borderBottomColor = 'var(--color-border)';
  }
  lastScroll = currentScroll;
}, { passive: true });

// ===========================
// CHART HELPERS
// ===========================
function getChartColors() {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const isDark = theme === 'dark';
  return {
    text: isDark ? '#8a8a94' : '#6a6a74',
    grid: isDark ? '#2a2a30' : '#d8d8de',
    red: '#e63946',
    redDim: 'rgba(230, 57, 70, 0.3)',
    green: '#2ec486',
    greenDim: 'rgba(46, 196, 134, 0.3)',
    blue: '#4a9eff',
    yellow: '#e6a817',
    surface: isDark ? '#18181c' : '#fafafa',
  };
}

// ===========================
// FCF WATERFALL CHART
// ===========================
const fcfCtx = document.getElementById('fcfChart');
let fcfChart = null;

function buildFCFChart() {
  const c = getChartColors();
  const data = {
    labels: ['FY2023', 'FY2024', 'FY2025', 'FY2026E', 'FY2027E', 'FY2028E'],
    datasets: [{
      label: 'Net Free Cash Flow ($M)',
      data: [7.5, 32.9, 31.3, -294, -207, 164],
      backgroundColor: [
        c.green, c.green, c.green, 
        c.red, c.red, c.green
      ],
      borderColor: [
        c.green, c.green, c.green,
        c.red, c.red, c.green
      ],
      borderWidth: 1,
      borderRadius: 4,
      barPercentage: 0.65,
    }]
  };

  if (fcfChart) fcfChart.destroy();
  fcfChart = new Chart(fcfCtx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.surface,
          titleColor: c.text,
          bodyColor: c.text,
          borderColor: c.grid,
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(ctx) {
              const val = ctx.parsed.y;
              return (val >= 0 ? '+' : '') + '$' + val + 'M';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { 
            color: c.text, 
            font: { family: "'JetBrains Mono', monospace", size: 11 } 
          },
          border: { color: c.grid }
        },
        y: {
          grid: { color: c.grid, lineWidth: 0.5 },
          ticks: { 
            color: c.text, 
            font: { family: "'JetBrains Mono', monospace", size: 11 },
            callback: function(val) { return (val >= 0 ? '' : '-') + '$' + Math.abs(val) + 'M'; }
          },
          border: { display: false }
        }
      }
    }
  });
}

// ===========================
// CASH RUNWAY CHART
// ===========================
const cashCtx = document.getElementById('cashChart');
let cashChart = null;

function buildCashChart() {
  const c = getChartColors();
  
  // On-plan scenario
  const onPlan = [1957, 1663, 1456, 1620, 1870];
  // 50% cost overrun scenario
  const overrun = [1957, 1450, 1050, 900, 1050];
  // Debt maturity line
  const debtLine = [1214, 1214, 1214, 1214, 1214];

  if (cashChart) cashChart.destroy();
  cashChart = new Chart(cashCtx, {
    type: 'line',
    data: {
      labels: ['FY2025', 'FY2026E', 'FY2027E', 'FY2028E', 'FY2029E'],
      datasets: [
        {
          label: 'Cash (On Plan)',
          data: onPlan,
          borderColor: c.blue,
          backgroundColor: 'rgba(74, 158, 255, 0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: c.blue,
          borderWidth: 2,
        },
        {
          label: 'Cash (50% Cost Overrun)',
          data: overrun,
          borderColor: c.red,
          backgroundColor: c.redDim,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: c.red,
          borderWidth: 2,
          borderDash: [6, 4],
        },
        {
          label: 'Total Debt ($1.21B)',
          data: debtLine,
          borderColor: c.yellow,
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: c.text,
            font: { family: "'JetBrains Mono', monospace", size: 11 },
            usePointStyle: true,
            pointStyle: 'line',
            padding: 16,
          }
        },
        tooltip: {
          backgroundColor: c.surface,
          titleColor: c.text,
          bodyColor: c.text,
          borderColor: c.grid,
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(ctx) {
              return ctx.dataset.label + ': $' + ctx.parsed.y + 'M';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { 
            color: c.text, 
            font: { family: "'JetBrains Mono', monospace", size: 11 } 
          },
          border: { color: c.grid }
        },
        y: {
          grid: { color: c.grid, lineWidth: 0.5 },
          ticks: { 
            color: c.text, 
            font: { family: "'JetBrains Mono', monospace", size: 11 },
            callback: function(val) { return '$' + val + 'M'; }
          },
          border: { display: false },
          min: 0,
          max: 2200,
        }
      }
    }
  });
}

function updateChartColors() {
  buildFCFChart();
  buildCashChart();
}

// Build charts on load
buildFCFChart();
buildCashChart();

// ===========================
// SMOOTH SCROLL FOR NAV
// ===========================
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// ===========================
// ANIMATE NUMBERS ON SCROLL
// ===========================
function animateValue(el, start, end, duration, prefix, suffix) {
  const startTime = performance.now();
  const isNegative = end < 0;
  const absEnd = Math.abs(end);
  const absStart = Math.abs(start);
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = absStart + (absEnd - absStart) * eased;
    
    el.textContent = (isNegative ? '−' : '') + prefix + current.toFixed(current >= 100 ? 0 : 2) + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}
