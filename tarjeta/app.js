/* William Pérez-Mederos · Tarjeta digital v3
   Sin servidor de prospectos: todo mensaje sale desde el teléfono del visitante (WhatsApp, SMS, llamada o correo). */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const PHONE = '17863548796';
const CANONICAL = 'https://williamperezseguros.com/tarjeta/';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const money = n => '$' + Math.round(n).toLocaleString('en-US');

/* ---------- Origen de la visita (QR, compartir, campañas) ---------- */
const TAGS = ['src', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
const params = new URLSearchParams(location.search);
const validTag = v => typeof v === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/.test(v) && !/^\d{7,}$/.test(v);
const cleanTags = o => Object.fromEntries(TAGS.filter(k => validTag(o[k])).map(k => [k, o[k]]));
let attribution = cleanTags(Object.fromEntries(params));
try {
  const KEY = 'wp-card-ref-v3';
  const prev = JSON.parse(sessionStorage.getItem(KEY) || 'null');
  if (!Object.keys(attribution).length && prev && Date.now() - prev.at < 1800000) attribution = cleanTags(prev.tags || {});
  if (Object.keys(attribution).length) sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), tags: attribution }));
} catch (e) {}
const SRC_LABEL = { qr: 'QR', compartir: 'Compartido', nfc: 'NFC', pwa: 'App', escritorio: 'Escritorio' };
function refNote() {
  const parts = [];
  const src = attribution.src || attribution.utm_source;
  if (src && src !== 'pwa') parts.push(SRC_LABEL[src] || src);
  if (attribution.utm_campaign) parts.push(attribution.utm_campaign);
  return parts.length ? '\n\n(Ref: ' + parts.join(' · ') + ')' : '';
}
const waURL = msg => 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg + refNote());
const smsURL = msg => 'sms:+' + PHONE + (isIOS ? '&' : '?') + 'body=' + encodeURIComponent(msg + refNote());

function track(event, extra = {}) {
  const detail = { event, ...attribution, ...extra };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(detail);
  document.dispatchEvent(new CustomEvent('card:analytics', { detail }));
}
/* Cloudflare Web Analytics opcional: se activa solo si hay token en <meta name="cf-beacon-token"> */
const cfToken = ($('meta[name="cf-beacon-token"]')?.content || '').trim();
if (/^[a-f0-9]{32}$/i.test(cfToken) && location.hostname.endsWith('williamperezseguros.com')) {
  const s = document.createElement('script');
  s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: cfToken }));
  document.head.append(s);
}

