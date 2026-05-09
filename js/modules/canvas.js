// js/modules/canvas.js — Canvas de partículas y barras en portada

function initCanvas() {
  const canvas = document.getElementById('cover-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
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
    targetH: Math.random() * 0.28 + 0.08,
    currentH: Math.random() * 0.1,
    speed: Math.random() * 0.004 + 0.002,
    direction: 1,
    alpha: Math.random() * 0.07 + 0.03
  }));

  function drawBars(w, h) {
    const gap = w / (BAR_COUNT + 1);
    const maxH = h * 0.55;

    bars.forEach((bar, i) => {
      bar.currentH += bar.speed * bar.direction;
      if (bar.currentH >= bar.targetH) bar.direction = -1;
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
      const mx = (pts[i - 1].x + pts[i].x) / 2;
      const my = (pts[i - 1].y + pts[i].y) / 2;
      ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
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
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = w;
      if (d.x > w) d.x = 0;
      if (d.y < 0) d.y = h;
      if (d.y > h) d.y = 0;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${d.alpha})`;
      ctx.fill();
    });

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - dist / 110)})`;
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
}