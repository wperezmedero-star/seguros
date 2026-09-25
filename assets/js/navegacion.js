/* ═══════════ NAVEGACIÓN ENTRE PÁGINAS · TRANSICIONES PREMIUM ═══════════
   Tres transiciones coherentes con el contenido:
   · rayo: entrada especial a Protección
   · cristal: herramientas y calculadoras
   · suave: navegación informativa y regreso a Inicio
   No se eligen al azar: cada destino conserva una identidad predecible.
   Con "reducir movimiento" activado, se navega sin animación. */
(() => {
  'use strict';
  const PAGINAS = {"index": "./", "proteccion": "proteccion.html", "calculadoras": "calculadoras.html", "sobre-mi": "sobre-mi.html", "preguntas": "preguntas.html"};
  const SECCIONES = {"top": "index", "panel": "index", "pilares": "index", "alcance": "index", "arquitectura": "proteccion", "recursos": "proteccion", "calculadoras": "calculadoras", "cotizar": "calculadoras", "agenda": "calculadoras", "sobre-mi": "sobre-mi", "preguntas": "preguntas"};
  const html = document.documentElement;
  const reducir = matchMedia('(prefers-reduced-motion: reduce)');
  const CLASES_TRANS = ['trans-rayo','trans-cristal','trans-suave'];
  let saliendo = false, pendiente = null, relojPendiente = 0;

  function limpiarTransicion(){
    html.classList.remove('rayo-sale','rayo-cubre',...CLASES_TRANS);
  }

  if (html.classList.contains('rayo-cubre')) {
    const banda = document.querySelector('.rayo__banda');
    const limpiar = () => limpiarTransicion();
    if (banda) banda.addEventListener('animationend', limpiar, { once: true });
    setTimeout(limpiar, 1300);
  }

  addEventListener('pageshow', e => {
    if (e.persisted) { limpiarTransicion(); saliendo = false; }
  });

  function vozActiva(){
    try { return typeof R !== 'undefined' && (R.active || R.connecting); } catch (_) { return false; }
  }
  function avisarVoz(){
    const el = document.getElementById('botVoiceStatus');
    let en = false;
    try { en = typeof V !== 'undefined' && V.lang.startsWith('en'); } catch (_) {}
    if (el) el.textContent = en
      ? 'Changing pages will end the voice conversation. Tap the link again to continue.'
      : 'Si cambias de página, la conversación de voz terminará. Toca el enlace otra vez para continuar.';
  }

  function paginaDestino(url){
    let u;
    try { u = new URL(url, location.href); } catch (_) { return ''; }
    let path = u.pathname.replace(/\/+$/,'');
    if (!path || path.endsWith('/index.html')) return 'index';
    const ultimo = path.split('/').pop() || '';
    if (!ultimo || ultimo === 'index.html') return 'index';
    return ultimo.replace(/\.html$/,'');
  }

  function tipoTransicion(url){
    const destino = paginaDestino(url);
    const actual = document.body.dataset.pagina || '';
    if (destino === 'proteccion' && actual !== 'proteccion') return 'rayo';
    if (destino === 'calculadoras') return 'cristal';
    return 'suave';
  }

  function navegar(url){
    if (saliendo) return true;
    if (vozActiva() && pendiente !== url) {
      pendiente = url; avisarVoz();
      clearTimeout(relojPendiente);
      relojPendiente = setTimeout(() => { pendiente = null; }, 6000);
      return true;
    }
    saliendo = true;
    document.body.classList.remove('is-locked');
    if (reducir.matches) { location.href = url; return true; }

    const tipo = tipoTransicion(url);
    try {
      sessionStorage.setItem('wps-transicion', tipo);
      sessionStorage.removeItem('wps-rayo');
    } catch (_) {}

    limpiarTransicion();
    html.classList.add('trans-' + tipo, 'rayo-sale');

    let ido = false;
    const ir = () => { if (!ido) { ido = true; location.href = url; } };
    const banda = document.querySelector('.rayo__banda');
    if (banda) banda.addEventListener('animationend', ir, { once: true });
    const respaldo = tipo === 'rayo' ? 520 : tipo === 'cristal' ? 500 : 420;
    setTimeout(ir, respaldo);
    return true;
  }

  function irAPagina(hash){
    let id = String(hash || '').replace(/^#/, '');
    const autorizado = document.body.dataset.modo === 'autorizado';
    if (!autorizado && (id === 'cotizar' || id === 'agenda')) id = 'calculadoras';
    const destino = SECCIONES[id];
    if (!destino) return false;
    if (destino === document.body.dataset.pagina) {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: reducir.matches ? 'auto' : 'smooth', block: 'start' });
      return true;
    }
    return navegar(PAGINAS[destino] + (id === 'top' ? '' : '#' + id));
  }

  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('download')) return;
    if (a.target && a.target !== '_self') return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    let u;
    try { u = new URL(a.href, location.href); } catch (_) { return; }
    if (u.origin !== location.origin) return;
    if (!/(\.html|\/)$/.test(u.pathname)) return;
    const misma = u.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');
    if (misma && u.search === location.search) {
      e.preventDefault();
      const el = u.hash ? document.getElementById(u.hash.slice(1)) : null;
      if (el) el.scrollIntoView({ behavior: reducir.matches ? 'auto' : 'smooth', block: 'start' });
      else scrollTo({ top: 0, behavior: reducir.matches ? 'auto' : 'smooth' });
      return;
    }
    e.preventDefault();
    navegar(u.href);
  });

  window.WPS = { navegar, irAPagina };
})();
