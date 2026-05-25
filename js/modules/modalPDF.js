// js/modules/modalPdf.js — Visor de documentos con detección de tipo

function initModalPdf() {
  const pdfModal   = document.getElementById('pdf-modal');
  const pdfFrame   = document.getElementById('pdf-frame');
  const modalTitle = document.getElementById('modal-title');
  const modalClose = document.getElementById('modal-close');
  if (!pdfModal) return;

  // ── OVERLAY DE CARGA ──────────────────────────────────────
  // Se inyecta una sola vez dentro del .modal__viewer
  let loadingOverlay = pdfModal.querySelector('.modal__loading');
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'modal__loading';
    loadingOverlay.innerHTML = `
      <div class="modal__loading-inner">
        <div class="modal__spinner"></div>
        <p class="modal__loading-text">Cargando documento<span class="modal__loading-dots"></span></p>
      </div>`;
    // Insertarlo dentro del viewer, sobre el iframe
    const viewer = pdfModal.querySelector('.modal__viewer');
    if (viewer) viewer.appendChild(loadingOverlay);
  }

  let loadTimeout = null;

  function showLoading() {
    loadingOverlay.classList.add('modal__loading--visible');
  }

  function hideLoading() {
    clearTimeout(loadTimeout);
    loadingOverlay.classList.remove('modal__loading--visible');
  }

  // ── ABRIR MODAL ───────────────────────────────────────────
  window.openPdfModal = function(title, file) {
    const isExcel = /\.(xlsx|xls|xlsm)$/i.test(file) || file.includes('excel');
    const isPDF   = /\.pdf$/i.test(file) ||
                    file.includes('drive.google.com/file') ||
                    file.includes('/preview');
    const isWeb   = !isExcel && !isPDF;

    if (isWeb) {
      window.open(file, '_blank', 'noopener,noreferrer');
      return;
    }

    // 1. Limpiar iframe ANTES de asignar nuevo src → evita ver el documento anterior
    pdfFrame.src = '';

    // 2. Mostrar overlay inmediatamente
    showLoading();

    // 3. Asignar título y nuevo src
    modalTitle.textContent = title;
    const src = isExcel
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file)}`
      : file;

    // 4. Timeout de seguridad: si tarda más de 12 s, ocultar overlay igualmente
    loadTimeout = setTimeout(hideLoading, 12000);

    // 5. Escuchar el load del iframe para ocultar el overlay
    pdfFrame.addEventListener('load', hideLoading, { once: true });

    // 6. Asignar src (después de registrar el listener)
    pdfFrame.src = src;

    pdfModal.classList.add('active');
    pdfModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  // ── CERRAR MODAL ──────────────────────────────────────────
  function closePdfModal() {
    pdfModal.classList.remove('active');
    pdfModal.setAttribute('aria-hidden', 'true');
    pdfFrame.src = '';
    hideLoading();

    const worksModal = document.getElementById('works-modal');
    if (!worksModal?.classList.contains('wmodal--open')) {
      document.body.style.overflow = '';
    }
  }

  modalClose?.addEventListener('click', closePdfModal);
  pdfModal.addEventListener('click', e => {
    if (e.target === pdfModal) closePdfModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && pdfModal.classList.contains('active')) {
      closePdfModal();
    }
  });

  // ── ESTILOS ───────────────────────────────────────────────
  if (!document.querySelector('#modal-pdf-styles')) {
    const style = document.createElement('style');
    style.id = 'modal-pdf-styles';
    style.textContent = `
      @keyframes modalFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to   { opacity: 1; transform: scale(1); }
      }

      /* Viewer necesita position relative para que el overlay se superponga */
      .modal__viewer { position: relative; }

      /* Overlay */
      .modal__loading {
        position: absolute; inset: 0; z-index: 10;
        background: #EFF6FF;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity 0.2s ease;
      }
      .modal__loading--visible {
        opacity: 1; pointer-events: auto;
      }

      .modal__loading-inner {
        display: flex; flex-direction: column;
        align-items: center; gap: 1rem;
      }

      /* Spinner */
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .modal__spinner {
        width: 40px; height: 40px; border-radius: 50%;
        border: 3px solid rgba(37,99,235,0.15);
        border-top-color: #2563EB;
        animation: spin 0.75s linear infinite;
      }

      .modal__loading-text {
        font-size: 0.85rem; font-weight: 500;
        color: #64748B; margin: 0;
        font-family: var(--font, 'DM Sans', sans-serif);
      }

      /* Puntos animados "Cargando..." */
      @keyframes dots {
        0%   { content: '.';   }
        33%  { content: '..';  }
        66%  { content: '...'; }
        100% { content: '';    }
      }
      .modal__loading-dots::after {
        content: '';
        animation: dots 1.4s steps(1) infinite;
      }
    `;
    document.head.appendChild(style);
  }

  // ── BOTONES .open-preview ─────────────────────────────────
  document.querySelectorAll('.open-preview').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.dataset.title || 'Documento';
      const file  = btn.dataset.file  || '';
      if (file) window.openPdfModal(title, file);
    });
  });
}