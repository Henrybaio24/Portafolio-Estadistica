// js/modules/header.js — Header scroll, menú móvil, active links, typewriter

function initHeader() {
  const header = document.querySelector('.header');
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');
  const navOverlay = document.getElementById('nav-overlay');
  const navLinks = document.querySelectorAll('.nav__menu a');

  function updateNavbar() {
    if (!header) return;
    const isScrolled = window.scrollY > 50;
    header.classList.toggle('scrolled', isScrolled);
    document.body.classList.toggle('has-scrolled', isScrolled);
  }

  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });

  function openMobileMenu() {
    if (!navMenu || !navOverlay) return;
    navMenu.classList.add('open');
    navOverlay.classList.add('visible');
    if (navToggle) navToggle.textContent = '✕';
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!navMenu || !navOverlay) return;
    navMenu.classList.remove('open');
    navOverlay.classList.remove('visible');
    if (navToggle) navToggle.textContent = '☰';
    if (!document.getElementById('pdf-modal')?.classList.contains('active') &&
        !document.getElementById('works-modal')?.classList.contains('wmodal--open')) {
      document.body.style.overflow = '';
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    });
  }

  if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  const sectionMap = [];
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href?.startsWith('#')) {
      const el = document.getElementById(href.replace('#', ''));
      if (el) sectionMap.push({ link, el });
    }
  });

  function updateActiveLink() {
    const scrollMid = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    let minDistance = Infinity;

    sectionMap.forEach(item => {
      const sectionTop = item.el.offsetTop;
      const distance = Math.abs(sectionTop - scrollMid);
      if (distance < minDistance && sectionTop <= scrollMid + 100) {
        minDistance = distance;
        current = item;
      }
    });

    navLinks.forEach(l => l.classList.remove('active'));
    if (current) {
      current.link.classList.add('active');
      current.link.style.transform = 'scale(1.02)';
      setTimeout(() => { if (current.link) current.link.style.transform = ''; }, 200);
    }
  }

  updateActiveLink();
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .silabo__unit-card').forEach(el => revealObs.observe(el));

  const coverTitle = document.getElementById('cover-title');
  if (coverTitle) {
    const text = 'Pedagogia de las Ciencias Experimentales — Informática';
    let i = 0;
    
    const cursor = document.createElement('span');
    cursor.className = 'h2-cursor';
    coverTitle.appendChild(cursor);
    
    setTimeout(() => {
      const iv = setInterval(() => {
        coverTitle.textContent = text.slice(0, ++i);
        coverTitle.appendChild(cursor);
        if (i >= text.length) clearInterval(iv);
      }, 32);
    }, 400);
  }
}
