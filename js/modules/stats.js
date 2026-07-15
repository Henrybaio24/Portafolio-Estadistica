// js/modules/stats.js — Contadores, barras de progreso, distribución

const typeConfig = [
  { type: 'individual', label: 'Individual', color: 'individual' },
  { type: 'grupal', label: 'Grupal', color: 'grupal' },
  { type: 'mapas', label: 'Mapa Mental', color: 'mapas' },
  { type: 'pruebas', label: 'Pruebas', color: 'pruebas' },
  { type: 'diapositivas', label: 'Diapositivas', color: 'diapositivas' },
  { type: 'laboratorios', label: 'Laboratorios', color: 'laboratorios' },
  { type: 'ensayos', label: 'Ensayos', color: 'ensayos' },
  { type: 'otros', label: 'Glosario', color: 'otros' },
];

const BARRAS_VISIBLES = 3;

function initStats(works) {
  const statIds = {
    'stat-total':        () => works.length,
    'stat-individual':   () => works.filter(w => w.type === 'individual').length,
    'stat-grupal':       () => works.filter(w => w.type === 'grupal').length,
    'stat-mapas':        () => works.filter(w => w.type === 'mapas').length,
    'stat-pruebas':      () => works.filter(w => w.type === 'pruebas').length,
    'stat-diapositivas': () => works.filter(w => w.type === 'diapositivas').length,
    'stat-laboratorios': () => works.filter(w => w.type === 'laboratorios').length,
    'stat-ensayos':      () => works.filter(w => w.type === 'ensayos').length,
    'stat-otros':        () => works.filter(w => w.type === 'otros').length,
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

  const statsConTrabajos = stats.filter(s => s.count > 0);
  const totalTipos = statsConTrabajos.length;

  statsConTrabajos.forEach(({ label, color, count, pct }, index) => {
    const row = document.createElement('div');
    row.className = 'ev__progress-row';

    if (index >= BARRAS_VISIBLES) {
      row.classList.add('ev__progress-row--oculta');
    }

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

  if (totalTipos > BARRAS_VISIBLES) {
    const ocultas = totalTipos - BARRAS_VISIBLES;
    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'ev__ver-mas-row';
    btnWrapper.id = 'btn-ver-mas-barras';
    btnWrapper.innerHTML = `
      <div class="ev__ver-mas-left">
        <span class="ev__ver-mas-pill">+${ocultas}</span>
        <div class="ev__ver-mas-dots">
          <span></span><span></span><span></span>
        </div>
        <span class="ev__ver-mas-label" id="ev-ver-mas-label">Ver más tipos</span>
      </div>
      <svg class="ev__ver-mas-chevron" width="18" height="18" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;
    container.appendChild(btnWrapper);
    btnWrapper.addEventListener('click', toggleBarrasOcultas);
  }

  // Leyenda
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

function toggleBarrasOcultas() {
  const btn      = document.getElementById('btn-ver-mas-barras');
  const label    = document.getElementById('ev-ver-mas-label');
  const chevron  = btn.querySelector('.ev__ver-mas-chevron');
  const pill     = btn.querySelector('.ev__ver-mas-pill');
  const barrasOcultas = document.querySelectorAll('.ev__progress-row--oculta');
  const estaExpandido = btn.classList.contains('expandido');

  barrasOcultas.forEach((barra, index) => {
    if (estaExpandido) {
      // Ocultar
      barra.classList.remove('ev__progress-row--visible');
      setTimeout(() => { barra.style.display = 'none'; }, 300);
    } else {
      // Mostrar
      barra.style.display = 'block';
      setTimeout(() => { barra.classList.add('ev__progress-row--visible'); }, 10);

      // Animar barra y contador internos
      const fill    = barra.querySelector('.ev__progress-fill');
      const counter = barra.querySelector('.counter');
      if (fill) {
        setTimeout(() => {
          fill.style.width = fill.dataset.pct + '%';
          fill.classList.add('animate');
        }, 50 + index * 100);
      }
      if (counter) {
        setTimeout(() => {
          animateCounter(counter, parseInt(counter.dataset.target));
        }, 100 + index * 100);
      }
    }
  });

  btn.classList.toggle('expandido', !estaExpandido);
  label.textContent           = estaExpandido ? 'Ver más tipos' : 'Ver menos';
  chevron.style.transform     = estaExpandido ? 'rotate(0deg)' : 'rotate(180deg)';
  pill.style.display          = estaExpandido ? 'inline' : 'none';
}