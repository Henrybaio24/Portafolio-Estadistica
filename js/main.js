// js/main.js — Orquestador: solo inicializa módulos en orden

document.addEventListener('DOMContentLoaded', async () => {

  // 1. UI base
  initHeader();
  initCanvas();
  initGauss();

  // 2. Datos
  const works = await initData();

  // 3. Estadísticas y modales (dependen de works)
  initStats(works);
  initModalPdf();
  initModalWorks(works);

  // 4. Ocultar loader
  hideLoader();

});