/* Premium v2 · luz que sigue al cursor en tarjetas.
   Solo en dispositivos con ratón y sin preferencia de movimiento reducido. */
(function () {
  var fino = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  var calma = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fino || calma) return;
  var sel = '.case, .growth-choices button, .growth-life-topics article, .ci-btn, .stats > *';
  document.querySelectorAll(sel).forEach(function (el) {
    if (el.querySelector(':scope > .wp-luz')) return;
    var luz = document.createElement('span');
    luz.className = 'wp-luz';
    luz.setAttribute('aria-hidden', 'true');
    el.classList.add('wp-luz-host');
    el.appendChild(luz);
    var pendiente = 0;
    el.addEventListener('pointermove', function (e) {
      if (pendiente) return;
      pendiente = requestAnimationFrame(function () {
        pendiente = 0;
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    }, { passive: true });
  });
})();
