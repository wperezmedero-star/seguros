/* Entrada de marca v6 — «Ensamblaje de precisión».
   El WP aprobado se separa en sus 5 trazos reales (V, diagonales, rombo, panza y fuste de la P),
   cada pieza con grosor dorado en 3D. Las piezas viajan por guías de plano técnico, encajan,
   el ensamblaje destella, un brillo recorre el oro y el logo vuela a su sitio en el encabezado.
   Al encajar se muestra la imagen original intacta (wp-card-transparent-768.webp).
   Solo se ejecuta si el script de <head> activó .brand-entrance-active (1 vez por sesión,
   sin reducir movimiento, sin transición interna). Cualquier toque, tecla o rueda la salta. */
(function () {
  var H = document.documentElement;
  if (!H.classList.contains('brand-entrance-active')) return;
  var root = document.querySelector('.brand-entrance');
  if (!root) return;
  var sym = root.querySelector('.brand-entrance__symbol');
  var fin = root.querySelector('.brand-entrance__final');
  var lockup = root.querySelector('.brand-entrance__lockup');
  if (!sym || !fin || !root.animate) return; // sin WAAPI: queda el respaldo CSS

  root.style.animation = 'none'; // el JS toma el control del respaldo CSS
  root.classList.add('is-js');

  var ATLAS = 'assets/brand/wp-piezas.webp';
  var AW = 1310, AH = 948;
  // x,y,w,h: caja de la pieza en el lienzo 768; ax/ey: posición en el atlas (frente arriba, canto abajo)
  var P = [
    { n: 'v',       x: 11,  y: 193, w: 376, h: 435, ax: 0,    ey: 477, from: [-150,  40,  70, 0, 30, -9],  d: 460, z: 1 },
    { n: 'diag',    x: 255, y: 126, w: 296, h: 471, ax: 382,  ey: 477, from: [ -30,-150, -90, 26, 0, 5],  d: 360, z: 0 },
    { n: 'diamond', x: 320, y: 360, w: 153, h: 285, ax: 684,  ey: 477, from: [ -60, 165, 170, 0, -34, -14], d: 620, z: 3 },
    { n: 'bowl',    x: 545, y: 132, w: 223, h: 344, ax: 843,  ey: 477, from: [ 170, -95, -50, 0, -30, 11], d: 290, z: 1 },
    { n: 'stem',    x: 431, y: 261, w: 232, h: 403, ax: 1072, ey: 477, from: [  95, 110,  40, -20, 0, 3], d: 220, z: 2 }
  ];
  // Puntos de unión (lienzo 768) de donde saltan las chispas al encajar
  var SEAMS = [[352, 430], [400, 520], [462, 530], [505, 455], [548, 150], [470, 610], [330, 470], [600, 300]];

  var S = sym.offsetWidth || 320;
  var u = S / 768;
  var vw = window.innerWidth || 1000;
  var spread = Math.max(0.58, Math.min(1, vw / 760)) * (S / 350);
  var DEPTH = Math.round(S * 0.05);      // grosor del oro
  var LAYERS = vw < 600 ? 7 : 9;
  var timers = [], anims = [], done = false;

  function pct(v, of) { return (v / of * 100) + '%'; }
  function el(tag, cls, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function run(node, kf, opt) { var a = node.animate(kf, opt); anims.push(a); return a; }

  /* ---------- Construcción ---------- */
  var stage = el('div', 'be-stage');
  var blueprint = el('div', 'be-blueprint', sym);
  sym.insertBefore(stage, fin);
  var glow = el('div', 'be-glow', sym);
  var ring = el('div', 'be-ring', sym);
  var sheen = el('div', 'be-sheen', sym);
  sym.insertBefore(glow, stage);

  // Plano técnico: marcas de registro, eje central y guías por pieza
  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '-120 -120 1008 1008');
  svg.setAttribute('aria-hidden', 'true');
  blueprint.appendChild(svg);
  function line(x1, y1, x2, y2, cls) {
    var l = document.createElementNS(svgNS, 'path');
    l.setAttribute('d', 'M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2);
    l.setAttribute('class', cls || ''); l.setAttribute('pathLength', '1');
    svg.appendChild(l); return l;
  }
  var guides = [];
  [[-40, -40, 1, 1], [808, -40, -1, 1], [-40, 808, 1, -1], [808, 808, -1, -1]].forEach(function (c) {
    guides.push(line(c[0], c[1] + 46 * c[3], c[0], c[1], 'be-mark'));
    guides.push(line(c[0], c[1], c[0] + 46 * c[2], c[1], 'be-mark'));
  });
  guides.push(line(384, 330, 384, 438, 'be-cross')); guides.push(line(330, 384, 438, 384, 'be-cross'));

  var built = P.map(function (p, i) {
    var cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    var fx = p.from[0] * spread / u, fy = p.from[1] * spread / u; // guía en unidades del lienzo
    guides.push(line(cx, cy, cx + fx * 1.15, cy + fy * 1.15, 'be-guide'));
    var t = document.createElementNS(svgNS, 'text');
    t.setAttribute('x', cx + fx * 1.22); t.setAttribute('y', cy + fy * 1.22);
    t.setAttribute('class', 'be-num'); t.textContent = '0' + (i + 1);
    svg.appendChild(t); guides.push(t);

    var piece = el('div', 'be-piece', stage);
    piece.style.left = pct(p.x, 768); piece.style.top = pct(p.y, 768);
    piece.style.width = pct(p.w, 768); piece.style.height = pct(p.h, 768);
    piece.style.zIndex = p.z;
    var bgSize = pct(AW, p.w) + ' ' + pct(AH, p.h);
    var layers = [];
    for (var k = LAYERS; k >= 0; k--) {
      var L = el('div', 'be-layer' + (k ? ' be-edge' : ' be-front'), piece);
      L.style.backgroundImage = 'url(' + ATLAS + ')';
      L.style.backgroundSize = bgSize;
      var ry = k ? p.ey : 0;
      L.style.backgroundPosition = pct(p.ax, AW - p.w) + ' ' + pct(ry, AH - p.h);
      L.style.transform = 'translateZ(' + (-k * DEPTH / LAYERS).toFixed(2) + 'px)';
      layers.push(L);
    }
    return { p: p, el: piece, layers: layers };
  });

  var sparks = [];
  for (var s = 0; s < 18; s++) sparks.push(el('i', 'be-spark', sym));

  /* ---------- Coreografía ---------- */
  function fromT(p) {
    var f = p.from, k = spread;
    return 'translate3d(' + (f[0] * k).toFixed(1) + 'px,' + (f[1] * k).toFixed(1) + 'px,' + (f[2] * k).toFixed(1) + 'px) rotateX(' + f[3] + 'deg) rotateY(' + f[4] + 'deg) rotateZ(' + f[5] + 'deg)';
  }
  var ASSEMBLE = 820, LOCK = 0;
  built.forEach(function (b) { LOCK = Math.max(LOCK, b.p.d + ASSEMBLE); });
  var FLY = LOCK + 980;

  function start() {
    if (done) return;
    // Reprograma la cascada del hero para que empiece cuando se levanta la cortina
    var now = (window.performance && performance.now()) || 0;
    H.style.setProperty('--hero-base', ((now + FLY + 60) / 1000).toFixed(2) + 's');
    fin.style.opacity = '0';
    root.classList.add('is-running');

    // Cámara: la escena gira de 3/4 a frente mientras todo encaja
    run(stage, [
      { transform: 'rotateX(17deg) rotateY(-26deg) scale(.9)' },
      { transform: 'rotateX(0deg) rotateY(0deg) scale(1)' }
    ], { duration: LOCK + 40, easing: 'cubic-bezier(.25,.6,.2,1)', fill: 'both' });

    // Plano técnico: se dibuja y se retira antes del encaje
    guides.forEach(function (g, i) {
      var isText = g.tagName.toLowerCase() === 'text';
      run(g, isText
        ? [{ opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: 1, offset: .7 }, { opacity: 0 }]
        : [{ strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, offset: .3 }, { strokeDashoffset: 0, opacity: 1, offset: .72 }, { strokeDashoffset: 0, opacity: 0 }],
        { duration: LOCK, delay: 40 + i * 14, easing: 'ease-out', fill: 'both' });
    });

    built.forEach(function (b, i) {
      var T0 = fromT(b.p);
      b.layers.forEach(function (L) {
        run(L, [{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: i * 55, easing: 'ease-out', fill: 'both' });
      });
      // Flota levemente, luego viaja por su guía y encaja con un leve asentamiento
      run(b.el, [
        { transform: T0, offset: 0 },
        { transform: T0.replace(/translate3d\(([^,]+),([^,]+),/, function (m, a, c) { return 'translate3d(' + (parseFloat(a) * 1.04) + 'px,' + (parseFloat(c) * 1.04) + 'px,'; }), offset: b.p.d / (b.p.d + ASSEMBLE) * .9, easing: 'cubic-bezier(.5,0,.15,1)' },
        { transform: 'translate3d(0,0,' + (-DEPTH * .35).toFixed(1) + 'px) rotateX(0) rotateY(0) rotateZ(0)', offset: .965, easing: 'cubic-bezier(.3,0,.3,1)' },
        { transform: 'translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0)', offset: 1 }
      ], { duration: b.p.d + ASSEMBLE, easing: 'linear', fill: 'both' });
    });

    later(lock, LOCK);
    later(wordmark, LOCK + 40);
    later(fly, FLY);
  }

  function lock() {
    if (done) return;
    // Cambio a la imagen original exacta
    fin.style.opacity = '1';
    // la pila 3D queda debajo unos cuadros más, por si el navegador tarda en pintar la imagen final
    later(function () { stage.style.visibility = 'hidden'; }, 160);
    run(fin, [{ transform: 'scale(1)' }, { transform: 'scale(1.022)', offset: .3 }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,.7,.3,1)' });
    run(glow, [{ opacity: 0, transform: 'scale(.55)' }, { opacity: .95, transform: 'scale(1)', offset: .18 }, { opacity: 0, transform: 'scale(1.35)' }], { duration: 1100, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' });
    run(ring, [{ opacity: .9, transform: 'translate(-50%,-50%) scale(.25)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(2.1)' }], { duration: 950, easing: 'cubic-bezier(.15,.75,.3,1)', fill: 'both' });
    sparks.forEach(function (sp, i) {
      var seam = SEAMS[i % SEAMS.length];
      var ang = (i * 137.5) * Math.PI / 180;
      var dist = (60 + (i * 53 % 90)) * (S / 350);
      var x0 = seam[0] * u, y0 = seam[1] * u;
      var x1 = x0 + Math.cos(ang) * dist, y1 = y0 + Math.sin(ang) * dist;
      var sz = 2 + (i % 3);
      sp.style.width = sp.style.height = sz + 'px';
      run(sp, [
        { opacity: 0, transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1)' },
        { opacity: 1, transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1.4)', offset: .06 },
        { opacity: 0, transform: 'translate(' + x1 + 'px,' + (y1 + dist * .35) + 'px) scale(.4)' }
      ], { duration: 650 + (i % 5) * 70, delay: i * 9, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'both' });
    });
    run(sheen, [{ backgroundPosition: '140% 0', opacity: 1 }, { backgroundPosition: '-40% 0', opacity: 1, offset: .92 }, { backgroundPosition: '-40% 0', opacity: 0 }], { duration: 900, delay: 160, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'both' });
  }

  function wordmark() {
    if (done) return;
    var nm = root.querySelector('.brand-entrance__name'), tg = root.querySelector('.brand-entrance__tag');
    if (nm) run(nm, [{ opacity: 0, transform: 'translateY(10px) scaleX(1.14)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
    if (tg) run(tg, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 180, easing: 'ease-out', fill: 'both' });
  }

  function headerTarget() {
    var img = document.querySelector('.header .wp-brand-mark img');
    if (!img) return null;
    var r = img.getBoundingClientRect();
    if (!r.width || r.bottom < 0 || r.top > window.innerHeight) return null;
    var side = Math.min(r.width, r.height); // object-fit: contain sobre un cuadrado
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, s: side };
  }

  function fly() {
    if (done) return;
    var words = root.querySelectorAll('.brand-entrance__name,.brand-entrance__tag');
    for (var i = 0; i < words.length; i++) run(words[i], [{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-in', fill: 'forwards' });
    var bg = root.querySelector('.brand-entrance__bg');
    var r = fin.getBoundingClientRect(), t = headerTarget();
    var D = 660;
    if (t) {
      var dx = t.x - (r.left + r.width / 2), dy = t.y - (r.top + r.height / 2), sc = t.s / r.width;
      run(sym, [{ transform: 'none' }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')' }], { duration: D, delay: 120, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
      run(bg, [{ opacity: 1 }, { opacity: 0 }], { duration: D - 60, delay: 200, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      later(function () { run(root, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }); }, D + 100);
      later(finish, D + 260);
    } else {
      run(sym, [{ transform: 'none', opacity: 1 }, { transform: 'scale(.86)', opacity: 0 }], { duration: 420, delay: 80, easing: 'ease-in', fill: 'forwards' });
      run(bg, [{ opacity: 1 }, { opacity: 0 }], { duration: 420, delay: 160, fill: 'forwards' });
      later(finish, 600);
    }
  }

  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    removeSkip();
    H.classList.remove('brand-entrance-active');
    anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
    [stage, blueprint, glow, ring, sheen].concat(sparks).forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    root.classList.remove('is-js', 'is-running');
  }

  function skip() {
    if (done) return;
    timers.forEach(clearTimeout);
    var now = (window.performance && performance.now()) || 0;
    H.style.setProperty('--hero-base', ((now + 120) / 1000).toFixed(2) + 's');
    run(root, [{ opacity: getComputedStyle(root).opacity }, { opacity: 0 }], { duration: 240, easing: 'ease-out', fill: 'forwards' });
    timers = [];
    setTimeout(finish, 260);
  }
  var EV = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
  function removeSkip() { EV.forEach(function (e) { window.removeEventListener(e, skip, true); }); }
  EV.forEach(function (e) { window.addEventListener(e, skip, { capture: true, passive: true }); });

  /* ---------- Arranque: espera a que el atlas esté decodificado ---------- */
  try { if (fin.decode) fin.decode().catch(function () {}); } catch (e) {}
  var img = new Image();
  var started = false;
  function go() { if (started) return; started = true; requestAnimationFrame(function () { requestAnimationFrame(start); }); }
  img.onload = function () { if (img.decode) img.decode().then(go, go); else go(); };
  img.onerror = function () { started = true; fin.style.opacity = '1'; later(fly, 500); };
  img.src = ATLAS;
  // Si la red tarda demasiado, no dejamos al visitante esperando
  later(function () { if (!started) { started = true; fin.style.opacity = '1'; later(fly, 350); } }, 1400);
})();
