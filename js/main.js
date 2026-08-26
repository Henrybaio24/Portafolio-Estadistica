document.addEventListener('DOMContentLoaded', async () => {

  initHeader();
  initCanvas();
  initGauss();

  const works = await initData();

  initStats(works);
  initModalPdf();
  initModalWorks(works);
  initReveal();

  hideLoader();

});