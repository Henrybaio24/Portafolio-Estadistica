// js/modules/modalWorks.js — Modal fullscreen: filtros, búsqueda, render

const typeLabels = {
  individual: 'Individual',
  grupal: 'Grupal',
  mapas: 'Mapa Mental',
  pruebas: 'Pruebas',
  diapositivas: 'Diapositivas',
  otros: 'Otros',
};

function injectWorksThumbStyles() {
  if (document.querySelector('#wcard-thumb-styles')) return;
  const style = document.createElement('style');
  style.id = 'wcard-thumb-styles';
  style.textContent = `
    .wcard__thumb {
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      background: #F1F5F9;
    }

    /* Skeleton shimmer mientras carga la miniatura */
    .wcard__skeleton {
      position: absolute; inset: 0;
      background: linear-gradient(100deg, #F1F5F9 30%, #E2E8F0 50%, #F1F5F9 70%);
      background-size: 200% 100%;
      animation: wcardShimmer 1.4s ease-in-out infinite;
      transition: opacity 0.35s ease;
      z-index: 1;
    }
    @keyframes wcardShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Imagen: fade-in suave + ligero zoom al hover */
    .wcard__img {
      width: 100%; height: 100%;
      object-fit: cover;
      opacity: 0;
      transform: scale(1.02);
      transition: opacity 0.4s ease, transform 0.4s ease;
      display: block;
      position: relative;
      z-index: 0;
    }
    .wcard__img--loaded { opacity: 1; }
    .wcard__thumb:hover .wcard__img { transform: scale(1.06); }

    /* Fallback (cuando no hay miniatura disponible) */
    .wcard__fallback {
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(160deg, rgba(184,50,31,0.06), rgba(184,50,31,0.02));
      color: var(--primary, #B8321F);
      animation: wcardFadeIn 0.3s ease;
    }
    .wcard__fallback span {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: #64748B;
    }
    @keyframes wcardFadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }

    /* Overlay "Ver" al hacer hover (oscurece levemente la miniatura) */
    .wcard__thumb-overlay {
      position: absolute; inset: 0; z-index: 2;
      display: flex; align-items: center; justify-content: center;
      background: rgba(15, 23, 42, 0);
      opacity: 0;
      transition: opacity 0.25s ease, background 0.25s ease;
    }
    .wcard__thumb:hover .wcard__thumb-overlay {
      opacity: 1;
      background: rgba(15, 23, 42, 0.35);
    }
    .wcard__view-btn {
      display: flex; align-items: center; gap: 0.4rem;
      background: #fff; color: #1E293B;
      font-size: 0.78rem; font-weight: 600;
      padding: 0.45rem 0.9rem; border-radius: 999px;
      transform: translateY(6px);
      transition: transform 0.25s ease;
    }
    .wcard__thumb:hover .wcard__view-btn { transform: translateY(0); }
  `;
  document.head.appendChild(style);
}

