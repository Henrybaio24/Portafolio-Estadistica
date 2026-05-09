// js/modules/modalWorks.js — Modal fullscreen: filtros, búsqueda, render

const typeLabels = {
  individual: 'Individual',
  grupal: 'Grupal',
  mapas: 'Mapa Mental',
};

function initModalWorks(works) {
  const worksModal = document.getElementById('works-modal');
  const openWorksBtn = document.getElementById('open-works-modal');
  const closeWorksBtn = document.getElementById('close-works-modal');
  const wmodalGrid = document.getElementById('wmodal-grid');
  const wmodalEmpty = document.getElementById('wmodal-empty');
  const wmodalFilters = document.querySelectorAll('.wmodal__filter');
  const searchInput = document.getElementById('wmodal-search');
  const searchClear = document.getElementById('wmodal-search-clear');

  let currentFilter = 'todos';
  let currentSearch = '';
  let worksLoaded = false;

  if (!worksModal) return;

  function openWorksModal() {
    worksModal.classList.add('wmodal--open');
    worksModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (!worksLoaded) {
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

  function applyFilters() {
    const query = currentSearch.toLowerCase().trim();

    let filtered = currentFilter === 'todos'
      ? works
      : works.filter(w => w.type === currentFilter);

    if (query) {
      filtered = filtered.filter(w =>
        (w.title || '').toLowerCase().includes(query) ||
        (w.desc || '').toLowerCase().includes(query) ||
        (w.type || '').toLowerCase().includes(query)
      );
    }

    renderWorksInModal(filtered);
  }

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
      card.dataset.file = work.file;
      card.dataset.title = work.title;

      card.innerHTML = `
        <div class="wcard__thumb">
          <div class="wcard__skeleton-overlay"></div>
          <iframe src="${work.file}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH"
                tabindex="-1" aria-hidden="true"></iframe>
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

      const iframe = card.querySelector('iframe');
      const overlay = card.querySelector('.wcard__skeleton-overlay');
      let loaded = false;

      if (iframe) {
        iframe.addEventListener('load', () => {
          loaded = true;
          if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 400);
          }
        }, { once: true });
      }

      // Timeout con fallback de error
            // Timeout con fallback: thumbnail de Drive o icono del tipo
      setTimeout(() => {
        if (!loaded && overlay && overlay.parentNode) {
          const fileUrl = work.file;
          const fileIdMatch = fileUrl.match(/\/d\/([^\/]+)/);
          const fileId = fileIdMatch ? fileIdMatch[1] : null;
          
          if (fileId) {
            // Mostrar thumbnail de Google Drive
            overlay.innerHTML = `
              <div style="position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#F8FAFC;">
                <img src="https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300" 
                     style="width:100%;height:100%;object-fit:cover;border-radius:8px;"
                     alt="Vista previa de ${work.title}"
                     onerror="this.parentElement.innerHTML='<div style=\\'display:flex;flex-direction:column;align-items:center;gap:0.5rem;color:#6B7280;\\'><svg width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><path d=\\'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z\\'/><polyline points=\\'14 2 14 8 20 8\\'/></svg><span style=\\'font-size:0.75rem;\\'>${typeLabels[work.type] || work.type}</span></div>'">
              </div>`;
          } else {
            // Sin file ID → icono del tipo de trabajo
            const icon = work.type === 'individual' ? '📄' : work.type === 'grupal' ? '👥' : '🧠';
            overlay.innerHTML = `
              <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:0.5rem;color:#6B7280;">
                <span style="font-size:2rem;">${icon}</span>
                <span style="font-size:0.75rem;font-weight:500;">${typeLabels[work.type] || work.type}</span>
                <span style="font-size:0.65rem;color:#9CA3AF;">Click para ver</span>
              </div>`;
          }
          overlay.style.background = '#F8FAFC';
        } else if (overlay && overlay.parentNode) {
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

  // Event listeners
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

  // Click en tarjeta → abrir PDF
  wmodalGrid?.addEventListener('click', e => {
    const card = e.target.closest('.wcard');
    if (card && window.openPdfModal) {
      window.openPdfModal(card.dataset.title, card.dataset.file);
    }
  });

  // Escape para cerrar
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && worksModal.classList.contains('wmodal--open')) {
      closeWorksModal();
    }
  });
}