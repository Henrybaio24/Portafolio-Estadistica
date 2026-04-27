document.addEventListener('DOMContentLoaded', async () => {


  // ══════════════════════════════════════════
  // 1. CONFIGURACIÓN GOOGLE SHEET
  // ══════════════════════════════════════════
  const SHEET_ID  = '2PACX-1vQZBQQJF6phbRXNRkdMqDYdhgB9JaXTmMuT-ACo79YJRotfLyxiPsXABuLxLSlFybhlmEpYil4YuNLG';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=0&single=true&output=csv`;

  const typeLabels = {
    individual: 'Individual',
    grupal:     'Grupal',
    mapas:      'Mapas Mentales',
    // practica: 'Práctica',
  };

  const typeConfig = [
    { type: 'individual', label: 'Individual',    color: 'individual' },
    { type: 'grupal',     label: 'Grupal',         color: 'grupal'     },
    { type: 'mapas',      label: 'Mapas Mentales', color: 'mapas'      },
    // { type: 'practica', label: 'Práctica',       color: 'practica'   },
  ];


  // ══════════════════════════════════════════
  // 2. ANIMACIÓN CANVAS — PORTADA
  // ══════════════════════════════════════════
  (function initCanvas() {
    const canvas = document.getElementById('cover-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: 38 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.8 + 0.4,
      vx:    (Math.random() - 0.5) * 0.28,
      vy:    (Math.random() - 0.5) * 0.28,
      alpha: Math.random() * 0.35 + 0.08
    }));

    const BAR_COUNT = 9;
    const bars = Array.from({ length: BAR_COUNT }, () => ({
      targetH:  Math.random() * 0.28 + 0.08,
      currentH: Math.random() * 0.1,
      speed:    Math.random() * 0.004 + 0.002,
      direction: 1,
      alpha:    Math.random() * 0.07 + 0.03
    }));

    function drawBars(w, h) {
      const gap  = w / (BAR_COUNT + 1);
      const maxH = h * 0.55;
      bars.forEach((bar, i) => {
        bar.currentH += bar.speed * bar.direction;
        if (bar.currentH >= bar.targetH)       { bar.direction = -1; }
        if (bar.currentH <= bar.targetH * 0.3) { bar.direction = 1; bar.targetH = Math.random() * 0.28 + 0.08; }
        const bh = bar.currentH * maxH;
        const bw = gap * 0.38;
        const bx = gap * (i + 1) - bw / 2;
        const by = h - bh;
        ctx.fillStyle = `rgba(255,255,255,${bar.alpha})`;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 3);
        ctx.fill();
      });
    }

    function drawTrendLine(w, h) {
      const gap = w / (BAR_COUNT + 1);
      const pts = bars.map((bar, i) => ({
        x: gap * (i + 1),
        y: h - bar.currentH * h * 0.55 - 6
      }));
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const mx = (pts[i-1].x + pts[i].x) / 2;
        const my = (pts[i-1].y + pts[i].y) / 2;
        ctx.quadraticCurveTo(pts[i-1].x, pts[i-1].y, mx, my);
      }
      ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
      ctx.strokeStyle = 'rgba(255,180,150,0.45)';
      ctx.lineWidth   = 1.8;
      ctx.stroke();
      pts.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,190,160,0.55)';
        ctx.fill();
      });
    }

    function drawDots(w, h) {
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.alpha})`;
        ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx   = dots[i].x - dots[j].x;
          const dy   = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.06*(1-dist/110)})`;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function tick() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      drawBars(w, h);
      drawTrendLine(w, h);
      drawDots(w, h);
      requestAnimationFrame(tick);
    }
    tick();
  })();


  // ══════════════════════════════════════════
  // 3. NAVBAR — scrolled + activo por sección
  // ══════════════════════════════════════════
  const mainHeader = document.getElementById('main-header');
  const navLinks   = document.querySelectorAll('.nav__menu a');

  function updateNavbar() {
    if (!mainHeader) return;
    mainHeader.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.08);
  }
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });

  const sectionMap = [];
  navLinks.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    const el = document.getElementById(id);
    if (el) sectionMap.push({ link, el });
  });

  function updateActiveLink() {
    const scrollMid = window.scrollY + window.innerHeight * 0.35;
    let current = sectionMap[0];
    sectionMap.forEach(item => { if (item.el.offsetTop <= scrollMid) current = item; });
    navLinks.forEach(l => l.classList.remove('active'));
    if (current) current.link.classList.add('active');
  }
  updateActiveLink();
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // — Reveal al scroll —
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // — Menú móvil —
  const mobileToggle = document.querySelector('.nav__toggle');
  const navMenu      = document.querySelector('.nav__menu');
  const navOverlay   = document.getElementById('nav-overlay');

  function openMobileMenu() {
    if (!navMenu || !navOverlay) return;
    navMenu.classList.add('open');
    navOverlay.classList.add('visible');
    mobileToggle.textContent = '✕';
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    if (!navMenu || !navOverlay) return;
    navMenu.classList.remove('open');
    navOverlay.classList.remove('visible');
    mobileToggle.textContent = '☰';
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    });
  }
  if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);
  if (navMenu)    navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));


  // ══════════════════════════════════════════
  // 4. MODAL VISOR PDF
  // ══════════════════════════════════════════
  const pdfModal   = document.getElementById('pdf-modal');
  const pdfFrame   = document.getElementById('pdf-frame');
  const modalTitle = document.getElementById('modal-title');
  const modalClose = document.getElementById('modal-close');

  function openPdfModal(title, file) {
    if (!pdfModal) return;
    modalTitle.textContent = title;
    pdfFrame.src = file;
    pdfModal.classList.add('active');
    pdfModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePdfModal() {
    if (!pdfModal) return;
    pdfModal.classList.remove('active');
    pdfModal.setAttribute('aria-hidden', 'true');
    pdfFrame.src = '';
    if (!worksModal || !worksModal.classList.contains('wmodal--open')) {
      document.body.style.overflow = '';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closePdfModal);
  if (pdfModal)   pdfModal.addEventListener('click', e => { if (e.target === pdfModal) closePdfModal(); });

  document.querySelectorAll('.open-preview').forEach(btn => {
    btn.addEventListener('click', () => openPdfModal(btn.dataset.title, btn.dataset.file));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (pdfModal   && pdfModal.classList.contains('active'))        { closePdfModal();   return; }
      if (worksModal && worksModal.classList.contains('wmodal--open')) { closeWorksModal(); }
    }
  });


  // ══════════════════════════════════════════
  // 5. CARGA DE DATOS — Google Sheet CSV
  // ══════════════════════════════════════════
  function parseCSV(text) {
    const [headerLine, ...rows] = text.trim().split('\n');
    const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return rows.map(row => {
      const values = [];
      let current = '', inQuotes = false;
      for (const char of row) {
        if (char === '"')                  { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes){ values.push(current.trim()); current = ''; }
        else                               { current += char; }
      }
      values.push(current.trim());
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
    });
  }

  let works         = [];
  let worksLoaded   = false;
  let currentFilter = 'todos';

  try {
    const res  = await fetch(SHEET_URL);
    const text = await res.text();
    works = parseCSV(text);
    updateWorksUI(works);
  } catch (e) {
    console.error('No se pudo cargar el Google Sheet:', e);
  }


  // ══════════════════════════════════════════
  // 6. ESTADÍSTICAS Y BARRAS DE PROGRESO
  // ══════════════════════════════════════════
  function updateWorksUI(works) {
    // Stats banner
    const statIds = {
      'stat-total':      () => works.length,
      'stat-individual': () => works.filter(w => w.type === 'individual').length,
      'stat-grupal':     () => works.filter(w => w.type === 'grupal').length,
      'stat-mapas':      () => works.filter(w => w.type === 'mapas').length,
      // 'stat-practica':() => works.filter(w => w.type === 'practica').length,
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
    const duration  = 1200;
    const startTime = performance.now();
    function update(currentTime) {
      const progress    = Math.min((currentTime - startTime) / duration, 1);
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
      const pct   = Math.round((count / total) * 100);
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

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const row     = entry.target;
        const fill    = row.querySelector('.ev__progress-fill');
        const counter = row.querySelector('.counter');
        if (fill)    setTimeout(() => { fill.style.width = fill.dataset.pct + '%'; fill.classList.add('animate'); }, 200);
        if (counter) animateCounter(counter, parseInt(counter.dataset.target));
        observer.unobserve(row);
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.ev__progress-row').forEach(row => observer.observe(row));
  }


  // ══════════════════════════════════════════
  // 7. MODAL FULLSCREEN — VISOR DE TRABAJOS
  // ══════════════════════════════════════════
  const worksModal    = document.getElementById('works-modal');
  const openWorksBtn  = document.getElementById('open-works-modal');
  const closeWorksBtn = document.getElementById('close-works-modal');
  const wmodalGrid    = document.getElementById('wmodal-grid');
  const wmodalEmpty   = document.getElementById('wmodal-empty');
  const wmodalFilters = document.querySelectorAll('.wmodal__filter');

  function openWorksModal() {
    if (!worksModal) return;
    worksModal.classList.add('wmodal--open');
    worksModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (!worksLoaded) { renderWorksInModal('todos'); worksLoaded = true; }
    if (closeWorksBtn) closeWorksBtn.focus();
  }

  function closeWorksModal() {
    if (!worksModal) return;
    worksModal.classList.remove('wmodal--open');
    worksModal.setAttribute('aria-hidden', 'true');
    if (!pdfModal || !pdfModal.classList.contains('active')) document.body.style.overflow = '';
    if (openWorksBtn) openWorksBtn.focus();
  }

  if (openWorksBtn)  openWorksBtn.addEventListener('click', openWorksModal);
  if (closeWorksBtn) closeWorksBtn.addEventListener('click', closeWorksModal);

  wmodalFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      wmodalFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderWorksInModal(currentFilter);
    });
  });

  function renderWorksInModal(filter) {
    if (!wmodalGrid) return;
    wmodalGrid.innerHTML = '';
    const filtered = filter === 'todos' ? works : works.filter(w => w.type === filter);

    if (filtered.length === 0) {
      if (wmodalEmpty) wmodalEmpty.style.display = 'block';
      return;
    }
    if (wmodalEmpty) wmodalEmpty.style.display = 'none';

    filtered.forEach((work, i) => {
      const card = document.createElement('article');
      card.className = 'wcard';
      card.style.animationDelay = (i * 0.07) + 's';
      card.dataset.file  = work.file;
      card.dataset.title = work.title;
      card.innerHTML = `
        <div class="wcard__thumb">
          ${work.thumb
            ? `<img src="${work.thumb}" alt="${work.title}" style="width:100%;height:100%;object-fit:cover;">`
            : `<iframe src="${work.file}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH" loading="lazy" tabindex="-1" aria-hidden="true"></iframe>`
          }
          <div class="wcard__thumb-overlay">
            <div class="wcard__view-btn">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="7" cy="7" r="5.5"/><circle cx="7" cy="7" r="2"/>
              </svg>
              Ver
            </div>
          </div>
        </div>
        <div class="wcard__body">
          <span class="wcard__type wcard__type--${work.type}">${typeLabels[work.type] || work.type}</span>
          <p class="wcard__title">${work.title}</p>
          <p class="wcard__desc">${work.desc}</p>
          <div class="wcard__date">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3">
              <rect x="1" y="2" width="10" height="9" rx="1.5"/><path d="M4 1v2M8 1v2M1 5h10"/>
            </svg>
            ${new Date(work.date + 'T00:00:00').toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>`;
      wmodalGrid.appendChild(card);
    });
  }

  if (wmodalGrid) {
    wmodalGrid.addEventListener('click', e => {
      const card = e.target.closest('.wcard');
      if (card) openPdfModal(card.dataset.title, card.dataset.file);
    });
  }


});