/* ---------- Toast ---------- */
function toast(text, ms = 4200) {
  const t = $('#toast'); t.textContent = text; t.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ---------- Temas ---------- */
const S = {
  orientacion: { name: 'orientación', label: 'Orientación personal', title: 'Una conversación clara, sin compromiso.', text: 'Cuénteme su situación y le explico qué opciones tiene sentido revisar, en español y a su ritmo.', note: 'La primera conversación no cuesta nada.', cta: 'Escribirme por WhatsApp', msg: 'Hola William. Vi su tarjeta digital y quisiera que me explique mis opciones.' },
  vida: { name: 'Vida', label: 'Seguro de vida', title: 'Pensar en ellos también es cuidar de usted.', text: 'Hablemos de las personas que dependen de usted y de cómo protegerlas si usted llegara a faltar.', note: 'Un buen comienzo: la calculadora DIME, más abajo.', cta: 'Hablar sobre Vida', msg: 'Hola William. Vi su tarjeta digital y quisiera revisar opciones de seguro de vida.' },
  salud: { name: 'Salud', label: 'Cobertura de salud', title: 'Su salud merece una conversación clara.', text: 'Revisemos sus preguntas sobre cobertura médica y qué conviene considerar antes de elegir.', note: 'Empecemos por lo que es importante para usted.', cta: 'Hablar sobre Salud', msg: 'Hola William. Vi su tarjeta digital y quisiera información sobre opciones de cobertura de salud.' },
  medicare: { name: 'Medicare', label: 'Orientación sobre Medicare', title: 'Entender sus opciones. Decidir con calma.', text: 'Le explico las partes A, B, C y D en español, con espacio para todas sus preguntas.', note: 'Orientación educativa. No estoy afiliado a Medicare ni a los CMS.', cta: 'Hablar sobre Medicare', msg: 'Hola William. Vi su tarjeta digital y quisiera orientación sobre Medicare.' },
  retiro: { name: 'Retiro', label: 'Retiro y anualidades', title: 'Su próximo capítulo empieza con claridad.', text: 'Conversemos sobre sus objetivos para el retiro y sobre cómo funcionan las anualidades y sus condiciones.', note: 'Primero sus objetivos. Después, las opciones.', cta: 'Hablar sobre Retiro', msg: 'Hola William. Vi su tarjeta digital y quisiera conversar sobre opciones para mi retiro.' },
  accidentes: { name: 'Accidentes', label: 'Protección ante accidentes', title: 'Si algo pasa, que no le tome desprevenido.', text: 'Revisemos la protección ante accidentes según su trabajo, su día a día y su familia.', note: 'Primero entender su rutina. Después, las opciones.', cta: 'Hablar sobre Accidentes', msg: 'Hola William. Vi su tarjeta digital y quisiera información sobre protección ante accidentes.' }
};
let selected = Object.hasOwn(S, params.get('interes')) ? params.get('interes') : 'orientacion';

function updateWA() {
  const svc = S[selected];
  $$('[data-wa="context"]').forEach(a => { a.href = waURL(svc.msg); a.dataset.service = selected; });
  $('#pWaLabel').textContent = svc.cta;
  $('#dockContext').textContent = selected === 'orientacion' ? 'Hablemos' : 'Sobre ' + svc.name;
  $('#cbTopic').value = selected;
}
function selectService(key, fromUser) {
  selected = key;
  $$('.tile[data-service]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.service === key)));
  const svc = S[key];
  $('#pLabel').textContent = svc.label; $('#pTitle').textContent = svc.title;
  $('#pText').textContent = svc.text; $('#pNote span').textContent = svc.note;
  const copy = $('.panel-copy'); copy.classList.remove('changed'); void copy.offsetWidth; copy.classList.add('changed');
  updateWA();
  if (fromUser) {
    track('service_selected', { service: key });
    const r = $('#panel').getBoundingClientRect();
    if (r.top > innerHeight * .62 || r.bottom < 0) $('#panel').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
}
$$('.tile[data-service]').forEach(b => b.addEventListener('click', () => selectService(b.dataset.service, true)));
document.addEventListener('click', e => {
  const wa = e.target.closest('a[href^="https://wa.me"]');
  if (wa) track('whatsapp_click', { service: wa.dataset.service || selected, placement: wa.dataset.placement || wa.id || 'otro' });
  const call = e.target.closest('a[href^="tel:"]');
  if (call) track('phone_click', { placement: call.dataset.call || 'otro' });
  if (e.target.closest('a[href^="mailto:"]')) track('email_click');
});

/* ---------- Diálogos ---------- */
function openSheet(id) { const d = $('#' + id); d._opener = document.activeElement; if (!d.open) d.showModal(); return d; }
$$('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
$$('[data-open]').forEach(b => b.addEventListener('click', () => openSheet(b.dataset.open)));
$$('dialog').forEach(d => {
  let down = false;
  const outside = e => { const r = d.getBoundingClientRect(); return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom; };
  d.addEventListener('pointerdown', e => { down = e.target === d && outside(e); });
  d.addEventListener('click', e => { if (down && e.target === d && outside(e)) d.close(); down = false; });
  d.addEventListener('close', () => { if (d._opener?.isConnected) d._opener.focus({ preventScroll: true }); });
});

/* ---------- Barra fija ---------- */
new IntersectionObserver(([en]) => { $('#dock').hidden = en.isIntersecting; }, { threshold: 0 }).observe($('.actions'));

/* ---------- Guilloché (patrón de seguridad) ---------- */
function guilloche(svg, cx, cy, scale, seed) {
  const NS = 'http://www.w3.org/2000/svg';
  const add = d => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); svg.append(p); };
  const rose = (R, r, dd, turns, rot) => {
    let d = ''; const steps = 900;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps * Math.PI * 2 * turns;
      const x = (R - r) * Math.cos(t) + dd * Math.cos((R - r) / r * t);
      const y = (R - r) * Math.sin(t) - dd * Math.sin((R - r) / r * t);
      const xr = x * Math.cos(rot) - y * Math.sin(rot), yr = x * Math.sin(rot) + y * Math.cos(rot);
      d += (i ? 'L' : 'M') + (cx + xr * scale).toFixed(1) + ' ' + (cy + yr * scale).toFixed(1);
    }
    add(d);
  };
  rose(96, 26.4, 42, 11, seed); rose(82, 22.8, 36, 11, seed + .3); rose(60, 15, 30, 4, seed + .7);
  for (let k = 0; k < 7; k++) {
    let d = '';
    for (let x = -10; x <= 350; x += 4) {
      const y = 184 + k * 5 + Math.sin(x / 17 + k * .55 + seed) * 5 + Math.sin(x / 41 + k) * 3;
      d += (x === -10 ? 'M' : 'L') + x + ' ' + y.toFixed(1);
    }
    add(d);
  }
}
guilloche($('#guilloche'), 262, 96, .92, 0);
guilloche($('#guillocheBack'), 70, 110, .95, 1.1);

/* ---------- Ondas de "escucho" ---------- */
(() => {
  const g = $('#waveBars'), h = [4, 7, 11, 8, 14, 18, 12, 20, 24, 20, 12, 18, 14, 8, 11, 7, 4];
  h.forEach((v, i) => {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('x', 4 + i * 9); r.setAttribute('y', 12 - v / 2); r.setAttribute('width', 4); r.setAttribute('height', v); r.setAttribute('rx', 2);
    r.style.setProperty('--d', Math.abs(i - 8)); g.append(r);
  });
  if (!reduced) requestAnimationFrame(() => $('.wave').classList.add('play'));
})();

/* ---------- QR ---------- */
function sharedURL(method) {
  const url = new URL(CANONICAL);
  for (const [k, v] of Object.entries(attribution)) if (k !== 'src') url.searchParams.set(k, v);
  url.searchParams.set('src', method);
  if (selected !== 'orientacion') url.searchParams.set('interes', selected);
  return url.href;
}
function drawQR(el, text, size) {
  el.replaceChildren();
  if (typeof QRCode === 'undefined') { el.textContent = 'QR no disponible'; return false; }
  new QRCode(el, { text, width: size, height: size, colorDark: '#0B1B2E', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
  $$('img,canvas', el).forEach(n => { n.setAttribute('aria-hidden', 'true'); if (n.tagName === 'IMG') n.alt = ''; });
  return true;
}
let backReady = false;
function setFlip(on) {
  if (on && !backReady) backReady = drawQR($('#backQr'), sharedURL('qr'), 300);
  $('#card3d').classList.toggle('flipped', on);
  $('#flip').setAttribute('aria-pressed', String(on));
  $('#flipLabel').textContent = on ? 'Ver el frente de la tarjeta' : 'Voltear para ver mi QR';
  $('#cardBack').setAttribute('aria-hidden', String(!on));
  $('#cardFront').setAttribute('aria-hidden', String(on));
  if (on) track('qr_open', { method: 'flip' });
}
$('#flip').addEventListener('click', () => setFlip(!$('#card3d').classList.contains('flipped')));
$('#card3d').addEventListener('click', () => setFlip(!$('#card3d').classList.contains('flipped')));
$$('[data-show-qr]').forEach(b => b.addEventListener('click', () => {
  $('.card-stage').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  setTimeout(() => setFlip(true), reduced ? 0 : 550);
}));
/* Tilt suave con el puntero (solo escritorio) */
if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
  const stage = $('.card-stage'), card = $('#card3d');
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    const base = card.classList.contains('flipped') ? 180 : 0;
    card.style.transform = `rotateY(${base + x * 10}deg) rotateX(${-y * 8}deg)`;
  });
  stage.addEventListener('pointerleave', () => card.style.removeProperty('transform'));
  $('#flip').addEventListener('click', () => card.style.removeProperty('transform'));
  card.addEventListener('click', () => card.style.removeProperty('transform'));
}
if (location.hash === '#qr') setTimeout(() => setFlip(true), 400);
if (matchMedia('(min-width:1180px)').matches) addEventListener('load', () => drawQR($('#deskQr'), sharedURL('escritorio'), 380));

