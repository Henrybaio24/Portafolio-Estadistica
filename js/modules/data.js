// js/modules/data.js — Fetch, parse CSV, cache, loader

const SHEET_ID = '2PACX-1vQZBQQJF6phbRXNRkdMqDYdhgB9JaXTmMuT-ACo79YJRotfLyxiPsXABuLxLSlFybhlmEpYil4YuNLG';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=0&single=true&output=csv`;

const CACHE_KEY = 'portafolio_data';
const CACHE_TIME = 3600000; // 1 hora

function parseCSV(text) {
  const [headerLine, ...rows] = text.trim().split('\n');
  const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return rows.map(row => {
    const values = [];
    let current = '', inQuotes = false;

    for (const char of row) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

function getCachedData() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_TIME) return null;

  return data;
}

function setCachedData(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
}

function setLoaderProgress(pct) {
  const bar = document.getElementById('loader-progress');
  if (bar) bar.style.width = pct + '%';
}

function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  loader.classList.add('loader--hidden');
  loader.addEventListener('transitionend', () => loader.remove(), { once: true });
}

async function initData() {
  setLoaderProgress(15);

  // Intentar cache primero
  const cached = getCachedData();
  if (cached) {
    setLoaderProgress(100);
    setTimeout(hideLoader, 380);
    return cached;
  }

  // Simular progreso mientras carga
  const progressSim = setInterval(() => {
    const current = parseFloat(document.getElementById('loader-progress')?.style.width || '15');
    if (current < 80) setLoaderProgress(current + Math.random() * 6);
  }, 300);

  try {
    const res = await fetch(SHEET_URL);
    setLoaderProgress(90);

    const text = await res.text();
    const works = parseCSV(text);

    setCachedData(works);
    setLoaderProgress(100);

    return works;
  } catch (e) {
    console.error('No se pudo cargar el Google Sheet:', e);
    setLoaderProgress(100);
    return [];
  } finally {
    clearInterval(progressSim);
    setTimeout(hideLoader, 380);
  }
}