function initModalWorks(works) {
  injectWorksThumbStyles();
  const worksModal    = document.getElementById('works-modal');
  const openWorksBtn  = document.getElementById('open-works-modal');
  const closeWorksBtn = document.getElementById('close-works-modal');
  const wmodalGrid    = document.getElementById('wmodal-grid');
  const wmodalEmpty   = document.getElementById('wmodal-empty');
  const wmodalFilters = document.querySelectorAll('.wmodal__filter');
  const searchInput   = document.getElementById('wmodal-search');
  const searchClear   = document.getElementById('wmodal-search-clear');
  const sortBtn       = document.getElementById('wmodal-sort-btn');
  const sortIcon      = document.getElementById('wmodal-sort-icon');
  const sortLabel     = document.getElementById('wmodal-sort-label');

  let currentFilter = 'todos';
  let currentSearch = '';
  let sortAsc       = true;   // true = más antiguos primero, false = más recientes
  let worksLoaded   = false;

  if (!worksModal) return;

  // ── ORDENAR ──────────────────────────────────────────────
  function getSortedWorks(list) {
    return [...list].sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return sortAsc ? da - db : db - da;
    });
  }

  function updateSortBtn() {
    if (!sortBtn) return;
    sortBtn.classList.toggle('wmodal__sort--active', !sortAsc);
    if (sortIcon)  sortIcon.className = sortAsc ? 'ti ti-sort-ascending' : 'ti ti-sort-descending';
    if (sortLabel) sortLabel.textContent = sortAsc ? 'Más antiguos' : 'Más recientes';
    sortBtn.setAttribute('aria-label', sortAsc ? 'Ordenar: más antiguos primero' : 'Ordenar: más recientes primero');
  }

  sortBtn?.addEventListener('click', () => {
    sortAsc = !sortAsc;
    updateSortBtn();
    applyFilters();
  });

  // ── MODAL ─────────────────────────────────────────────────
  function openWorksModal() {
    worksModal.classList.add('wmodal--open');
    worksModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (!worksLoaded) {
        updateSortBtn();
        applyFilters();
        worksLoaded = true;
      }
      closeWorksBtn?.focus();
    }, 350);
  }

  function closeWorksModal() {
    worksModal.classList.remove('wmodal--open');
    worksModal.setAttribute('aria-hidden', 'true');

    const pdfModal = document.getElementById('pdf-modal');
    if (!pdfModal?.classList.contains('active')) {
      document.body.style.overflow = '';
    }

    openWorksBtn?.focus();
  }

  // ── FILTROS + BÚSQUEDA ────────────────────────────────────
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

    filtered = getSortedWorks(filtered);
    renderWorksInModal(filtered);
  }

  // ── RENDER ────────────────────────────────────────────────
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

      // ── MINIATURA LIGERA ─────────────────────────────────
      // Antes: se creaba un <iframe> por cada tarjeta apuntando directo
      // al documento completo en Drive. Con 26+ trabajos, eso disparaba
      // 26+ cargas pesadas simultáneas al abrir la pestaña "Todos",
      // saturando la conexión y haciendo que Drive respondiera lento
      // incluso para el documento que el usuario quería abrir después.
      //
      // Ahora: se usa directamente la miniatura liviana de Drive
      // (drive.google.com/thumbnail) en mayor resolución, con un
      // skeleton "shimmer" mientras carga y un fade-in al terminar.
      // El documento pesado (iframe) solo se carga cuando el usuario
      // hace click para verlo, dentro de modalPdf.js.
      const fileIdMatch = work.file.match(/\/d\/([^\/]+)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;

      const typeIcons = {
        individual: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>',
        grupal:     '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
        mapas:      '<circle cx="12" cy="12" r="4"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/><path d="M8.5 10L6 7.5M15.5 10L18 7.5M8.5 14L6 16.5M15.5 14L18 16.5"/>',
        pruebas:    '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
        diapositivas: '<rect x="2" y="4" width="20" height="14" rx="1.5"/><path d="M8 21h8M12 18v3"/>',
        otros:      '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
      };
      const iconSvg = typeIcons[work.type] || typeIcons.otros;
      const fallbackHtml = `
        <div class="wcard__fallback">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>
          <span>${typeLabels[work.type] || work.type}</span>
        </div>`;

      const thumbContent = fileId
        ? `<div class="wcard__skeleton"></div>
           <img src="https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h600"
                loading="lazy"
                class="wcard__img"
                alt="Vista previa de ${work.title}"
                onload="this.previousElementSibling.style.opacity='0';this.classList.add('wcard__img--loaded')"
                onerror="this.previousElementSibling.remove();this.replaceWith(Object.assign(document.createElement('div'),{className:'wcard__fallback',innerHTML:this.parentElement.dataset.fallback}))">`
        : fallbackHtml;

      card.innerHTML = `
        <div class="wcard__thumb" data-fallback="${fallbackHtml.replace(/"/g, '&quot;')}">
          ${thumbContent}
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
            ${new Date(work.date + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>`;

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

  // ── EVENT LISTENERS ───────────────────────────────────────
  openWorksBtn?.addEventListener('click', openWorksModal);
  closeWorksBtn?.addEventListener('click', closeWorksModal);

  wmodalFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      wmodalFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  searchInput?.addEventListener('input', () => {
    currentSearch = searchInput.value;
    searchClear?.classList.toggle('visible', currentSearch.length > 0);
    applyFilters();
  });

  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    currentSearch = '';
    searchClear.classList.remove('visible');
    searchInput.focus();
    applyFilters();
  });

  wmodalGrid?.addEventListener('click', e => {
    const card = e.target.closest('.wcard');
    if (card && window.openPdfModal) {
      window.openPdfModal(card.dataset.title, card.dataset.file);
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && worksModal.classList.contains('wmodal--open')) {
      closeWorksModal();
    }
  });
}