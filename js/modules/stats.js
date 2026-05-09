// js/modules/stats.js — Contadores, barras de progreso, distribución

const typeConfig = [
  { type: 'individual', label: 'Individual', color: 'individual' },
  { type: 'grupal', label: 'Grupal', color: 'grupal' },
  { type: 'mapas', label: 'Mapa Mental', color: 'mapas' },
];

function initStats(works) {
  // Actualizar contadores del header
  const statIds = {
    'stat-total': () => works.length,
    'stat-individual': () => works.filter(w => w.type === 'individual').length,
    'stat-grupal': () => works.filter(w => w.type === 'grupal').length,
    'stat-mapas': () => works.filter(w => w.type === 'mapas').length,
  };

  Object.entries(statIds).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = fn();
  });

  const statTotal2 = document.getElementById('stat-total-2');
  if (statTotal2) statTotal2.textContent = works.length;

  renderProgressBars(works);
}

function animateCounter(element, target) {
  const duration = 1200;
  const startTime = performance.now();

  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    element.textContent = Math.floor(easeProgress * target);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function renderProgressBars(works) {
  const container = document.getElementById('ev-progress');
  if (!container) return;

  const total = works.length || 1;
  container.innerHTML = '';

  const stats = typeConfig.map(({ type, label, color }) => {
    const count = works.filter(w => w.type === type).length;
    const pct = Math.round((count / total) * 100);
    return { type, label, color, count, pct };
  });

  stats.forEach(({ label, color, count, pct }, index) => {
    const row = document.createElement('div');
    row.className = 'ev__progress-row';
    row.style.animationDelay = `${index * 0.1}s`;

    row.innerHTML = `
      <div class="ev__progress-label-row">
        <span class="ev__progress-name">${label}</span>
        <span class="ev__progress-count">n = <span class="counter" data-target="${count}">0</span> (${pct}%)</span>
      </div>
      <div class="ev__chart-container">
        <div class="ev__chart-grid">
          <div class="ev__chart-grid-line"></div>
          <div class="ev__chart-grid-line"></div>
          <div class="ev__chart-grid-line"></div>
          <div class="ev__chart-grid-line"></div>
          <div class="ev__chart-grid-line"></div>
        </div>
        <div class="ev__progress-track">
          <div class="ev__progress-fill ev__progress-fill--${color}" data-pct="${pct}">
            <span class="ev__progress-value">${pct}%</span>
          </div>
        </div>
      </div>`;

    container.appendChild(row);
  });

  container.insertAdjacentHTML('beforeend', `
    <div class="ev__legend">
      <div class="ev__legend-item">
        <span>Total:</span>
        <strong style="color: var(--primary); font-family: 'JetBrains Mono', monospace;">N = ${total}</strong>
      </div>
      <div class="ev__legend-item">
        <span>Distribución por tipo de trabajo</span>
      </div>
    </div>`);

  // Animar al entrar en viewport
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const row = entry.target;
      const fill = row.querySelector('.ev__progress-fill');
      const counter = row.querySelector('.counter');

      if (fill) {
        setTimeout(() => {
          fill.style.width = fill.dataset.pct + '%';
          fill.classList.add('animate');
        }, 200);
      }

      if (counter) {
        animateCounter(counter, parseInt(counter.dataset.target));
      }

      observer.unobserve(row);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.ev__progress-row').forEach(row => observer.observe(row));
}