/* ---------- Guardar contacto (archivo .vcf estático con foto) ---------- */
$('#guardar').addEventListener('click', () => {
  track('save_contact', { method: 'vcf' });
  if (!isIOS) setTimeout(() => toast('Si no se abre solo, abra el archivo desde Descargas para guardar el contacto.'), 900);
});

/* ---------- Compartir ---------- */
$('#compartir').addEventListener('click', async () => {
  const url = sharedURL('compartir');
  const data = { title: 'William Pérez-Mederos · Agente de seguros', text: 'Vida, Salud, Medicare y Retiro. Atención en español en Hialeah y Miami-Dade.', url };
  if (navigator.share) {
    try { await navigator.share(data); track('share_card', { method: 'native' }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  $('#shareUrl').value = url; drawQR($('#sheetQr'), sharedURL('qr'), 512); openSheet('shareSheet');
});
$('#copyUrl').addEventListener('click', async () => {
  const el = $('#shareUrl');
  try { await navigator.clipboard.writeText(el.value); toast('Enlace copiado.'); track('share_card', { method: 'clipboard' }); }
  catch { el.focus(); el.select(); toast('Mantenga pulsado el enlace y elija Copiar.'); }
});
$('#downloadQr').addEventListener('click', async () => {
  const src = $('#sheetQr canvas'); if (!src) { toast('No se pudo generar el QR.'); return; }
  try { await Promise.all([document.fonts.load('500 60px Fraunces'), document.fonts.load('400 34px Inter')]); } catch {}
  const W = 1080, H = 1320, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#F8F4EC'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#FFFFFF'; x.beginPath(); x.roundRect ? x.roundRect(110, 100, 860, 860, 48) : x.rect(110, 100, 860, 860); x.fill();
  x.imageSmoothingEnabled = false; x.drawImage(src, 160, 150, 760, 760);
  x.fillStyle = '#D2AE55'; x.fillRect(W / 2 - 60, 1010, 120, 4);
  x.textAlign = 'center'; x.fillStyle = '#0B1B2E'; x.font = '500 62px Fraunces, Georgia, serif'; x.fillText('William Pérez-Mederos', W / 2, 1100);
  x.fillStyle = '#44566B'; x.font = '400 34px Inter, sans-serif'; x.fillText('Agente de seguros · 786-354-8796', W / 2, 1160);
  x.fillText('williamperezseguros.com/tarjeta', W / 2, 1210);
  c.toBlob(b => { if (!b) return; const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = 'William-Perez-Mederos-QR.png'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 30000); });
  track('qr_download');
});

/* ---------- Guía de 30 segundos ---------- */
const G = { step: 0 };
const gSteps = $$('#gSteps > [data-step]');
const gVal = name => $$(`#guide input[name="${name}"]:checked`).map(i => i.value);
const gValid = () => [gVal('dep').length > 0, gVal('edad').length > 0, gVal('preo').length > 0][G.step] ?? true;
function gRender() {
  gSteps.forEach((el, i) => el.hidden = i !== G.step);
  $$('#guide .dots span').forEach((d, i) => d.classList.toggle('on', i <= Math.min(G.step, 2)));
  const done = G.step === 3;
  $('#gCount').textContent = done ? 'Su resultado' : `Pregunta ${G.step + 1} de 3`;
  $('#gBack').hidden = G.step === 0;
  $('#gBack').lastChild.textContent = done ? 'Volver a empezar' : 'Atrás';
  $('#gNext').hidden = done;
  $('#gNext').firstChild.textContent = G.step === 2 ? 'Ver resultado' : 'Siguiente';
  $('#gNext').disabled = !gValid();
  if (done) gResult();
}
$('#guide').addEventListener('change', e => {
  if (e.target.name === 'dep') {
    if (e.target.value === 'nadie' && e.target.checked) $$('#guide input[name="dep"]').forEach(i => { if (i !== e.target) i.checked = false; });
    else if (e.target.checked) $('#guide input[value="nadie"]').checked = false;
  }
  if (e.target.type === 'radio' && G.step === 1) { $('#gNext').disabled = false; setTimeout(() => { if (G.step === 1) { G.step = 2; gRender(); } }, reduced ? 0 : 260); return; }
  $('#gNext').disabled = !gValid();
});
$('#gNext').addEventListener('click', () => { if (!gValid()) return; G.step++; gRender(); $('#guide').scrollTo({ top: 0 }); });
$('#gBack').addEventListener('click', () => {
  if (G.step === 3) { $$('#guide input').forEach(i => i.checked = false); G.step = 0; } else G.step--;
  gRender();
});
function gResult() {
  const dep = gVal('dep'), edad = gVal('edad')[0], preo = gVal('preo');
  const t = new Set();
  const mayor = edad === 'si' || edad === 'pronto';
  if (dep.some(d => d !== 'nadie') || preo.includes('vida')) t.add('vida');
  if (mayor) t.add('medicare');
  if (preo.includes('salud') && !mayor) t.add('salud');
  if (preo.includes('retiro')) t.add('retiro');
  if (preo.includes('accidentes')) t.add('accidentes');
  if (!t.size) t.add('orientacion');
  const why = {
    vida: dep.includes('hijos') ? 'Para que sus hijos tengan respaldo si usted llegara a faltar.' : dep.includes('pareja') ? 'Para que su pareja no cargue con deudas ni gastos.' : dep.includes('padres') ? 'Para que sus padres sigan contando con su apoyo.' : 'Para que su familia no cargue con deudas ni gastos.',
    medicare: edad === 'si' ? 'Entender las partes A, B, C y D y los plazos de inscripción.' : 'Prepararse con tiempo antes de cumplir 65.',
    salud: 'Revisar opciones de cobertura médica para usted y los suyos.',
    retiro: 'Conversar sobre anualidades y cómo planificar sus ingresos futuros.',
    accidentes: 'Protección ante accidentes según su trabajo y su día a día.',
    orientacion: 'Una primera conversación para ordenar ideas, sin compromiso.'
  };
  const icon = { vida: 'i-vida', medicare: 'i-medicare', salud: 'i-salud', retiro: 'i-retiro', accidentes: 'i-accidentes', orientacion: 'i-brujula' };
  const list = $('#gList'); list.replaceChildren();
  [...t].forEach(k => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="tile-ic"><svg class="i" aria-hidden="true"><use href="#${icon[k]}"/></svg></span><div><b></b><span></span></div>`;
    $('b', li).textContent = k === 'orientacion' ? 'Orientación personal' : S[k].label;
    $('div span', li).textContent = why[k];
    list.append(li);
  });
  const names = [...t].filter(k => k !== 'orientacion').map(k => S[k].name);
  const joined = names.length > 1 ? names.slice(0, -1).join(', ') + ' y ' + names.at(-1) : names[0];
  const msg = names.length ? `Hola William. Hice la guía de su tarjeta digital y me gustaría conversar sobre: ${joined}.` : 'Hola William. Hice la guía de su tarjeta digital y me gustaría que me oriente sobre por dónde empezar.';
  $('#gWa').href = waURL(msg); $('#gWa').dataset.placement = 'guia';
  const first = [...t][0]; if (first !== 'orientacion') selectService(first, false);
  track('guide_complete', { topics: [...t].join(',') });
}
$$('[data-open-guide]').forEach(b => b.addEventListener('click', () => { G.step = 0; $$('#guide input').forEach(i => i.checked = false); gRender(); openSheet('guide'); track('guide_start'); }));

/* ---------- Calculadora DIME ---------- */
const moneyInputs = ['cD', 'cI', 'cH'].map(id => $('#' + id));
let kids = 0, calcTimer;
const parse = el => { const d = el.value.replace(/[^\d]/g, ''); return d ? Number(d) : 0; };
function calculate(emit) {
  let ok = true;
  moneyInputs.forEach(i => { const bad = parse(i) > Number(i.dataset.max); i.closest('.money').querySelector('input').setAttribute('aria-invalid', String(bad)); if (bad) ok = false; });
  $('#cError').textContent = ok ? '' : 'Use cantidades de hasta $100,000,000.';
  const [D, I, H] = moneyInputs.map(parse);
  const parts = [['Deudas', ok ? D : 0], ['Ingreso × 10 años', ok ? I * 10 : 0], ['Casa', ok ? H : 0], ['Estudios de hijos', kids * 40000], ['Gastos finales', 15000]];
  const total = parts.reduce((a, [, v]) => a + v, 0);
  $('#cTotal').textContent = money(total);
  const bar = $('#cBar'), legend = $('#cLegend');
  if (bar.children.length !== 5) { bar.replaceChildren(...parts.map(() => document.createElement('i'))); legend.replaceChildren(...parts.map(() => document.createElement('li'))); }
  parts.forEach(([label, v], k) => {
    bar.children[k].style.flexGrow = total ? v / total : 0;
    bar.children[k].style.flexBasis = '0';
    bar.children[k].hidden = v === 0;
    legend.children[k].innerHTML = '<span></span><b></b>';
    legend.children[k].firstChild.textContent = label; legend.children[k].lastChild.textContent = money(v);
  });
  $('#cWa').href = waURL(`Hola William. Usé la calculadora DIME de su tarjeta y el estimado educativo fue de ${money(total)}. Quiero revisar este resultado y entender mis opciones.`);
  $('#cWa').dataset.service = 'vida'; $('#cWa').dataset.placement = 'calculadora';
  if (emit) { clearTimeout(calcTimer); calcTimer = setTimeout(() => track('calculator_complete', { method: 'dime' }), 900); }
}
moneyInputs.forEach(i => {
  i.addEventListener('input', () => calculate(true));
  i.addEventListener('blur', () => { const n = parse(i); i.value = n ? n.toLocaleString('en-US') : ''; });
  i.addEventListener('focus', () => { const n = parse(i); i.value = n ? String(n) : ''; });
});
const setKids = n => { kids = Math.max(0, Math.min(10, n)); $('#cN').textContent = kids; calculate(true); };
$('#nMinus').addEventListener('click', () => setKids(kids - 1));
$('#nPlus').addEventListener('click', () => setKids(kids + 1));
$('#openCalc').addEventListener('click', () => { calculate(false); openSheet('calc'); track('calculator_start'); });
const SR = window.SpeechRecognition || window.webkitSpeechRecognition; let rec;
if (SR) {
  $('#voiceNote').hidden = false;
  $$('.mic').forEach(b => { b.hidden = false; b.addEventListener('click', () => {
    rec?.abort(); rec = new SR(); rec.lang = 'es-US'; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onstart = () => b.classList.add('on'); rec.onend = () => b.classList.remove('on');
    rec.onerror = () => toast('No se pudo usar el micrófono. Puede escribir la cifra.');
    rec.onresult = e => {
      const text = e.results[0][0].transcript.toLowerCase();
      let n = Number.parseFloat(text.replace(/[^0-9.,]/g, '').replace(/,/g, ''));
      if (/mill[oó]n/.test(text)) n = (n || 1) * 1e6; else if (/\bmil\b/.test(text) && (!n || n < 1000)) n = (n || 1) * 1000;
      if (Number.isFinite(n) && n >= 0) { const el = $('#' + b.dataset.voz); el.value = Math.round(n).toLocaleString('en-US'); calculate(true); }
      else toast('No entendí el número. Intente escribirlo.');
    };
    try { rec.start(); } catch { toast('El dictado no está disponible. Puede escribir la cifra.'); }
  }); });
}
$('#calc').addEventListener('close', () => rec?.abort());

/* ---------- Prefiero que me llame ---------- */
$$('[data-callback]').forEach(b => b.addEventListener('click', () => { $('#cbTopic').value = selected; $('#cbError').textContent = ''; openSheet('callback'); track('callback_open', { service: selected }); }));
$('#cbForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#cbName').value.trim().replace(/\s+/g, ' ');
  if (name.length < 2) { $('#cbError').textContent = 'Escriba su nombre para saber a quién llamo.'; $('#cbName').setAttribute('aria-invalid', 'true'); $('#cbName').focus(); return; }
  $('#cbName').removeAttribute('aria-invalid'); $('#cbError').textContent = '';
  const f = new FormData(e.target), topic = f.get('tema');
  const tema = topic === 'orientacion' ? 'mis opciones de seguro' : S[topic].name;
  const msg = `Hola William, soy ${name}. Vi su tarjeta digital y prefiero que me contacte por ${f.get('medio')} ${f.get('horario')} para conversar sobre ${tema}.`;
  const via = e.submitter?.value === 'sms' ? 'sms' : 'wa';
  track('callback_submit', { service: topic, channel: via });
  location.href = via === 'sms' ? smsURL(msg) : waURL(msg);
  setTimeout(() => { $('#callback').close(); toast(via === 'sms' ? 'Se abrió su app de mensajes. Solo falta pulsar Enviar.' : 'Se abrió WhatsApp. Solo falta pulsar Enviar.', 6000); }, 600);
});

/* ---------- Saludo según la hora ---------- */
(() => { const h = new Date().getHours(); $('#greeting').textContent = (h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches') + ' · Hablemos'; })();

/* ---------- Instalar / sin conexión / NFC ---------- */
let installPrompt;
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
if (standalone) { $('#install').hidden = true; $('.keep-grid').style.gridTemplateColumns = '1fr 1fr'; $('#pwaStatus').textContent = 'Tarjeta instalada en su teléfono.'; }
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; });
$('#install').addEventListener('click', async () => {
  track('install_click');
  if (installPrompt) { try { await installPrompt.prompt(); await installPrompt.userChoice; } catch {} installPrompt = null; }
  else openSheet('installSheet');
});
const net = () => { $('#offline').hidden = navigator.onLine; };
addEventListener('online', net); addEventListener('offline', net); net();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js', { scope: './', updateViaCache: 'none' })
    .then(() => { if (!standalone) $('#pwaStatus').textContent = 'Puede instalarla y consultarla aunque no tenga señal.'; })
    .catch(() => {}));
}
if (location.hash === '#nfc') {
  const b = $('#nfc'); b.hidden = false;
  b.addEventListener('click', async () => {
    if (!('NDEFReader' in window)) { toast('Este navegador no permite escribir NFC. Use Chrome en Android.'); return; }
    try { await new NDEFReader().write({ records: [{ recordType: 'url', data: sharedURL('nfc') }] }); toast('Sticker NFC grabado.'); }
    catch { toast('No se pudo grabar el NFC. Revise el permiso y el sticker.'); }
  });
}

selectService(selected, false);
calculate(false);
track('card_view');
})();
