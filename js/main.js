document.addEventListener('DOMContentLoaded', async () => {

  // ══════════════════════════════════════════
  // 0. HEADER MEJORADO - CONFIGURACIÓN INICIAL
  // ══════════════════════════════════════════
  const header = document.querySelector('.header');
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');
  const navOverlay = document.getElementById('nav-overlay');
  const navLinks = document.querySelectorAll('.nav__menu a');
  
  // Función mejorada para el cambio de estilo del header con scroll
  function updateNavbar() {
    if (!header) return;
    const scrollY = window.scrollY;
    const isScrolled = scrollY > 50;
    
    header.classList.toggle('scrolled', isScrolled);
    
    // Añadir/remover clase en el body para espaciador (opcional)
    if (isScrolled) {
      document.body.classList.add('has-scrolled');
    } else {
      document.body.classList.remove('has-scrolled');
    }
  }
  
  // Inicializar header
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });
  
  // Funciones mejoradas para menú móvil
  function openMobileMenu() {
    if (!navMenu || !navOverlay) return;
    navMenu.classList.add('open');
    navOverlay.classList.add('visible');
    if (navToggle) navToggle.textContent = '✕';
    document.body.style.overflow = 'hidden';
    // Opcional: animación de entrada para los items del menú
    const menuItems = navMenu.querySelectorAll('li');
    menuItems.forEach((item, index) => {
      item.style.animation = `menuItemFadeIn 0.3s ease forwards ${index * 0.05}s`;
    });
  }
  
  function closeMobileMenu() {
    if (!navMenu || !navOverlay) return;
    navMenu.classList.remove('open');
    navOverlay.classList.remove('visible');
    if (navToggle) navToggle.textContent = '☰';
    if (!pdfModal || !pdfModal.classList.contains('active')) {
      if (!worksModal || !worksModal.classList.contains('wmodal--open')) {
        document.body.style.overflow = '';
      }
    }
  }
  
  // Event listeners para menú móvil (sin duplicar)
  if (navToggle) {
    // Remover event listener anterior si existe para evitar duplicados
    navToggle.removeEventListener('click', null);
    navToggle.addEventListener('click', () => {
      navMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    });
  }
  
  if (navOverlay) {
    navOverlay.removeEventListener('click', null);
    navOverlay.addEventListener('click', closeMobileMenu);
  }
  
  if (navMenu) {
    navMenu.querySelectorAll('a').forEach(link => {
      link.removeEventListener('click', null);
      link.addEventListener('click', closeMobileMenu);
    });
  }
  
  
  // Función mejorada para detectar sección activa
  function updateActiveLink() {
    const scrollMid = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    let minDistance = Infinity;
    
    sectionMap.forEach(item => {
      const sectionTop = item.el.offsetTop;
      const distance = Math.abs(sectionTop - scrollMid);
      if (distance < minDistance && sectionTop <= scrollMid + 100) {
        minDistance = distance;
        current = item;
      }
    });
    
    navLinks.forEach(l => l.classList.remove('active'));
    if (current) {
      current.link.classList.add('active');
      // Animación sutil al cambiar de sección
      current.link.style.transform = 'scale(1.02)';
      setTimeout(() => {
        if (current.link) current.link.style.transform = '';
      }, 200);
    }
  }

  // ══════════════════════════════════════════
  // 1. CONFIGURACIÓN GOOGLE SHEET
  // ══════════════════════════════════════════
  const SHEET_ID  = '2PACX-1vQZBQQJF6phbRXNRkdMqDYdhgB9JaXTmMuT-ACo79YJRotfLyxiPsXABuLxLSlFybhlmEpYil4YuNLG';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=0&single=true&output=csv`;

  const typeLabels = {
    individual: 'Individual',
    grupal:     'Grupal',
    mapas:      'Mapa Mental',
  };

  const typeConfig = [
    { type: 'individual', label: 'Individual',    color: 'individual' },
    { type: 'grupal',     label: 'Grupal',         color: 'grupal'     },
    { type: 'mapas',      label: 'Mapa Mental', color: 'mapas'      },
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
  // 3. NAVBAR — activo por sección (MEJORADO)
  // ══════════════════════════════════════════
  const sectionMap = [];
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) sectionMap.push({ link, el });
    }
  });

  // Actualizar enlace activo con mejor precisión
  updateActiveLink();
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // — Reveal al scroll (mejorado) —
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { 
        e.target.classList.add('visible'); 
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  
  document.querySelectorAll('.reveal, .silabo__unit-card').forEach(el => revealObs.observe(el));


  // ══════════════════════════════════════════
  // 4. MODAL VISOR PDF (MEJORADO - cerrar con overlay)
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
    // Pequeña animación de entrada
    pdfModal.style.animation = 'modalFadeIn 0.3s ease';
    setTimeout(() => { if (pdfModal) pdfModal.style.animation = ''; }, 300);
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

  if (modalClose) {
    modalClose.removeEventListener('click', null);
    modalClose.addEventListener('click', closePdfModal);
  }
  
  if (pdfModal) {
    pdfModal.removeEventListener('click', null);
    pdfModal.addEventListener('click', e => { 
      if (e.target === pdfModal) closePdfModal(); 
    });
  }

  document.querySelectorAll('.open-preview').forEach(btn => {
    btn.removeEventListener('click', null);
    btn.addEventListener('click', () => openPdfModal(btn.dataset.title, btn.dataset.file));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (pdfModal && pdfModal.classList.contains('active')) { 
        closePdfModal();   
        return; 
      }
      if (worksModal && worksModal.classList.contains('wmodal--open')) { 
        closeWorksModal(); 
      }
    }
  });

  // Añadir animación para modales
  if (!document.querySelector('#modal-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'modal-animation-styles';
    style.textContent = `
      @keyframes modalFadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }


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

  const loader         = document.getElementById('page-loader');
  const loaderProgress = document.getElementById('loader-progress');

  function setLoaderProgress(pct) {
    if (loaderProgress) loaderProgress.style.width = pct + '%';
  }

  function hideLoader() {
    if (!loader) return;
    loader.classList.add('loader--hidden');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }

  setLoaderProgress(15);
  const progressSim = setInterval(() => {
    const current = parseFloat(loaderProgress?.style.width || '15');
    if (current < 80) setLoaderProgress(current + (Math.random() * 6));
  }, 300);

  try {
    const res  = await fetch(SHEET_URL);
    setLoaderProgress(90);
    const text = await res.text();
    works = parseCSV(text);
    updateWorksUI(works);
    setLoaderProgress(100);
  } catch (e) {
    console.error('No se pudo cargar el Google Sheet:', e);
    setLoaderProgress(100);
  } finally {
    clearInterval(progressSim);
    setTimeout(hideLoader, 380);
  }


  // ══════════════════════════════════════════
  // 6. ESTADÍSTICAS Y BARRAS DE PROGRESO
  // ══════════════════════════════════════════
  function updateWorksUI(works) {
    const statIds = {
      'stat-total':      () => works.length,
      'stat-individual': () => works.filter(w => w.type === 'individual').length,
      'stat-grupal':     () => works.filter(w => w.type === 'grupal').length,
      'stat-mapas':      () => works.filter(w => w.type === 'mapas').length,
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
  const searchInput   = document.getElementById('wmodal-search');
  const searchClear   = document.getElementById('wmodal-search-clear');

  let currentSearch = '';
  currentFilter = 'todos';

  function openWorksModal() {
    if (!worksModal) return;
    worksModal.classList.add('wmodal--open');
    worksModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (!worksLoaded) { applyFilters(); worksLoaded = true; }
    if (closeWorksBtn) closeWorksBtn.focus();
  }

  function closeWorksModal() {
    if (!worksModal) return;
    worksModal.classList.remove('wmodal--open');
    worksModal.setAttribute('aria-hidden', 'true');
    if (!pdfModal || !pdfModal.classList.contains('active')) document.body.style.overflow = '';
    if (openWorksBtn) openWorksBtn.focus();
  }

  function applyFilters() {
    const query = currentSearch.toLowerCase().trim();

    let filtered = currentFilter === 'todos'
      ? works
      : works.filter(w => w.type === currentFilter);

    if (query) {
      filtered = filtered.filter(w =>
        (w.title || '').toLowerCase().includes(query) ||
        (w.desc  || '').toLowerCase().includes(query) ||
        (w.type  || '').toLowerCase().includes(query)
      );
    }

    renderWorksInModal(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value;
      if (searchClear) searchClear.classList.toggle('visible', currentSearch.length > 0);
      applyFilters();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      currentSearch = '';
      if (searchClear) searchClear.classList.remove('visible');
      if (searchInput) searchInput.focus();
      applyFilters();
    });
  }

  if (openWorksBtn) {
    openWorksBtn.removeEventListener('click', null);
    openWorksBtn.addEventListener('click', openWorksModal);
  }
  
  if (closeWorksBtn) {
    closeWorksBtn.removeEventListener('click', null);
    closeWorksBtn.addEventListener('click', closeWorksModal);
  }

  wmodalFilters.forEach(btn => {
    btn.removeEventListener('click', null);
    btn.addEventListener('click', () => {
      wmodalFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  function renderWorksInModal(filtered) {
    if (!wmodalGrid) return;
    wmodalGrid.innerHTML = '';

    if (filtered.length === 0) {
      const query = currentSearch.trim();
      wmodalGrid.innerHTML = `
        <div class="wmodal__no-results">
          <strong>${query ? `Sin resultados para "${query}"` : 'Sin trabajos en esta categoría'}</strong>
          ${query ? 'Intenta con otras palabras clave.' : 'Aún no hay trabajos agregados.'}
        </div>`;
      if (wmodalEmpty) wmodalEmpty.style.display = 'none';
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
          <div class="wcard__skeleton-overlay"></div>
          <iframe src="${work.file}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH"
                  loading="lazy" tabindex="-1" aria-hidden="true"></iframe>
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
          <p class="wcard__title">${highlightMatch(work.title, currentSearch)}</p>
          <p class="wcard__desc">${highlightMatch(work.desc, currentSearch)}</p>
          <div class="wcard__date">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3">
              <rect x="1" y="2" width="10" height="9" rx="1.5"/>
              <path d="M4 1v2M8 1v2M1 5h10"/>
            </svg>
            ${new Date(work.date + 'T00:00:00').toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>`;

      const iframe  = card.querySelector('iframe');
      const overlay = card.querySelector('.wcard__skeleton-overlay');

      if (iframe) {
        iframe.addEventListener('load', () => {
          if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 400);
          }
        }, { once: true });
      }

      setTimeout(() => {
        if (overlay && overlay.parentNode) {
          overlay.style.opacity = '0';
          setTimeout(() => overlay.remove(), 400);
        }
      }, 8000);

      wmodalGrid.appendChild(card);
    });
  }

  function highlightMatch(text, query) {
    if (!query || !text) return text || '';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(
      new RegExp(`(${escaped})`, 'gi'),
      '<mark style="background:rgba(184,50,31,0.18);color:var(--primary);border-radius:3px;padding:0 2px;">$1</mark>'
    );
  }

  if (wmodalGrid) {
    wmodalGrid.addEventListener('click', e => {
      const card = e.target.closest('.wcard');
      if (card) openPdfModal(card.dataset.title, card.dataset.file);
    });
  }


  // ══════════════════════════════════════════
  // ANIMACIÓN CANVAS — SÍLABO
  // ══════════════════════════════════════════
  (function initSilaboCanvas() {
    const canvas = document.getElementById('silabo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const COLS = 7;
    const bars = Array.from({ length: COLS }, (_, i) => ({
      col: i,
      currentH: Math.random() * 0.1 + 0.05,
      target:   Math.random() * 0.55 + 0.1,
      speed:    Math.random() * 0.006 + 0.003,
      dir: 1
    }));

    const pts = Array.from({ length: 38 }, () => ({
      x:  Math.random() * W(),
      y:  Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r:  Math.random() * 2 + 0.8
    }));

    function tick() {
      const w = W(), h = H();

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#1e3a5f');
      bg.addColorStop(1, '#0d2444');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 5; i++) {
        const y = h * i / 5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      bars.forEach(b => {
        b.currentH += b.speed * b.dir;
        if (b.currentH >= b.target) { b.dir = -1; }
        if (b.currentH <= b.target * 0.2) {
          b.dir = 1;
          b.target = Math.random() * 0.55 + 0.1;
        }
        const bx = (b.col + 1) * w / (COLS + 1);
        const bh = b.currentH * h * 0.78;
        const bw = w / (COLS + 1) * 0.36;
        const by = h - bh;

        const barGrad = ctx.createLinearGradient(0, by, 0, h);
        barGrad.addColorStop(0, 'rgba(37,99,235,0.95)');
        barGrad.addColorStop(1, 'rgba(37,99,235,0.20)');
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(bx - bw / 2, by, bw, bh, [4, 4, 2, 2]);
        ctx.fill();

        ctx.fillStyle = 'rgba(96,165,250,0.85)';
        ctx.beginPath();
        ctx.roundRect(bx - bw / 2, by, bw, 2.5, 2);
        ctx.fill();
      });

      const linePoints = bars.map(b => ({
        x: (b.col + 1) * w / (COLS + 1),
        y: h - b.currentH * h * 0.78 - 6
      }));
      ctx.beginPath();
      linePoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = 'rgba(147,197,253,0.85)';
      ctx.lineWidth = 2;
      ctx.stroke();

      linePoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,190,160,0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,190,160,1)';
        ctx.fill();
      });

      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,200,180,0.45)';
        ctx.fill();
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 80) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,180,150,${0.18 * (1 - d / 80)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(tick);
    }
    tick();
  })();


  // ══════════════════════════════════════════
  // ANIMACIÓN CANVAS — EVIDENCIAS
  // ══════════════════════════════════════════
  (function initEvidenciasCanvas() {
    const canvas = document.getElementById('evidencias-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;
    const nodes = Array.from({ length: 13 }, () => ({
      x:     Math.random() * (W() - 80) + 40,
      y:     Math.random() * (H() - 80) + 40,
      vx:    (Math.random() - 0.5) * 0.42,
      vy:    (Math.random() - 0.5) * 0.42,
      big:   Math.random() > 0.65,
      pulse: Math.random() * Math.PI * 2
    }));
    function drawDoc(x, y, w, h, glow) {
      if (glow) {
        ctx.shadowColor = 'rgba(37,99,235,0.7)';
        ctx.shadowBlur  = 12;
      }
      ctx.fillStyle   = 'rgba(219,234,254,0.93)';
      ctx.strokeStyle = glow ? 'rgba(96,165,250,0.95)' : 'rgba(147,197,253,0.5)';
      ctx.lineWidth   = glow ? 1.3 : 0.7;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - h / 2, w, h, 3);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(37,99,235,0.7)';
      ctx.beginPath();
      ctx.roundRect(x - w * 0.3, y - h * 0.22, w * 0.55, 2, 1);
      ctx.fill();
      [0, 1].forEach(i => {
        ctx.fillStyle = `rgba(147,197,253,${0.55 - i * 0.12})`;
        ctx.beginPath();
        ctx.roundRect(x - w * 0.3, y - h * 0.02 + i * 6, w * (0.58 - i * 0.1), 1.5, 1);
        ctx.fill();
      });
    }
    function tick() {
      const w = W(), h = H();
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#0d1f3c');
      bg.addColorStop(1, '#060e1e');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(96,165,250,${0.25 * (1 - d / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            if (d < 65) {
              const mx = (nodes[i].x + nodes[j].x) / 2;
              const my = (nodes[i].y + nodes[j].y) / 2;
              ctx.beginPath();
              ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(147,197,253,0.45)';
              ctx.fill();
            }
          }
        }
      }
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        n.pulse += 0.025;
        if (n.x < 22)     { n.x = 22;     n.vx *= -1; }
        if (n.x > w - 22) { n.x = w - 22; n.vx *= -1; }
        if (n.y < 22)     { n.y = 22;     n.vy *= -1; }
        if (n.y > h - 22) { n.y = h - 22; n.vy *= -1; }
        const glow = n.big && Math.sin(n.pulse) > 0.4;
        if (n.big) drawDoc(n.x, n.y, 30, 37, glow);
        else       drawDoc(n.x, n.y, 18, 22, false);
      });
      requestAnimationFrame(tick);
    }
    tick();
  })();

});