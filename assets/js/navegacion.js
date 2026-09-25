/* ═══════════ NAVEGACIÓN ENTRE PÁGINAS · TRANSICIÓN DEL RAYO ═══════════
   Al tocar un enlace a otra página del sitio, una banda azul marino con el
   filo dorado en forma de rayo cruza la pantalla y la cubre; la página nueva
   aparece cuando la banda sigue su camino. Todo dura menos de un segundo.
   Con "reducir movimiento" activado en el teléfono, se navega sin animación. */
(() => {
  'use strict';
  const PAGINAS = {"index": "./", "proteccion": "proteccion.html", "calculadoras": "calculadoras.html", "sobre-mi": "sobre-mi.html", "preguntas": "preguntas.html"};
  const SECCIONES = {"top": "index", "panel": "index", "pilares": "index", "alcance": "index", "arquitectura": "proteccion", "recursos": "proteccion", "calculadoras": "calculadoras", "cotizar": "calculadoras", "agenda": "calculadoras", "sobre-mi": "sobre-mi", "preguntas": "preguntas"};
  const html = document.documentElement;
  const reducir = matchMedia('(prefers-reduced-motion: reduce)');
  let saliendo = false, pendiente = null, relojPendiente = 0;

  /* Entrada: el <head> ya puso .rayo-cubre; al terminar de revelar, se limpia. */
  if (html.classList.contains('rayo-cubre')) {
    const banda = document.querySelector('.rayo__banda');
    const limpiar = () => html.classList.remove('rayo-cubre');
    if (banda) banda.addEventListener('animationend', limpiar, { once: true });
    setTimeout(limpiar, 1400);
  }

  /* Al volver con el botón "atrás", el navegador puede restaurar la página tal
     como quedó (con la banda cubriéndola). Se descubre de inmediato. */
  addEventListener('pageshow', e => {
    if (e.persisted) { html.classList.remove('rayo-sale', 'rayo-cubre'); saliendo = false; }
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

  function navegar(url){
    if (saliendo) return true;
    /* Con la voz activa, el primer toque avisa y el segundo confirma. */
    if (vozActiva() && pendiente !== url) {
      pendiente = url; avisarVoz();
      clearTimeout(relojPendiente);
      relojPendiente = setTimeout(() => { pendiente = null; }, 6000);
      return true;
    }
    saliendo = true;
    document.body.classList.remove('is-locked');
    if (reducir.matches) { location.href = url; return true; }
    try { sessionStorage.setItem('wps-rayo', '1'); } catch (_) {}
    html.classList.remove('rayo-cubre');
    html.classList.add('rayo-sale');
    let ido = false;
    const ir = () => { if (!ido) { ido = true; location.href = url; } };
    const banda = document.querySelector('.rayo__banda');
    if (banda) banda.addEventListener('animationend', ir, { once: true });
    setTimeout(ir, 420);
    return true;
  }

  /* Recibe "#seccion" y, si esa sección vive en otra página, va hacia allá. */
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
      /* Enlace a esta misma página: solo desplazarse. */
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
