document.addEventListener('DOMContentLoaded', () => {

  // ══════════════════════════════════════════
  // ANIMACIÓN CANVAS — PORTADA
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
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
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
        if (bar.currentH >= bar.targetH) { bar.direction = -1; }
        if (bar.currentH <= bar.targetH * 0.3) {
          bar.direction = 1;
          bar.targetH = Math.random() * 0.28 + 0.08;
        }
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
      ctx.lineWidth = 1.8;
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
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.06*(1-dist/110)})`;
            ctx.lineWidth = 0.6;
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
  // 📦 TRABAJOS — Agrega tus archivos aquí
  // type: "individual" | "grupal" | "practica"
  // file: ruta local O enlace de Google Drive con /preview al final
  // ══════════════════════════════════════════
  const works = [
    {
      id: 1,
      title: "Tarea 1: Ensayo",
      type: "individual",
      date: "2026-04-15",
      desc: "Ensayo sobre la investigación relizada por los docentes de la carrera",
      file: "https://drive.google.com/file/d/1lYUMgiLg-QSYau52TXiuuEjpa5kP4vKy/preview"
      // Google Drive: "https://drive.google.com/file/d/XXXX/preview"
    },
    {
      id: 2,
      title: "Tarea 2: Mapa mental: Pelicula Mente Brillante",
      type: "individual",
      date: "2026-04-25",
      desc: "Mapa mental acerca de la Pelicula Mente Brillante",
      file: "https://drive.google.com/file/d/1jmkhCAeOH0C8uYLoT1y01Wv4NdKXgZcW/preview"
      // Google Drive: "https://drive.google.com/file/d/XXXX/preview"
    }
    // Copia este bloque para agregar más:
    // {
    //   id: 2,
    //   title: "Proyecto Grupal",
    //   type: "grupal",
    //   date: "2026-05-01",
    //   desc: "Descripción del trabajo.",
    //   file: "https://drive.google.com/file/d/XXXX/preview"
    // },
  ];

  const typeLabels = { individual: 'Individual', grupal: 'Grupal', practica: 'Práctica' };


  // ══════════════════════════════════════════
  // MODAL VISOR PDF (documento individual)
  // ══════════════════════════════════════════
  const pdfModal    = document.getElementById('pdf-modal');
  const pdfFrame    = document.getElementById('pdf-frame');
  const modalTitle  = document.getElementById('modal-title');
  const modalClose  = document.getElementById('modal-close');

  function openPdfModal(title, file) {
    modalTitle.textContent = title;
    pdfFrame.src = file;
    pdfModal.classList.add('active');
    pdfModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closePdfModal() {
    pdfModal.classList.remove('active');
    pdfModal.setAttribute('aria-hidden', 'true');
    pdfFrame.src = '';
    if (!worksModal.classList.contains('wmodal--open')) {
      document.body.style.overflow = '';
    }
  }
  modalClose.addEventListener('click', closePdfModal);
  pdfModal.addEventListener('click', e => { if (e.target === pdfModal) closePdfModal(); });

  document.querySelectorAll('.open-preview').forEach(btn => {
    btn.addEventListener('click', () => openPdfModal(btn.dataset.title, btn.dataset.file));
  });


  // ══════════════════════════════════════════
  // MODAL FULLSCREEN — VISOR DE TRABAJOS
  // ══════════════════════════════════════════
  const worksModal      = document.getElementById('works-modal');
  const openWorksBtn    = document.getElementById('open-works-modal');
  const closeWorksBtn   = document.getElementById('close-works-modal');
  const wmodalGrid      = document.getElementById('wmodal-grid');
  const wmodalEmpty     = document.getElementById('wmodal-empty');
  const wmodalFilters   = document.querySelectorAll('.wmodal__filter');

  let currentFilter = 'todos';
  let worksLoaded   = false;

  function openWorksModal() {
    worksModal.classList.add('wmodal--open');
    worksModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (!worksLoaded) {
      renderWorksInModal('todos');
      worksLoaded = true;
    }
    closeWorksBtn.focus();
  }

  function closeWorksModal() {
    worksModal.classList.remove('wmodal--open');
    worksModal.setAttribute('aria-hidden', 'true');
    if (!pdfModal.classList.contains('active')) {
      document.body.style.overflow = '';
    }
    openWorksBtn.focus();
  }

  openWorksBtn.addEventListener('click', openWorksModal);
  closeWorksBtn.addEventListener('click', closeWorksModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (pdfModal.classList.contains('active')) { closePdfModal(); return; }
      if (worksModal.classList.contains('wmodal--open')) closeWorksModal();
    }
  });

  wmodalFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      wmodalFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderWorksInModal(currentFilter);
    });
  });

  function renderWorksInModal(filter) {
    wmodalGrid.innerHTML = '';
    const filtered = filter === 'todos' ? works : works.filter(w => w.type === filter);

    if (filtered.length === 0) {
      wmodalEmpty.style.display = 'block';
      return;
    }
    wmodalEmpty.style.display = 'none';

    filtered.forEach((work, i) => {
      const card = document.createElement('article');
      card.className = 'wcard';
      card.style.animationDelay = (i * 0.07) + 's';
      card.dataset.file  = work.file;
      card.dataset.title = work.title;

      card.innerHTML = `
        <div class="wcard__thumb">
          <iframe src="${work.file}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH"
            loading="lazy" tabindex="-1" aria-hidden="true"></iframe>
          <div class="wcard__thumb-overlay">
            <div class="wcard__view-btn">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="7" cy="7" r="5.5"/>
                <circle cx="7" cy="7" r="2"/>
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
            ${new Date(work.date).toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>`;
      wmodalGrid.appendChild(card);
    });
  }

  wmodalGrid.addEventListener('click', e => {
    const card = e.target.closest('.wcard');
    if (card) openPdfModal(card.dataset.title, card.dataset.file);
  });


  // ══════════════════════════════════════════
  // NAVBAR — scrolled + activo por sección
  // ══════════════════════════════════════════
  const mainHeader = document.getElementById('main-header');
  const navLinks   = document.querySelectorAll('.nav__menu a');

  // — Estado scrolled (glassmorphism) —
  function updateNavbar() {
    const threshold = window.innerHeight * 0.08;
    mainHeader.classList.toggle('scrolled', window.scrollY > threshold);
  }
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });

  // — Link activo basado en scrollY —
  // Mapea cada href a su sección
  const sectionMap = [];
  navLinks.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    const el = document.getElementById(id);
    if (el) sectionMap.push({ link, el, id });
  });

  function updateActiveLink() {
    const scrollMid = window.scrollY + window.innerHeight * 0.35;
    let current = sectionMap[0];

    sectionMap.forEach(item => {
      if (item.el.offsetTop <= scrollMid) {
        current = item;
      }
    });

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

  // — Menú móvil con overlay —
  const mobileToggle = document.querySelector('.nav__toggle');
  const navMenu      = document.querySelector('.nav__menu');
  const navOverlay   = document.getElementById('nav-overlay');

  function openMobileMenu() {
    navMenu.classList.add('open');
    navOverlay.classList.add('visible');
    mobileToggle.textContent = '✕';
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    navMenu.classList.remove('open');
    navOverlay.classList.remove('visible');
    mobileToggle.textContent = '☰';
    document.body.style.overflow = '';
  }

  mobileToggle.addEventListener('click', () => {
    navMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });
  navOverlay.addEventListener('click', closeMobileMenu);
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
});