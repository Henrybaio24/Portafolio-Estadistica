// js/main.js — Orquestador: solo inicializa módulos en orden

document.addEventListener('DOMContentLoaded', async () => {

  initHeader();
  initCanvas();
  initGauss();

  const works = await initData();

  initStats(works);
  initModalPdf();
  initModalWorks(works);

  hideLoader();

});
