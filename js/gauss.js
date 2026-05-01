(function () {
  const canvas = document.getElementById('gauss-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const W = canvas.width;
  const H = canvas.height;

  // Configuración
  const MU = W / 2;
  const SIGMA_BASE = 52;
  let sigma = SIGMA_BASE;
  let sigmaDir = 0.12;
  let fillProgress = 0;
  let fillDir = 0.008;
  let glowPhase = 0;
  let particles = [];
  let frame = 0;

  // Partículas
  function initParticles() {
    particles = [];
    for (let i = 0; i < 18; i++) {
      spawnParticle();
    }
  }

  function spawnParticle() {
    const x = MU + (Math.random() - 0.5) * sigma * 3.5;
    const t = (x - MU) / sigma;
    const yBase = H - 18 - gaussY(t) * (H - 40);
    particles.push({
      x,
      y: yBase + Math.random() * 10,
      vy: -(0.2 + Math.random() * 0.5),
      alpha: 0.4 + Math.random() * 0.5,
      r: 0.8 + Math.random() * 1.4,
      life: 0,
      maxLife: 90 + Math.random() * 80,
    });
  }

  function gaussY(t) {
    return Math.exp(-0.5 * t * t);
  }

  function getCurvePoints(sig) {
    const pts = [];
    for (let x = 0; x <= W; x += 2) {
      const t = (x - MU) / sig;
      const y = H - 18 - gaussY(t) * (H - 40);
      pts.push({ x, y });
    }
    return pts;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Sigma oscila suavemente
    sigma += sigmaDir;
    if (sigma > 62 || sigma < 42) sigmaDir *= -1;

    // Fill progress oscila
    fillProgress += fillDir;
    if (fillProgress > 1 || fillProgress < 0.3) fillDir *= -1;

    glowPhase += 0.03;
    frame++;

    const pts = getCurvePoints(sigma);

    // ── Región ±1σ rellena ──
    const x1L = MU - sigma;
    const x1R = MU + sigma;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1L, H - 18);
    for (let x = x1L; x <= x1R; x += 2) {
      const t = (x - MU) / sigma;
      const y = H - 18 - gaussY(t) * (H - 40);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(x1R, H - 18);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
    fillGrad.addColorStop(0, `rgba(37,99,235,${0.28 * fillProgress})`);
    fillGrad.addColorStop(1, `rgba(37,99,235,0.02)`);
    ctx.fillStyle = fillGrad;
    ctx.fill();
    ctx.restore();

    // ── Área total bajo la curva ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, H - 18);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, H - 18);
    ctx.closePath();
    const areaGrad = ctx.createLinearGradient(0, 0, 0, H);
    areaGrad.addColorStop(0, 'rgba(37,99,235,0.10)');
    areaGrad.addColorStop(1, 'rgba(37,99,235,0.01)');
    ctx.fillStyle = areaGrad;
    ctx.fill();
    ctx.restore();

    // ── Línea base ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(10, H - 18);
    ctx.lineTo(W - 10, H - 18);
    ctx.strokeStyle = 'rgba(96,165,250,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // ── Líneas σ punteadas ──
    const sigmaLines = [
      { x: MU,          label: 'μ',   alpha: 0.7, color: '96,165,250' },
      { x: MU - sigma,  label: '-σ',  alpha: 0.4, color: '96,165,250' },
      { x: MU + sigma,  label: '+σ',  alpha: 0.4, color: '96,165,250' },
      { x: MU - 2*sigma,label: '-2σ', alpha: 0.2, color: '96,165,250' },
      { x: MU + 2*sigma,label: '+2σ', alpha: 0.2, color: '96,165,250' },
    ];

    sigmaLines.forEach(({ x, label, alpha, color }) => {
      if (x < 5 || x > W - 5) return;
      const t = (x - MU) / sigma;
      const yTop = H - 18 - gaussY(t) * (H - 40) - 4;

      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(x, yTop);
      ctx.lineTo(x, H - 18);
      ctx.strokeStyle = `rgba(${color},${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Etiqueta
      ctx.save();
      ctx.font = `500 9px "JetBrains Mono", monospace`;
      ctx.fillStyle = `rgba(147,197,253,${alpha + 0.1})`;
      ctx.textAlign = 'center';
      ctx.fillText(label, x, H - 4);
      ctx.restore();
    });

    // ── Curva principal con glow ──
    const glowAlpha = 0.4 + Math.sin(glowPhase) * 0.3;
    ctx.save();
    ctx.shadowColor = `rgba(96,165,250,${glowAlpha})`;
    ctx.shadowBlur = 8 + Math.sin(glowPhase) * 4;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 2; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const strokeGrad = ctx.createLinearGradient(0, 0, W, 0);
    strokeGrad.addColorStop(0,   'rgba(96,165,250,0.15)');
    strokeGrad.addColorStop(0.5, 'rgba(96,165,250,0.95)');
    strokeGrad.addColorStop(1,   'rgba(96,165,250,0.15)');
    ctx.strokeStyle = strokeGrad;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // ── Badge 68.2% ──
    const badgeY = H - 18 - gaussY(0) * (H - 40) * 0.45;
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, MU - 30, badgeY - 10, 60, 20, 10);
    ctx.fillStyle = 'rgba(37,99,235,0.3)';
    ctx.fill();
    ctx.strokeStyle = `rgba(96,165,250,${0.5 + Math.sin(glowPhase) * 0.2})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = `600 9px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(147,197,253,0.95)';
    ctx.textAlign = 'center';
    ctx.fillText('68.2%', MU, badgeY + 4);
    ctx.restore();

    // ── Punto pico latiendo ──
    const peakY = H - 18 - gaussY(0) * (H - 40);
    const peakR = 3 + Math.sin(glowPhase * 1.5) * 1.2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(MU, peakY, peakR + 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(96,165,250,${0.12 + Math.sin(glowPhase) * 0.08})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(MU, peakY, peakR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(96,165,250,${0.8 + Math.sin(glowPhase) * 0.2})`;
    ctx.shadowColor = 'rgba(96,165,250,0.8)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();

    // ── Partículas ──
    particles.forEach((p, i) => {
      p.y += p.vy;
      p.life++;
      const lifeRatio = p.life / p.maxLife;
      const a = p.alpha * (1 - lifeRatio);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(147,197,253,${a})`;
      ctx.fill();
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
        spawnParticle();
      }
    });

    requestAnimationFrame(draw);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  initParticles();
  draw();
})();