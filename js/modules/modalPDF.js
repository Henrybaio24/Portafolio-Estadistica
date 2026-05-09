// js/modules/modalPdf.js — Visor de documentos con detección de tipo

function initModalPdf() {
  const pdfModal = document.getElementById('pdf-modal');
  const pdfFrame = document.getElementById('pdf-frame');
  const modalTitle = document.getElementById('modal-title');
  const modalClose = document.getElementById('modal-close');

  if (!pdfModal) return;

  window.openPdfModal = function(title, file) {
    // Detectar tipo
    const isExcel = /\.(xlsx|xls|xlsm)$/i.test(file) || file.includes('excel');
    const isPDF = /\.pdf$/i.test(file) ||
                  file.includes('drive.google.com/file') ||
                  file.includes('/preview');
    const isWeb = !isExcel && !isPDF;

    // Si es web, abrir en nueva pestaña
    if (isWeb) {
      window.open(file, '_blank', 'noopener,noreferrer');
      return;
    }

    // PDF o Excel → modal
    modalTitle.textContent = title;

    if (isExcel) {
      const officeViewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file)}`;
      pdfFrame.src = officeViewer;
    } else {
      pdfFrame.src = file;
    }

    pdfModal.classList.add('active');
    pdfModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  function closePdfModal() {
    pdfModal.classList.remove('active');
    pdfModal.setAttribute('aria-hidden', 'true');
    pdfFrame.src = '';

    const worksModal = document.getElementById('works-modal');
    if (!worksModal?.classList.contains('wmodal--open')) {
      document.body.style.overflow = '';
    }
  }

  // Event listeners
  modalClose?.addEventListener('click', closePdfModal);

  pdfModal.addEventListener('click', e => {
    if (e.target === pdfModal) closePdfModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && pdfModal.classList.contains('active')) {
      closePdfModal();
    }
  });

  // Animación CSS dinámica
  if (!document.querySelector('#modal-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'modal-animation-styles';
    style.textContent = `
      @keyframes modalFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to   { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.querySelectorAll('.open-preview').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.dataset.title || 'Documento';
      const file  = btn.dataset.file  || '';
      if (file) window.openPdfModal(title, file);
    });
  });
}