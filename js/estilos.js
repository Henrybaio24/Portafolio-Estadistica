(function() {
  const el = document.getElementById('cover-title');
  const text = 'Pedagogia de las Ciencias Experimentales — Informática';
  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 'h2-cursor';
  el.appendChild(cursor);
  setTimeout(function() {
    const iv = setInterval(function() {
      el.textContent = text.slice(0, ++i);
      el.appendChild(cursor);
      if (i >= text.length) clearInterval(iv);
    }, 32);
  }, 400);
})();