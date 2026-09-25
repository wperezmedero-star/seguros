/* ═══════════ CONFIGURACIÓN ═══════════ */
const CONFIG = {
  /* ───────────────────────────────────────────────────────────────
     modo: "educativo"  → mientras la licencia esté en trámite o
                          falten nombramientos. El sitio informa,
                          no solicita ni vende. Es el estado seguro.
     modo: "autorizado" → solo tras verificar licencia emitida,
                          nombramiento vigente y, cuando aplique,
                          aprobación de publicidad de la aseguradora.
     ─────────────────────────────────────────────────────────────── */
  modo: "educativo",

  whatsapp: "17863548796",
  voiceEndpoint: "https://william-seguros-voz.wperezmedero.workers.dev/session",
  voiceMaxMs: 180000,
  crmEndpoint: "",
  recaptchaKey: "",
  waFallback: true,
  panelPin: "2015"
};

/* Varias páginas: si un elemento no existe en la página actual, $() devuelve
   un objeto inerte en lugar de null, para que el resto del sitio siga funcionando. */
const NADA = new Proxy(function(){}, {
  get(t, k){
    if (k === Symbol.iterator) return function*(){};
    if (k === Symbol.toPrimitive) return () => '';
    if (k === 'then') return undefined;
    if (k === 'length') return 0;
    return NADA;
  },
  set(){ return true; },
  apply(){ return NADA; }
});
const $ = s => document.querySelector(s) || NADA;
const $$ = s => [...document.querySelectorAll(s)];
const slow = matchMedia('(prefers-reduced-motion: reduce)').matches;
const USD = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 });

/* Navegación interna sin depender del hash del navegador.
   Necesario porque dentro de un iframe con sandbox los saltos con # no funcionan. */
function irASeccion(sel){
  const el = document.querySelector(sel);
  if (!el || !el.offsetParent) {
    if (window.WPS && WPS.irAPagina(sel)) return true;
    if (!el) return false;
  }
  el.scrollIntoView({ behavior: slow ? 'auto' : 'smooth', block:'start' });
  return true;
}
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (href === '#' || a.hasAttribute('data-legal')) return;   // los legales tienen su propio manejador
  e.preventDefault();
  // Con el menú abierto el desplazamiento de la página está bloqueado.
  // Hay que cerrarlo y esperar a que termine la transición antes de desplazarse.
  if (document.body.classList.contains('is-locked')) {
    setMenu(false);
    setTimeout(() => irASeccion(href), slow ? 0 : 340);
  } else {
    irASeccion(href);
  }
});

/* Respaldo si el navegador o el iframe no permiten <dialog>.showModal() */
function openDialog(dlg){
  try {
    if (typeof dlg.showModal === 'function' && !dlg.open) { dlg.showModal(); return; }
  } catch (_) {}
  dlg.setAttribute('open', '');
  dlg.classList.add('is-fallback');
  document.body.classList.add('is-locked');
}
function closeDialog(dlg){
  try { if (dlg.open && typeof dlg.close === 'function') dlg.close(); } catch (_) {}
  dlg.removeAttribute('open');
  dlg.classList.remove('is-fallback');
  document.body.classList.remove('is-locked');
}

document.body.dataset.modo = CONFIG.modo === 'autorizado' ? 'autorizado' : 'educativo';
const AUTORIZADO = document.body.dataset.modo === 'autorizado';

$('#wa').href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent('Hola, vi la página y quisiera orientación.');
$('#year').textContent = new Date().getFullYear();

if (!AUTORIZADO) {
  // Ningún llamado puede insinuar solicitud o cotización mientras no haya licencia y nombramiento
  $$('[data-cta-modo]').forEach(a => { a.textContent = 'Preparar mis preguntas'; a.setAttribute('href', '#preguntas'); });
  const cta = $('#sheetCta'); if (cta) { cta.textContent = 'Ver las calculadoras'; cta.setAttribute('href', '#calculadoras'); }
  $('#wa').setAttribute('aria-label', 'Escribir con una consulta general');
  $('#wa').href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' +
    encodeURIComponent('Hola, vi la página y tengo una pregunta general.');
}

/* ═══════════ HEADER / MENÚ ═══════════ */
let tick = false;
addEventListener('scroll', () => {
  if (tick) return; tick = true;
  requestAnimationFrame(() => { $('#header').classList.toggle('is-scrolled', scrollY > 40); tick = false; });
}, { passive:true });

const burger = $('#burger'), drawer = $('#drawer'), scrim = $('#scrim');
function setMenu(open){
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', !open);
  scrim.classList.toggle('is-open', open);
  document.body.classList.toggle('is-locked', open);
}
burger.onclick = () => setMenu(burger.getAttribute('aria-expanded') !== 'true');
scrim.onclick = () => setMenu(false);
drawer.addEventListener('click', e => { if (e.target.tagName === 'A') setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); closeDialog(sheet); closeDialog(legalModal); } });

/* ═══════════ ROTADOR DEL HERO ═══════════ */
const ROT = [
  { t:'Protege a tu familia', c:'#4A90E2',
    s:'Una póliza de vida puede ayudar a reemplazar ingresos, proteger la vivienda, atender deudas y cubrir gastos finales. La cantidad correcta no se adivina: se calcula y se revisa según tu realidad.' },
  { t:'Cubre tus gastos médicos', c:'#2FBF87',
    s:'Compara más que la prima. La red de médicos, los medicamentos, el deducible, los copagos, el coaseguro y el máximo de bolsillo pueden cambiar lo que realmente pagarás durante el año.' },
  { t:'Asegura tu retiro', c:'#D4AF37',
    s:'Proyecta tus ahorros, mide tu brecha de ingreso y conoce las preguntas esenciales antes de considerar una anualidad. Las garantías existen únicamente según el contrato y la capacidad de pago de la aseguradora emisora.' }
];
const rotT = document.createElement('i'), rotS = $('#rotSub'), dots = $$('#rotDots button'), rotW = $$('.hero-h1 [data-rot]');
let rotI = 0, rotTimer;
function showRot(i){
  rotI = i;
  rotT.classList.add('is-out'); rotS.classList.add('is-out');
  setTimeout(() => {
    rotT.textContent = ROT[i].t; rotT.style.color = ROT[i].c; rotS.textContent = ROT[i].s;
    $('#rotDots').style.setProperty('--acc', ROT[i].c);
    dots.forEach((d,j) => d.setAttribute('aria-current', j === i));
    rotW.forEach((w,j) => w.classList.toggle('is-on', j === i));
    rotT.classList.remove('is-out'); rotS.classList.remove('is-out');
  }, slow ? 0 : 420);
}
function loopRot(){ rotTimer = setInterval(() => showRot((rotI + 1) % ROT.length), 6000); }
dots.forEach((d,i) => d.onclick = () => { clearInterval(rotTimer); showRot(i); loopRot(); });
showRot(0); loopRot();

/* ═══════════ MODALES DE PILARES ═══════════ */
const SHEETS = {
  vida:{
    color:'#4A90E2', glow:'rgba(74,144,226,.16)',
    title:'El objetivo no es comprar “mucho” seguro. Es cubrir la brecha correcta.',
    sub:'La regla de diez veces el ingreso puede servir como punto de partida, pero no ve toda la historia. Dos personas con el mismo salario pueden necesitar cantidades muy distintas.',
    note:'Las primas, duración, conversión, garantías y renovación dependen de la póliza y de la aseguradora emisora.',
    cta:'Seguro de vida',
    items:[
      { h:'Qué revisamos contigo', p:'La lista que ordena la conversación antes de mirar cualquier producto.',
        l:['Ingreso anual y años de reemplazo deseados','Saldo hipotecario y otras deudas','Fondo para educación de hijos u otras personas dependientes','Gastos finales y necesidades de transición','Cobertura de vida ya existente','Ahorros líquidos que la familia podría usar sin sacrificar el retiro'] },
      { h:'Seguro temporal', p:'Puede ofrecer protección durante un período definido. Suele utilizarse para necesidades como años de crianza, hipoteca o reemplazo de ingresos.',
        l:['La prima, duración, conversión y renovación dependen de la póliza'] },
      { h:'Seguro permanente', p:'Está diseñado para durar mientras se cumplan las condiciones contractuales y puede incluir valor en efectivo.',
        l:['Primas, garantías, cargos, supuestos y riesgos varían ampliamente','Requiere explicación e ilustración oficial cuando corresponda'] },
      { h:'Cobertura laboral', p:'Puede ser útil, pero conviene confirmar los detalles antes de asumir que es suficiente.',
        l:['Cuánto ofrece y si cambia con el salario','Qué sucede al dejar el empleo','Si permite conversión o portabilidad'] }
    ]},
  salud:{
    color:'#2FBF87', glow:'rgba(47,191,135,.16)',
    title:'La prima abre la puerta; los detalles determinan la experiencia.',
    sub:'Un plan con prima baja puede exigir un deducible mayor. La comparación debe usar tus médicos, hospitales, medicamentos, uso esperado, presupuesto y tolerancia a un gasto inesperado.',
    note:'No estamos afiliados ni respaldados por el gobierno federal, Medicare, CMS ni HealthCare.gov.',
    cta:'Cobertura de salud',
    items:[
      { h:'Términos esenciales', p:'Las seis palabras que deciden cuánto pagas de verdad durante el año.',
        l:['Prima: cantidad que pagas para mantener la cobertura','Deducible: cantidad aplicable que pagas antes de que el plan comience a compartir ciertos costos','Copago: cantidad fija para determinados servicios, según el plan','Coaseguro: porcentaje que pagas por ciertos servicios después de aplicar las reglas del plan','Máximo de bolsillo: límite anual para determinados gastos cubiertos dentro de la red','Red: proveedores y centros con acuerdos con el plan'] },
      { h:'Lo que el máximo de bolsillo no incluye', p:'Es un límite para ciertos gastos cubiertos dentro de la red, no el techo de todo gasto médico.',
        l:['La prima no cuenta para ese límite','Los servicios no cubiertos pueden quedar fuera','La atención fuera de la red puede tratarse de otra forma'] },
      { h:'Si estás cerca de los 65, el calendario importa', p:'Medicare generalmente atiende a personas de 65 años o más que cumplen los requisitos correspondientes, aunque algunas personas pueden ser elegibles antes por discapacidad, enfermedad renal terminal o ALS.',
        l:['La cobertura laboral y el momento de inscripción pueden afectar el proceso','Estos casos se derivan a un agente debidamente certificado','Se utilizan únicamente materiales aprobados'] },
      { h:'Antes de inscribirte', p:'La verificación que evita la sorpresa más común.',
        l:['Confirma la red con el directorio del plan y con la oficina del médico','Revisa cómo trata el plan tus medicamentos','Compara un escenario de uso bajo, uno esperado y uno alto'] }
    ]},
  anualidades:{
    color:'#D4AF37', glow:'rgba(212,175,55,.16)',
    title:'“Ingreso de por vida” debe explicarse con contrato, no con un eslogan.',
    sub:'Algunas anualidades ofrecen opciones contractuales de ingreso durante la vida del titular o de una pareja. Una calculadora general no puede sustituir una cotización o ilustración oficial.',
    note:'Las garantías dependen de los términos del contrato y de la capacidad de pago de la aseguradora emisora.',
    cta:'Retiro o anualidades',
    items:[
      { h:'Revisión previa a una anualidad', p:'Lo que debe quedar documentado antes de que exista cualquier recomendación.',
        l:['Objetivos financieros y plazo','Fuentes actuales de ingreso y gastos previstos','Liquidez necesaria para emergencias','Activos existentes, deudas y obligaciones','Tolerancia a riesgo y experiencia financiera','Situación fiscal, con asesoría profesional cuando corresponda','Cargos, períodos de rescate, ajustes de valor de mercado y límites de participación, si aplican','Beneficiarios, opciones de pago y consecuencias de retiros','Comparación con mantener o reorganizar los activos existentes'] },
      { h:'De qué depende el monto', p:'El pago no sale de una tabla general: sale de un contrato concreto.',
        l:['Edad, prima y fecha de inicio','Modalidad elegida y anexos contratados','Tasas, cargos y retiros realizados','Condiciones de la aseguradora emisora'] },
      { h:'Un ingreso estable no siempre conserva el mismo poder de compra', p:'La inflación puede reducir lo que compra una cantidad fija. La revisión debe distinguir entre ingreso nominal e ingreso en dólares de hoy.',
        l:['Se explica si existe alguna característica contractual relacionada con aumentos','Se explican sus costos y sus límites','No se afirma que una anualidad “vence la inflación” sin sustento específico'] },
      { h:'Norma de mejor interés en Florida', p:'Una recomendación de anualidad debe atender el mejor interés del consumidor y considerar la información pertinente disponible (Estatutos de Florida §627.4554).',
        l:['Se documentan objetivos, riesgos, conflictos y motivos de la recomendación','Se entregan formularios e ilustraciones aplicables'] }
    ]}
};

const sheet = $('#sheet');
$$('.pillar').forEach(p => p.onclick = () => openSheet(p.dataset.sheet));
function openSheet(k){
  const d = SHEETS[k];
  sheet.style.setProperty('--acc', d.color);
  sheet.style.setProperty('--glow', d.glow);
  $('#sheetTitle').textContent = d.title;
  $('#sheetSub').textContent = d.sub;
  $('#sheetNote').textContent = d.note;
  $('#sheetCta').dataset.prefill = d.cta;
  $('#sheetBody').innerHTML = d.items.map(i =>
    '<details class="acc"><summary>' + i.h + '</summary><div class="acc__in"><p>' + i.p +
    '</p><ul>' + i.l.map(x => '<li>' + x + '</li>').join('') + '</ul></div></details>').join('');
  openDialog(sheet);
}
$('#sheetClose').onclick = () => closeDialog(sheet);
$('#sheetCta').onclick = () => { prefill($('#sheetCta').dataset.prefill); closeDialog(sheet); irASeccion('#cotizar'); };

/* ═══════════ CALCULADORAS ═══════════ */
const IC = window.InsuranceCalculators;

const CALC_DEFS = {
  vida: {
    prefix:'cv', fn:'lifeInsuranceNeed',
    fields:{ annualIncome:0, replacementYears:0, mortgageBalance:0, otherDebts:0, educationGoal:0,
             finalExpenses:0, otherGoals:0, existingCoverage:0, liquidAssets:0 },
    render(r){
      return card('Brecha estimada de protección', USD.format(r.estimatedNeed), [
        ['Reemplazo de ingreso', USD.format(r.breakdown.incomeReplacement)],
        ['Obligaciones y metas', USD.format(r.breakdown.obligationsAndGoals)],
        ['Necesidad bruta', USD.format(r.breakdown.grossNeed)],
        ['Recursos disponibles', '−' + USD.format(r.breakdown.availableResources)]
      ], r.explanation, r.disclaimer);
    }
  },
  retiro: {
    prefix:'cr', fn:'retirementProjection',
    fields:{ currentAge:0, retirementAge:0, currentSavings:0, monthlyContribution:0,
             annualReturn:'pct', annualInflation:'pct', withdrawalRate:'pct', planningAge:0 },
    render(r){
      return card('Saldo proyectado al retiro', USD.format(r.results.projectedSavings), [
        ['Años para acumularlo', r.results.yearsToRetirement + ' años'],
        ['Ingreso anual de planificación', USD.format(r.results.annualPlanningIncome)],
        ['Ingreso mensual', USD.format(r.results.monthlyPlanningIncome)],
        ['Equivalente en dólares de hoy', USD.format(r.results.annualIncomeTodayDollars) + ' / año'],
        ['Reparto lineal sin rendimiento', USD.format(r.results.straightLineMonthlyNoGrowth) + ' / mes']
      ], r.explanation, r.disclaimer);
    }
  },
  salud: {
    prefix:'cs', fn:'annualHealthCost',
    fields:{ monthlyPremium:0, expectedAllowedCharges:0, deductible:0, coinsuranceRate:'pct',
             annualCopays:0, outOfPocketMaximum:0, nonCoveredCosts:0, outOfNetworkCosts:0 },
    render(r){
      return card('Costo anual estimado', USD.format(r.results.estimatedTotalAnnualCost), [
        ['Primas del año', USD.format(r.results.annualPremium)],
        ['Participación estimada', USD.format(r.results.estimatedCoveredOutOfPocket)],
        ['Escenario de uso alto', USD.format(r.results.highUseScenario)]
      ], r.explanation, r.disclaimer);
    }
  },
  uni: {
    prefix:'cu', fn:'collegeSavings',
    fields:{ currentAnnualCost:0, yearsUntilCollege:0, yearsInCollege:0,
             collegeInflation:'pct', currentSavings:0, annualReturn:'pct' },
    render(r){
      const years = r.results.projectedCostByAcademicYear
        .map((v,i) => ['Año ' + (i+1) + ' de carrera', USD.format(v)]);
      return card('Costo total proyectado', USD.format(r.results.totalProjectedCost), [
        ...years,
        ['Tu ahorro crecerá a', USD.format(r.results.projectedCurrentSavings)],
        ['Falta por cubrir', USD.format(r.results.fundingGap)],
        ['Aportación mensual estimada', USD.format(r.results.requiredMonthlyContribution) + ' / mes']
      ], r.explanation, r.disclaimer);
    }
  }
};

function card(label, big, rows, explanation, disclaimer){
  return '<span class="calc__label">' + label + '</span>' +
    '<p class="calc__big">' + big + '</p>' +
    '<div class="calc__rows">' + rows.map(r =>
      '<div class="calc__row"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>').join('') + '</div>' +
    '<p class="calc__exp">' + explanation + '</p>' +
    '<p class="calc__disc">' + disclaimer + '</p>';
}

/* ═══ CIFRAS QUE SE TRANSFORMAN AL PRESIONAR "CALCULAR" ═══
   Cada cifra del resultado (la grande y las de cada fila) viaja desde su
   valor anterior hasta el nuevo en 1.1 s con ease-out, en vez de cambiar de
   golpe. Solo anima las cifras que cambiaron; respeta el formato ($, comas,
   decimales, "/ mes"). Mientras cuenta, aria-busy evita que los lectores de
   pantalla lean cada paso: al final leen solo el resultado. */
const CIFRA = /-?\d[\d,]*(?:\.\d+)?/g;
function cifrasDe(txt){ return (txt.match(CIFRA) || []).map(n => Number(n.replace(/,/g, ''))); }
function formatoCifra(v, muestra){
  const dec = (muestra.split('.')[1] || '').length;
  const txt = Math.abs(v).toFixed(dec);
  const [ent, frac] = txt.split('.');
  /* Miles con coma, igual que el formato USD del sitio */
  const conComas = ent.length > 3 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ent;
  return (v < 0 ? '-' : '') + conComas + (frac ? '.' + frac : '');
}
function animarCifras(out, antes){
  if (slow || !antes) return;
  const nodos = [...out.querySelectorAll('.calc__big, .calc__row b')];
  const tareas = [];
  nodos.forEach((el, i) => {
    const previo = antes[i], final = el.textContent;
    if (previo == null || previo === final) return;
    const desde = cifrasDe(previo), hasta = cifrasDe(final), muestras = final.match(CIFRA) || [];
    if (!hasta.length || desde.length !== hasta.length) return;
    tareas.push({ el, final, desde, hasta, muestras });
  });
  if (!tareas.length || document.hidden) return;
  out.setAttribute('aria-busy', 'true');
  const DUR = 1100, t0 = performance.now(), ease = t => 1 - Math.pow(1 - t, 3);
  let listo = false;
  tareas.forEach(tk => tk.el.classList.add('cifra-viva'));
  const terminar = () => {
    if (listo) return; listo = true;
    tareas.forEach(tk => { tk.el.textContent = tk.final; setTimeout(() => tk.el.classList.remove('cifra-viva'), 250); });
    out.removeAttribute('aria-busy');
  };
  /* Red de seguridad: si el navegador pausa la animación (pestaña en segundo
     plano), el resultado final se escribe igual. */
  setTimeout(terminar, DUR + 200);
  (function paso(ahora){
    if (listo) return;
    const t = Math.min(1, Math.max(0, (ahora - t0) / DUR)), k = ease(t);
    if (t >= 1) { terminar(); return; }
    tareas.forEach(tk => {
      let j = 0;
      tk.el.textContent = tk.final.replace(CIFRA, () => {
        const v = tk.desde[j] + (tk.hasta[j] - tk.desde[j]) * k;
        return formatoCifra(v, tk.muestras[j++]);
      });
    });
    requestAnimationFrame(paso);
  })(t0);
}

function runCalc(key, animar){
  const def = CALC_DEFS[key], out = $('#out-' + key), input = {};
  /* Se guardan las cifras visibles para animar desde ellas (solo con "Calcular") */
  const antes = animar ? [...out.querySelectorAll('.calc__big, .calc__row b')].map(n => n.textContent) : null;
  try {
    for (const [name, kind] of Object.entries(def.fields)) {
      const el = $('#' + def.prefix + '-' + name);
      const raw = el.value.replace(/[$,\s%]/g, '');
      const n = Number(raw);
      if (!Number.isFinite(n)) throw new RangeError('Revisa el campo “' + el.previousElementSibling.textContent + '”: escribe solo números.');
      input[name] = kind === 'pct' ? n / 100 : n;
    }
    out.innerHTML = def.render(IC[def.fn](input));
    animarCifras(out, antes && antes.length ? antes : null);
  } catch (err) {
    out.innerHTML = '<span class="calc__label">No se pudo calcular</span>' +
      '<p class="calc__err">' + (err && err.message ? err.message : 'Revisa los datos ingresados.') + '</p>' +
      '<p class="calc__disc">' + IC.DISCLAIMER + '</p>';
  }
}

$$('[data-run]').forEach(b => b.onclick = () => runCalc(b.dataset.run, true));
$$('[data-reset]').forEach(b => b.onclick = () => {
  const def = CALC_DEFS[b.dataset.reset];
  Object.keys(def.fields).forEach(n => { $('#' + def.prefix + '-' + n).value = ''; });
  $('#out-' + b.dataset.reset).innerHTML =
    '<span class="calc__label">Listo para calcular</span><p class="calc__exp">Completa los campos y pulsa Calcular.</p>';
});
$$('[data-calc]').forEach(t => t.onclick = () => {
  $$('[data-calc]').forEach(x => x.setAttribute('aria-selected', x === t));
  $$('.calc').forEach(c => c.classList.toggle('is-active', c.id === 'calc-' + t.dataset.calc));
});
Object.keys(CALC_DEFS).forEach(runCalc);

function prefill(v){
  const sel = document.querySelector('#interes');
  if (!sel) { try { sessionStorage.setItem('wps-prefill', v); } catch (_) {} return; }
  if ([...sel.options].some(o => o.value === v)) { sel.value = v; sel.dispatchEvent(new Event('change')); }
}
$$('[data-prefill]').forEach(a => a.addEventListener('click', () => prefill(a.dataset.prefill)));

/* ═══════════ FAQ + REVEAL ═══════════ */
$$('[data-faq]').forEach(t => t.onclick = () => {
  $$('[data-faq]').forEach(x => x.setAttribute('aria-selected', x === t));
  ['vida','salud','anualidades'].forEach(k => $('#faq-' + k).classList.toggle('is-hidden', k !== t.dataset.faq));
});
/* ═══════════ REVELADO AL HACER SCROLL (sistema único) ═══════════
   · Cada .reveal aparece una sola vez: fade + subida de 36 px en 800 ms (CSS).
   · Escalonado por lote: los elementos que entran juntos en pantalla se
     ordenan de arriba abajo y de izquierda a derecha, con 140 ms entre cada
     uno (máx. 5 pasos). Un elemento que entra solo no espera a nadie.
   · Grupos (.metodo, .stats, .reminders): el contenedor queda fijo y sus
     hijos aparecen uno tras otro, también a 140 ms.
   · Solo se anima opacity/transform: el espacio final se reserva desde el
     inicio, así que no hay saltos de diseño (CLS = 0).
   · Con "reducir movimiento" o sin IntersectionObserver, todo se ve de inmediato. */
const REVEAL_STEP = 140, REVEAL_MAX = 5;
$$('.metodo.reveal, .stats.reveal, .reminders.reveal').forEach(g => {
  g.classList.add('reveal--grupo');
  if (g.matches('.metodo, .stats')) g.classList.add('reveal--tiles');
  [...g.children].forEach((c, i) => c.style.setProperty('--rv-i', Math.min(i, REVEAL_MAX)));
});
if (slow || !('IntersectionObserver' in window)) {
  $$('.reveal').forEach(el => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(es => {
    /* Con un scroll muy rápido un elemento puede pasar sin llegar a "verse":
       si ya quedó por encima de la pantalla, se muestra sin esperar. */
    es.forEach(e => {
      if (!e.isIntersecting && e.boundingClientRect.bottom < 0) {
        e.target.style.setProperty('--rv-delay', '0ms');
        e.target.classList.add('is-in'); io.unobserve(e.target);
      }
    });
    const lote = es.filter(e => e.isIntersecting)
      .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left));
    lote.forEach((e, k) => {
      e.target.style.setProperty('--rv-delay', Math.min(k, REVEAL_MAX) * REVEAL_STEP + 'ms');
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold:.12, rootMargin:'0px 0px -40px' });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ═══════════ SISTEMA DE ICONOS ═══════════
   Una sola definición para todo el sitio. Los iconos son decorativos
   (aria-hidden) y nunca son el único medio para comunicar algo:
   cada uno va acompañado de su etiqueta de texto.
   Sin monedas, billetes, signos de dólar ni gráficas ascendentes. */
const ICONS = {
  // Corazón protegido dentro de un escudo abierto
  vida:
    '<path class="ico__shield" d="M12 3.3 19 6.2v5.2c0 3.9-2.7 6.8-5.7 7.9"/>' +
    '<path class="ico__shield" d="M10.3 19.3C7.4 18.1 5 15.3 5 11.4V6.2l3.3-1.4"/>' +
    '<path class="ico__heart" d="M12 15.6c-.6-.4-3-1.9-3-3.7a1.7 1.7 0 0 1 3-1.1 1.7 1.7 0 0 1 3 1.1c0 1.8-2.4 3.3-3 3.7z"/>' +
    '<path class="ico__sheen" d="M7.4 6.6 16.6 15.8"/>',
  // Cruz médica orgánica atravesada por una línea de pulso
  salud:
    '<path d="M10.2 4.8h3.6a1.2 1.2 0 0 1 1.2 1.2v3.2h3.2a1.2 1.2 0 0 1 1.2 1.2v3.2a1.2 1.2 0 0 1-1.2 1.2H15v3.2a1.2 1.2 0 0 1-1.2 1.2h-3.6a1.2 1.2 0 0 1-1.2-1.2v-3.2H5.8a1.2 1.2 0 0 1-1.2-1.2v-3.2a1.2 1.2 0 0 1 1.2-1.2H9V6a1.2 1.2 0 0 1 1.2-1.2z"/>' +
    '<path class="ico__pulse au" d="M4.6 12h2.6l1.3-2.6 2 5.2 1.4-2.6h7.5"/>',
  // Reloj rodeado por un círculo protector incompleto
  retiro:
    '<path class="ico__ring" d="M19.9 8.1A8.6 8.6 0 1 1 12 3.4"/>' +
    '<path class="ico__ring au" d="M17.6 4.6 20.4 5l-.4 2.8"/>' +
    '<circle cx="12" cy="12" r="5.1"/>' +
    '<path d="M12 9.2V12l1.9 1.2"/>',
  // Documento con controles deslizantes y un pequeño escudo
  variables:
    '<path d="M6.2 3.7h7.1L18 8.4v7.2"/><path d="M18 18.6v1.7H6.2V3.7"/>' +
    '<path d="M13.1 3.8v4.5H18"/>' +
    '<path d="M8.7 11.9h6.6"/><circle class="ico__sl" cx="11" cy="11.9" r="1.5"/>' +
    '<path d="M8.7 15.4h4.4"/><circle class="ico__sl2" cx="12" cy="15.4" r="1.5"/>' +
    '<path class="au" d="M16.4 16.3l2.3-.9 2.3.9v2.1c0 1.4-1 2.4-2.3 2.7-1.3-.3-2.3-1.3-2.3-2.7z"/>',
  // Burbuja de conversación combinada con una brújula
  atencion:
    '<path d="M20.8 11.9a8.5 8.5 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3.4 20.7l1.4-4.4a8.5 8.5 0 0 1 7.3-12.6 8.5 8.5 0 0 1 8.7 8.2z"/>' +
    '<circle cx="12.1" cy="11.6" r="4.3"/>' +
    '<path class="ico__needle au" d="M14.3 9.4l-1.5 3.5-3.5 1.5 1.5-3.5z"/>'
};

function icon(name, size){
  return '<svg class="ico ico--' + name + '" width="' + size + '" height="' + size + '" ' +
         'viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
}

// Pintar los iconos en sus contenedores
$$('[data-ico]').forEach(el => { el.innerHTML = icon(el.dataset.ico, +el.dataset.icoSize || 48); });

/* Disparo de la microanimación: cursor, foco de teclado o toque.
   Se retira la clase al terminar para que no se repita sola. */
function fireIcon(host){
  const svg = host.querySelector('.ico');
  if (!svg || svg.classList.contains('is-anim')) return;
  svg.classList.add('is-anim');
  setTimeout(() => svg.classList.remove('is-anim'), 950);
}
['pointerenter','focusin','touchstart'].forEach(ev =>
  document.addEventListener(ev, e => {
    const host = e.target.closest && e.target.closest('.pillar, .scard');
    if (host) fireIcon(host);
  }, { capture:true, passive:true }));

/* Iluminación radial que sigue el cursor. Solo con ratón real. */
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  $$('.pillar').forEach(p => {
    const g = document.createElement('span');
    g.className = 'glow-follow'; g.setAttribute('aria-hidden','true');
    p.insertBefore(g, p.firstChild);
    p.addEventListener('pointermove', e => {
      const r = p.getBoundingClientRect();
      p.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      p.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
}

/* (El escalonado entre hermanos ahora lo maneja el sistema único de
   revelado, en la sección "FAQ + REVEAL".) */

/* ═══════════ CARRUSEL INFINITO ═══════════ */
const SHOW = [
  { n:'vida', t:'Vida', h:'Calculadora de protección', d:'Estima la brecha que enfrentaría tu familia usando el método DIME, no una regla suelta.', a:'#calculadoras', k:'vida', c:'#4A90E2', g:'rgba(74,144,226,.18)' },
  { n:'retiro', t:'Retiro', h:'Proyección de ingreso', d:'Mide tu brecha con una tasa de retiro editable y compara el resultado en dólares de hoy.', a:'#calculadoras', k:'retiro', c:'#D4AF37', g:'rgba(212,175,55,.18)' },
  { n:'salud', t:'Salud', h:'Costo real del año', d:'Suma prima, deducible, coaseguro y copagos hasta el tope. La prima nunca es el costo total.', a:'#calculadoras', k:'salud', c:'#2FBF87', g:'rgba(47,191,135,.18)' },
  { n:'variables', t:'Educación', h:'Ahorro universitario', d:'Convierte una meta futura en una aportación mensual, con inflación educativa editable.', a:'#calculadoras', k:'uni', c:'#4A90E2', g:'rgba(74,144,226,.18)' },
  { n:'atencion', t:'Guía', h:'Qué preguntar antes de firmar', d:'Quince preguntas frecuentes sobre vida, salud y retiro, respondidas sin letra pequeña.', a:'#preguntas', c:'#2FBF87', g:'rgba(47,191,135,.18)' },
  { n:'vida', t:'Confianza', h:'Quién está detrás', d:'De La Habana a Hialeah, y por qué decidí prepararme para orientar a familias como la tuya.', a:'#sobre-mi', c:'#D4AF37', g:'rgba(212,175,55,.18)' }
];

const track = $('#showTrack'), marq = $('#showMarq'), view = $('#showView');
function makeCard(o, dup){
  const a = document.createElement('a');
  a.className = 'scard'; a.href = o.a; a.setAttribute('role','listitem');
  a.style.setProperty('--c', o.c); a.style.setProperty('--g', o.g);
  if (dup) { a.setAttribute('aria-hidden','true'); a.tabIndex = -1; }
  a.innerHTML =
    '<span class="scard__ico">' + icon(o.n, 34) + '</span>' +
    '<span class="scard__tag">' + o.t + '</span><h3>' + o.h + '</h3><p>' + o.d + '</p>' +
    '<span class="scard__cta">Abrir<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
  a.addEventListener('pointermove', e => {
    const r = a.getBoundingClientRect();
    a.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    a.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
  if (o.k) a.addEventListener('click', ev => {
    ev.preventDefault();
    const tab = document.querySelector('[data-calc="' + o.k + '"]');
    if (tab) tab.click();
    irASeccion('#calculadoras');
  });
  return a;
}
SHOW.forEach(o => marq.appendChild(makeCard(o, false)));
SHOW.forEach(o => marq.appendChild(makeCard(o, true)));   // segundo juego: el -50% cae aquí

/* La duración se ajusta al ancho real para mantener una velocidad constante.
   Si la medida fuera imprecisa, solo variaría un poco la velocidad:
   el bucle sigue siendo exacto porque el -50% lo define el propio CSS. */
const SPEED = 34;   // píxeles por segundo
function setSpeed(){
  const d = marq.scrollWidth / 2;
  if (d > 0) marq.style.animationDuration = (d / SPEED).toFixed(2) + 's';
}
setSpeed();
addEventListener('resize', setSpeed, { passive:true });
addEventListener('load', setSpeed);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(setSpeed);

/* Arrastre: desplaza la pista exterior; la animación interior queda en pausa */
let dragging = false, startX = 0, startPos = 0, pos = 0, moved = 0;
(function(){
  if (slow || !('IntersectionObserver' in window)) return;
  const hd = document.querySelector('.show__head'), c = marq.firstElementChild;
  if (!hd || !c) return;
  const step = c.getBoundingClientRect().width + parseFloat(getComputedStyle(c).marginRight || 0);
  const t = Math.max(0, step - hd.getBoundingClientRect().left);
  marq.style.animationDelay = (-t / SPEED).toFixed(2) + 's';
  view.classList.add('is-wait');
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); view.classList.remove('is-wait'); } }, { threshold: .4 }).observe(view);
})();
view.addEventListener('pointerdown', e => {
  if (slow) return;
  dragging = true; moved = 0; startX = e.clientX; startPos = pos;
  view.classList.add('is-drag');
  try { view.setPointerCapture(e.pointerId); } catch (_) {}
});
view.addEventListener('pointermove', e => {
  if (!dragging) return;
  const d = e.clientX - startX;
  moved = Math.abs(d);
  pos = startPos + d;
  const lim = marq.scrollWidth / 2;
  if (lim > 0) { while (pos <= -lim) pos += lim; while (pos > 0) pos -= lim; }
  track.style.transform = 'translate3d(' + pos.toFixed(2) + 'px,0,0)';
});
function endDrag(){ dragging = false; view.classList.remove('is-drag'); }
view.addEventListener('pointerup', endDrag);
view.addEventListener('pointercancel', endDrag);
marq.addEventListener('click', e => { if (moved > 8) { e.preventDefault(); e.stopPropagation(); } }, true);

view.setAttribute('tabindex','0');
view.setAttribute('aria-label','Carrusel de herramientas. Usa las flechas izquierda y derecha para desplazarte.');
view.addEventListener('keydown', e => {
  const step = 340;
  if (e.key === 'ArrowRight') pos -= step;
  else if (e.key === 'ArrowLeft') pos += step;
  else return;
  e.preventDefault();
  const lim = marq.scrollWidth / 2;
  if (lim > 0) { while (pos <= -lim) pos += lim; while (pos > 0) pos -= lim; }
  track.style.transform = 'translate3d(' + pos.toFixed(2) + 'px,0,0)';
  $('#showLive').textContent = 'Carrusel desplazado.';
});

/* ═══════════ FORMULARIO ═══════════ */
const form = $('#quoteForm'), steps = $$('#quoteForm .step'), bar = $('#bar'),
      marks = $$('.progress__steps span'), status = $('#status'), sendBtn = $('#send');
let current = 1;

const RULES = {
  nombre: v => v.trim().length >= 2 || 'Escribe al menos tu nombre.',
  telefono: v => v.replace(/\D/g,'').length === 10 || 'El teléfono debe tener 10 dígitos.',
  correo: v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) || 'Revisa el correo: falta el @ o el dominio.',
  requerido: v => v !== '' || 'Selecciona una opción para continuar.'
};
function validate(el){
  const rule = RULES[el.dataset.rule]; if (!rule) return true;
  const res = rule(el.value), ok = res === true, field = el.closest('.field');
  field.classList.toggle('is-invalid', !ok);
  field.classList.toggle('is-valid', ok && el.value !== '');
  field.querySelector('[data-err]').textContent = ok ? '' : res;
  return ok;
}
$$('#quoteForm [data-rule]').forEach(el => {
  el.addEventListener('blur', () => { el.dataset.touched = '1'; validate(el); });
  el.addEventListener('input', () => { if (el.dataset.touched) validate(el); });
  el.addEventListener('change', () => { el.dataset.touched = '1'; validate(el); });
});
const tel = $('#telefono');
tel.addEventListener('input', () => {
  const d = tel.value.replace(/\D/g,'').slice(0,10);
  tel.value = d.length > 6 ? '(' + d.slice(0,3) + ') ' + d.slice(3,6) + '-' + d.slice(6)
            : d.length > 3 ? '(' + d.slice(0,3) + ') ' + d.slice(3)
            : d.length ? '(' + d : '';
});

const SALUD = ['Cobertura de salud','Medicare'];
const ANUAL = ['Retiro o anualidades'];
$('#interes').addEventListener('change', e => {
  const v = e.target.value, esSalud = SALUD.includes(v), esAnual = ANUAL.includes(v);
  $('#noticeSalud').hidden = !esSalud;
  $('#noticeAnual').hidden = !esAnual;
  if (esSalud) {
    const est = $('#estado').value || 'tu estado';
    $('#noticeSaludTxt').textContent = v === 'Medicare'
      ? 'Medicare tiene períodos de inscripción y reglas de elegibilidad propias, que aplican también en ' + est + '.'
      : 'En ' + est + ', la cobertura de salud solo puede solicitarse dentro de los períodos de inscripción aplicables.';
  }
  if (!esAnual) { $('#anualOk').checked = false; $('#checkWrap').classList.remove('is-invalid'); }
});
$('#estado').addEventListener('change', () => $('#interes').dispatchEvent(new Event('change')));

function goTo(n){
  current = n;
  steps.forEach(s => s.classList.toggle('is-active', +s.dataset.step === n));
  bar.style.width = (n / steps.length * 100) + '%';
  marks.forEach(m => m.classList.toggle('is-active', +m.dataset.s <= n));
  const first = steps[n-1].querySelector('input,select');
  if (first) first.focus({ preventScroll:true });
}
$$('#quoteForm [data-next]').forEach(b => b.onclick = () => {
  const fs = [...steps[current-1].querySelectorAll('[data-rule]')];
  fs.forEach(f => f.dataset.touched = '1');
  if (fs.map(validate).every(Boolean)) goTo(current + 1);
});
$$('#quoteForm [data-back]').forEach(b => b.onclick = () => goTo(current - 1));

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (form.website.value) return;

  const all = $$('#quoteForm [data-rule]');
  all.forEach(f => f.dataset.touched = '1');
  if (!all.map(validate).every(Boolean)) {
    status.className = 'form-status bad';
    status.textContent = 'Faltan datos por completar. Revisa los pasos marcados.';
    return;
  }
  if (!$('#noticeAnual').hidden && !$('#anualOk').checked) {
    $('#checkWrap').classList.add('is-invalid');
    status.className = 'form-status bad';
    status.textContent = 'Para revisar una anualidad debes confirmar que entiendes los períodos de rescate.';
    return;
  }
  if (!$('#consent').checked) {
    $('#consentWrap').classList.add('is-invalid');
    status.className = 'form-status bad';
    status.textContent = 'Necesitamos tu autorización para poder contactarte.';
    return;
  }
  $('#checkWrap').classList.remove('is-invalid');
  $('#consentWrap').classList.remove('is-invalid');

  sendBtn.disabled = true;
  status.className = 'form-status'; status.textContent = 'Enviando…';

  const p = new URLSearchParams(location.search);
  const payload = {
    nombre: form.nombre.value.trim(), telefono: form.telefono.value,
    correo: form.correo.value.trim(), estado: form.estado.value,
    interes: form.interes.value, presupuesto: form.presupuesto.value,
    consentimiento: 'otorgado',
    aviso_anualidad: $('#anualOk').checked ? 'aceptado' : 'no aplica',
    origen: location.href,
    utm_source: p.get('utm_source') || 'directo',
    utm_medium: p.get('utm_medium') || '',
    utm_campaign: p.get('utm_campaign') || '',
    enviado: new Date().toISOString()
  };

  if (CONFIG.recaptchaKey && window.grecaptcha) {
    try {
      payload.recaptcha = await new Promise(res =>
        grecaptcha.ready(() => grecaptcha.execute(CONFIG.recaptchaKey, { action:'solicitud' }).then(res)));
    } catch(_){}
  }

  try {
    if (CONFIG.crmEndpoint) {
      const r = await fetch(CONFIG.crmEndpoint, {
        method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error(r.status);
    } else if (CONFIG.waFallback) {
      const t = 'Nueva solicitud%0A%0ANombre: ' + payload.nombre + '%0ATeléfono: ' + payload.telefono +
                '%0ACorreo: ' + payload.correo + '%0AEstado: ' + payload.estado +
                '%0AInterés: ' + payload.interes + '%0APresupuesto: ' + payload.presupuesto;
      window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + t, '_blank', 'noopener');
    } else throw new Error('sin endpoint');

    addLead(payload);
    $('#doneName').textContent = payload.nombre.split(' ')[0];
    form.hidden = true; $('#progress').hidden = true; $('#done').hidden = false;
  } catch(err) {
    sendBtn.disabled = false;
    status.className = 'form-status bad';
    status.textContent = 'No se pudo enviar. Escríbenos por WhatsApp y lo resolvemos.';
  }
});

/* ═══════════ ASISTENTE (intérprete del árbol) ═══════════ */
const bot = $('#bot'), botLog = $('#botLog'), botOpts = $('#botOpts');
const S = { data:{}, tags:[], meta:{}, started:false, node:null, multi:new Set(), ended:false };
$('#botName').textContent = BOT_TREE.name;

/* Voz natural por WebRTC para las respuestas. La pregunta hablada usa primero
   reconocimiento del navegador y se envía como texto al mismo turno Realtime;
   si no está disponible, se conserva el push-to-talk WebRTC como respaldo. */
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
/* V.output = el visitante quiere oír las respuestas (botón de bocina).
   Encendido por defecto; su elección se recuerda en esta pestaña. */
let vozPreferida = true;
try { vozPreferida = sessionStorage.getItem('wpVozRespuestas') !== '0'; } catch (_) {}
const V = { lang:'es-US', output:vozPreferida, recognition:null, listening:false, speechId:0, recognitionMode:'', lastTranscript:'', recognitionSent:false };
const R = { pc:null, dc:null, stream:null, audio:null, timer:null, connecting:false, active:false, generation:0, state:'', sender:null, watch:null, recuperando:false, ultimaRecuperacion:0, greeted:false, responsePending:false, responseWatch:null, sessionWatch:null, recording:false, switching:false, startedAt:0, mode:'', micMuted:false };
const BOT_COPY = {
  es: {
    name:'Asistente de William', sub:'Información de seguros · Voz con IA', langButton:'ES', langLabel:'Cambiar a inglés',
    input:'Escribe tu pregunta sobre seguros…', mic:'Hablar por micrófono', listening:'Escuchando… Habla con naturalidad.',
    heard:'Entendido. Preparando tu respuesta…', unavailable:'Tu navegador no permite usar el micrófono aquí. Puedes escribir tu pregunta.',
    denied:'El micrófono está bloqueado. Puedes habilitarlo en los permisos del navegador o escribir tu pregunta.',
    voiceOn:'Respuestas por voz activadas.', voiceOff:'Respuestas por voz desactivadas.',
    voiceReady:'Toca el micrófono: la asistente te recibirá y te guiará.', connecting:'Conectando con la asistente…',
    connected:'Toca el micrófono y habla. Al hacer una pausa, envío tu pregunta automáticamente.', thinking:'Pensando…', speaking:'La asistente está hablando…',
    ended:'Conversación de voz finalizada.', sessionLimit:'La conversación de voz terminó al llegar a 3 minutos.',
    realtimeError:'No se pudo abrir la voz natural. Puedes escribir tu pregunta.', stopMic:'Detener escucha y enviar',
    foot:'Asistente automático. No cotiza, no determina elegibilidad ni da consejo médico. No envíes SSN, número de Medicare, diagnósticos ni datos bancarios.'
  },
  en: {
    name:'Family Protection Assistant', sub:'AI virtual assistant', langButton:'EN', langLabel:'Cambiar a español',
    input:'Type your insurance question…', mic:'Speak using the microphone', listening:'Listening… Speak naturally.',
    heard:'Got it. Preparing your answer…', unavailable:'Your browser cannot use the microphone here. You can type your question instead.',
    denied:'Microphone access is blocked. You can allow it in your browser settings or type your question.',
    voiceOn:'Voice responses are on.', voiceOff:'Voice responses are off.',
    voiceReady:'Tap the microphone: the assistant will welcome and guide you.', connecting:'Connecting to the assistant…',
    connected:'Tap the microphone and speak. When you pause, I will send your question automatically.', thinking:'Thinking…', speaking:'The assistant is speaking…',
    ended:'Voice conversation ended.', sessionLimit:'The voice conversation ended after 3 minutes.',
    realtimeError:'Natural voice could not start. You can type your question.', stopMic:'Stop listening and send',
    foot:'Automated assistant. It does not quote, determine eligibility, or give medical advice. Do not send Social Security, Medicare, medical, or banking information.'
  }
};
const FREE_REPLIES = {
  es: {
    vida:'El seguro de vida puede ayudar a proteger ingresos, deudas, educación y gastos finales. La cantidad y el tipo de cobertura requieren una revisión humana de tus prioridades y de las condiciones aplicables.',
    vida_necesidad:'La regla de diez veces el ingreso es solo un punto de partida. Una revisión más completa suma hipoteca, deudas, educación, gastos finales y otros objetivos, y después resta la cobertura existente y los activos líquidos disponibles. ¿Quieres abrir la calculadora educativa de necesidad de seguro de vida?',
    vida_tipo:'El seguro temporal puede servir para necesidades de duración definida, como años de crianza, hipoteca o reemplazo de ingresos. El permanente está diseñado para durar mientras se cumplan las condiciones contractuales y puede incluir valor en efectivo; la comparación debe revisar costos, duración, garantías, riesgos y alternativas. ¿Quieres continuar con unas preguntas generales para ordenar tu necesidad?',
    vida_trabajo:'La cobertura de vida del trabajo puede ser útil, pero conviene confirmar cuánto ofrece, si es portable o convertible y qué ocurre al cambiar de empleo. Una cobertura individual puede complementar el beneficio laboral. ¿Deseas revisar qué responsabilidades familiares quieres proteger?',
    vida_salud:'Tener una condición de salud no significa automáticamente que no puedas obtener cobertura. Las aseguradoras y los productos aplican criterios distintos, por lo que William tendría que revisar las opciones disponibles sin prometer aprobación. ¿Quieres preparar una conversación general sin compartir diagnósticos ni medicamentos?',
    vida_revision:'Conviene revisar la póliza después de cambios importantes, como matrimonio, nacimiento de un hijo, compra de vivienda, cambio de trabajo, una deuda grande, divorcio o fallecimiento de un beneficiario. También es prudente revisar periódicamente beneficiarios y datos de contacto. ¿Quieres ver las preguntas que te ayudarán a prepararte?',
    salud:'La cobertura de salud debe revisarse según residencia, red médica, medicamentos, costos y período de inscripción aplicable. Este asistente solo ofrece orientación educativa y no determina elegibilidad.',
    salud_costos:'La prima no es el costo total. También pueden influir el deducible, los copagos, el coaseguro, el máximo de bolsillo y los servicios fuera de la red o no cubiertos. ¿Quieres abrir la calculadora educativa de costo anual de salud?',
    salud_terminos:'La prima mantiene activa la cobertura; el deducible es la cantidad aplicable que pagas antes de que el plan comparta ciertos costos; el copago es una cantidad fija y el coaseguro es un porcentaje, según las reglas del plan. ¿Quieres comparar también el máximo de bolsillo y la red?',
    salud_red:'Para confirmar si un médico está en la red, revisa el directorio actualizado del plan y confírmalo directamente con la oficina antes de recibir atención. Una oficina puede aceptar una compañía sin participar en todos sus planes. ¿Quieres saber qué otros detalles conviene verificar antes de inscribirte?',
    salud_bolsillo:'El máximo de bolsillo limita determinados gastos cubiertos y aplicables durante el año, normalmente dentro de la red. La prima, ciertos gastos fuera de la red y servicios no cubiertos pueden quedar fuera; no es el máximo absoluto de todo gasto médico. ¿Quieres revisar un ejemplo en la calculadora?',
    medicare:'Medicare tiene reglas y períodos propios. Para información oficial consulta Medicare.gov; cualquier conversación sobre planes debe continuar con un agente debidamente certificado y materiales aprobados.',
    medicare_65:'Cumplir 65 años no significa que cualquier plan sea adecuado ni que todas las personas sigan el mismo proceso. La inscripción y la coordinación con cobertura laboral requieren una revisión individual; algunas personas también pueden ser elegibles antes por discapacidad, enfermedad renal terminal o ALS. ¿Quieres preparar las preguntas para hablar con un agente certificado?',
    retiro:'Las anualidades son contratos a largo plazo y pueden incluir límites de liquidez o cargos por retiro. Antes de considerar una opción deben revisarse objetivos, plazo, riesgos, situación financiera y alternativas.',
    retiro_ingreso:'Algunos contratos ofrecen modalidades de ingreso de por vida, pero no toda anualidad ni todo retiro produce el mismo resultado. Las garantías dependen del contrato, las elecciones, los cargos y la capacidad de pago de la aseguradora emisora. ¿Quieres revisar qué factores pueden afectar el monto?',
    retiro_liquidez:'La posibilidad de retirar dinero depende del contrato. Puede haber períodos y cargos de rescate, límites de retiro, ajustes o consecuencias fiscales; antes de decidir conviene confirmar por escrito cuánto es líquido en distintos momentos. ¿Quieres continuar con una revisión general de tus objetivos y plazo?',
    retiro_indice:'Una anualidad indexada no necesariamente invierte directamente en el índice. El interés suele acreditarse mediante una fórmula vinculada en parte a un índice y puede aplicar participación, tope, margen, período y otras reglas contractuales. ¿Quieres saber qué documentos y condiciones deben compararse?',
    retiro_cuatro:'La regla del 4 % es una hipótesis de planificación, no una garantía. El resultado puede cambiar por rendimientos, inflación, impuestos, comisiones, duración del retiro y secuencia de pérdidas. ¿Quieres probar distintos supuestos en la calculadora educativa?',
    contacto: AUTORIZADO ? 'Puedo ayudarte a preparar una conversación con William. Elige “Ver horarios” o abre el formulario; no compartas datos sensibles en este chat.' : 'Puedes escribirle a William por WhatsApp para una pregunta general. Mientras el sitio esté en modo educativo, el asistente no solicita ni negocia seguros.',
    fallback:'No quiero adivinar una respuesta. Puedo orientarte sin costo sobre seguro de vida, cobertura de salud, Medicare o retiro y anualidades. Elige el tema más cercano y te haré una sola pregunta para ayudarte a avanzar.'
  },
  en: {
    vida:'Life insurance may help protect income, debts, education goals, and final expenses. The amount and type of coverage require a human review of your priorities and the applicable terms.',
    vida_necesidad:'Ten times income is only a starting point. A fuller review adds mortgage debt, other debts, education, final expenses, and other goals, then subtracts existing coverage and liquid assets that would truly be available. Would you like to open the educational life insurance needs calculator?',
    vida_tipo:'Term insurance can address needs with a defined duration, such as child-rearing years, a mortgage, or income replacement. Permanent insurance is designed to continue while contractual conditions are met and may include cash value; compare cost, duration, guarantees, risks, and alternatives. Would you like to answer a few general questions to organize your need?',
    vida_trabajo:'Employer life insurance can be useful, but confirm the amount, portability, conversion options, and what happens if you leave the job. Individual coverage may complement the workplace benefit. Would you like to review the family responsibilities you want to protect?',
    vida_salud:'A health condition does not automatically mean coverage is unavailable. Insurers and products use different criteria, so William would need to review available options without promising approval. Would you like to prepare a general conversation without sharing diagnoses or medications?',
    vida_revision:'Reviewing a policy can be important after marriage, a birth, a home purchase, a job change, a major new debt, divorce, or a beneficiary’s death. Beneficiaries and contact information should also be checked periodically. Would you like to see the questions that can help you prepare?',
    salud:'Health coverage should be reviewed based on residence, provider network, prescriptions, costs, and the applicable enrollment period. This assistant provides education only and does not determine eligibility.',
    salud_costos:'The premium is not the total cost. The deductible, copays, coinsurance, out-of-pocket maximum, and noncovered or out-of-network services may also matter. Would you like to open the educational annual health cost calculator?',
    salud_terminos:'The premium keeps coverage active; the deductible is the applicable amount paid before the plan shares certain costs; a copay is a fixed amount and coinsurance is a percentage under the plan’s rules. Would you like to compare the out-of-pocket maximum and provider network too?',
    salud_red:'To confirm whether a doctor is in network, use the plan’s current directory and verify directly with the office before receiving care. An office may accept an insurer without participating in every plan. Would you like to review other details to verify before enrollment?',
    salud_bolsillo:'The out-of-pocket maximum limits certain covered and applicable annual expenses, generally in network. Premiums and some out-of-network or noncovered expenses may be excluded, so it is not an absolute cap on all medical spending. Would you like to review an example in the calculator?',
    medicare:'Medicare has its own eligibility and enrollment rules. Use Medicare.gov for official information; discussions about specific plans must continue with a properly certified agent using approved materials.',
    medicare_65:'Turning 65 does not mean every plan is suitable or that everyone follows the same process. Enrollment and coordination with employer coverage require an individual review; some people may qualify earlier due to disability, ESRD, or ALS. Would you like to prepare questions for a certified agent?',
    retiro:'Annuities are long-term contracts and may include liquidity limits or surrender charges. Goals, time horizon, risks, finances, and alternatives should be reviewed before considering an option.',
    retiro_ingreso:'Some contracts offer lifetime income options, but not every annuity or withdrawal produces the same result. Guarantees depend on the contract, elections, charges, and the claims-paying ability of the issuing insurer. Would you like to review the factors that may affect the amount?',
    retiro_liquidez:'Access to money depends on the contract. Surrender periods and charges, withdrawal limits, adjustments, or tax consequences may apply; confirm in writing how much is liquid at different times. Would you like to continue with a general review of your goals and time horizon?',
    retiro_indice:'An indexed annuity does not necessarily invest directly in an index. Interest is generally credited using a formula linked in part to an index and may use participation rates, caps, margins, periods, and other contract rules. Would you like to know which documents and conditions should be compared?',
    retiro_cuatro:'The 4% rule is a planning assumption, not a guarantee. Results can change with returns, inflation, taxes, fees, retirement length, and the sequence of losses. Would you like to test different assumptions in the educational calculator?',
    contacto: AUTORIZADO ? 'I can help you prepare a conversation with William. Choose “View times” or open the contact form, and do not share sensitive information in this chat.' : 'You can message William on WhatsApp with a general question. While this site is in educational mode, the assistant does not solicit or negotiate insurance.',
    fallback:'I do not want to guess. I can provide no-cost guidance about life insurance, health coverage, Medicare, or retirement and annuities. Choose the closest topic and I will ask one question to help you move forward.'
  }
};

function copy(){ return BOT_COPY[V.lang.startsWith('en') ? 'en' : 'es']; }
function speak(text){
  /* La voz audible del asistente debe venir únicamente de OpenAI Realtime.
     No usar SpeechSynthesis del navegador. */
  if (!V.output || !text) return;
  if (R.active && R.audio) {
    R.audio.muted = false;
    R.audio.play().catch(()=>{});
  }
}

let ultimoTexto = '';
function say(text, me, alert){
  const d = document.createElement('div');
  d.className = 'msg ' + (me ? 'msg--me' : alert ? 'msg--bot msg--alert' : 'msg--bot');
  d.textContent = text;
  botLog.appendChild(d); botLog.scrollTop = botLog.scrollHeight;
  if (!me) { ultimoTexto = text || ''; speak(text); }
}
/* La pausa de "escribiendo" se ajusta al largo del mensaje que viene:
   un mensaje corto aparece casi enseguida y uno largo tarda un poco más,
   como escribiría una persona. Se mantiene entre 0.45s y 1.4s para que
   nunca se sienta lento. */
function typing(cb){
  const t = document.createElement('div');
  t.className = 'msg msg--bot typing'; t.innerHTML = '<i></i><i></i><i></i>';
  botLog.appendChild(t); botLog.scrollTop = botLog.scrollHeight;
  bot.classList.add('is-thinking');
  const largo = (ultimoTexto || '').length;
  const espera = slow ? 0 : Math.min(1400, Math.max(450, 380 + largo * 7));
  setTimeout(() => { t.remove(); bot.classList.remove('is-thinking'); cb(); }, espera);
}
function buttons(list){
  botOpts.innerHTML = '';
  list.forEach(o => {
    const b = document.createElement('button');
    b.textContent = o.label;
    if (o.go) b.className = 'go';
    b.onclick = o.fn;
    botOpts.appendChild(b);
  });
}
const nodeById = id => BOT_TREE.nodes.find(n => n.id === id);

function evalCondition(cond){
  // Soporta: campo == 'valor' unido por ||
  return cond.split('||').some(part => {
    const m = part.trim().match(/^(\w+)\s*==\s*'([^']*)'$/);
    return m ? S.data[m[1]] === m[2] : false;
  });
}

function go(id){
  if (!id) return;
  const n = nodeById(id);
  if (!n) return;
  S.node = n;
  if (n.tags) n.tags.forEach(t => S.tags.push(t));

  switch (n.type) {
    case 'message':
      say(n.text);
      if (n.end_conversation) { S.ended = true; closeOptions(); return; }
      botOpts.innerHTML = '';
      typing(() => go(n.next));
      return;

    case 'conditional_message': {
      const branch = evalCondition(n.condition) ? n.if_true : n.if_false;
      say(branch.text);
      if (branch.add_tags) branch.add_tags.forEach(t => S.tags.push(t));
      botOpts.innerHTML = '';
      typing(() => go(n.next));
      return;
    }

    case 'single_choice':
    case 'single_choice_optional':
      say(n.question);
      buttons(n.options.map(o => ({ label:o.label, fn:() => {
        say(o.label, true);
        S.data[n.field] = o.value;
        if (o.metadata) Object.assign(S.meta, o.metadata);
        botOpts.innerHTML = '';
        typing(() => go(o.next || n.next));
      }})));
      return;

    case 'multi_choice':
      say(n.question);
      S.multi = new Set();
      renderMulti(n);
      return;

    case 'yes_no':
      say(n.question);
      buttons([
        { label:'Sí', fn:() => { say('Sí', true); S.data[n.field] = true; botOpts.innerHTML=''; typing(() => go(n.yes_next)); } },
        { label:'Ahora no', fn:() => { say('Ahora no', true); S.data[n.field] = false; botOpts.innerHTML=''; typing(() => go(n.no_next)); } }
      ]);
      return;

    case 'consent':
      if (!AUTORIZADO) {
        say('Este sitio está actualmente en modo educativo. No recopilamos datos para solicitar, negociar ni vender seguros; puedes enviarle a William una pregunta general por WhatsApp.');
        buttons([
          { label:'Enviar una pregunta general', go:true, fn:openWhatsApp },
          { label:'Continuar sin dejar datos', fn:() => { botOpts.innerHTML=''; typing(() => go(n.decline_next)); } }
        ]);
        return;
      }
      say(n.text);
      buttons([
        { label:'Autorizo el contacto', go:true, fn:() => { say('Autorizo el contacto', true); S.data[n.field] = true; botOpts.innerHTML=''; typing(() => go(n.accept_next)); } },
        { label:'Prefiero no autorizar', fn:() => { say('Prefiero no autorizar', true); S.data[n.field] = false; botOpts.innerHTML=''; typing(() => go(n.decline_next)); } }
      ]);
      return;

    case 'contact_capture':
      if (!AUTORIZADO) {
        say('No recopilamos datos para una solicitud de seguro mientras el sitio está en modo educativo. Puedes escribirle a William únicamente con una pregunta general.');
        buttons([
          { label:'Escribir una pregunta general', go:true, fn:openWhatsApp },
          { label:'Continuar', fn:() => { botOpts.innerHTML=''; typing(() => go(n.next)); } }
        ]);
        return;
      }
      say('Para que un agente autorizado te contacte, déjanos tu nombre y un medio de contacto en el formulario. No pedimos datos médicos ni financieros.');
      buttons([
        { label:'Abrir el formulario', go:true, fn:() => { botOpts.innerHTML=''; goToSection('#cotizar'); typing(() => go(n.next)); } },
        { label:'Continuar sin dejar datos', fn:() => { botOpts.innerHTML=''; typing(() => go(n.next)); } }
      ]);
      return;

    case 'score_and_route': {
      const score = scoreLead();
      const dest = route(score);
      say(n.response);
      typing(() => {
        if (dest === 'medicare-certified-agent-queue') {
          say('Tu caso se dirige a un agente debidamente certificado en Medicare, que revisará elegibilidad y fechas con materiales aprobados.');
        } else if (dest === 'education-nurture') {
          say('Puedes explorar las guías y calculadoras sin compartir datos personales. Aquí estaremos cuando quieras avanzar.');
        }
        buttons(AUTORIZADO
          ? [{ label:'Ver horarios disponibles', go:true, fn:() => goToSection('#agenda') },
             { label:'Usar las calculadoras', fn:() => goToSection('#calculadoras') }]
          : [{ label:'Usar las calculadoras', go:true, fn:() => goToSection('#calculadoras') },
             { label:'Ver las preguntas frecuentes', fn:() => goToSection('#preguntas') }]);
        S.ended = true;
      });
      return;
    }
  }
}

function renderMulti(n){
  botOpts.innerHTML = '';
  n.options.forEach(o => {
    const b = document.createElement('button');
    b.textContent = o.label;
    b.setAttribute('aria-pressed', S.multi.has(o.value));
    b.onclick = () => {
      S.multi.has(o.value) ? S.multi.delete(o.value) : S.multi.add(o.value);
      renderMulti(n);
    };
    botOpts.appendChild(b);
  });
  const done = document.createElement('button');
  done.textContent = 'Continuar'; done.className = 'go';
  done.onclick = () => {
    const vals = [...S.multi];
    S.data[n.field] = vals;
    say(vals.length ? n.options.filter(o => vals.includes(o.value)).map(o => o.label).join(', ') : 'Continuar', true);
    botOpts.innerHTML = '';
    typing(() => go(n.next));
  };
  botOpts.appendChild(done);
}

function scoreLead(){
  // Solo intención y disponibilidad. Edad, salud y estado de Medicare quedan excluidos por diseño.
  const ex = BOT_TREE.lead_scoring.excluded_fields;
  return BOT_TREE.lead_scoring.rules.reduce((sum, r) => {
    if (ex.includes(r.field)) return sum;
    return S.data[r.field] === r.equals ? sum + r.points : sum;
  }, 0);
}
function route(score){
  if (S.tags.includes('medicare-specialist-required')) return 'medicare-certified-agent-queue';
  if (score >= BOT_TREE.lead_scoring.hot_threshold) return 'priority-human-calendar';
  if (score >= BOT_TREE.lead_scoring.warm_threshold) return 'standard-human-calendar';
  return 'education-nurture';
}
function goToSection(hash){
  const goal = { vida:'Seguro de vida', salud:'Cobertura de salud', retiro:'Retiro o anualidades' }[S.data.primary_goal];
  if (goal) prefill(goal);
  irASeccion(hash);
}
function closeOptions(){
  buttons(AUTORIZADO
    ? [{ label:'Usar las calculadoras', fn:() => goToSection('#calculadoras') },
       { label:'Ver horarios disponibles', go:true, fn:() => goToSection('#agenda') }]
    : [{ label:'Usar las calculadoras', go:true, fn:() => goToSection('#calculadoras') },
       { label:'Ver las preguntas frecuentes', fn:() => goToSection('#preguntas') }]);
}

/* Interrupciones globales sobre texto libre */
function checkInterrupts(text){
  const low = text.toLowerCase();
  for (const g of BOT_TREE.global_interrupts) {
    if (g.match.some(m => low.includes(m))) { say(g.response, false, true); return true; }
  }
  if (V.lang.startsWith('en') && /(chest pain|can'?t breathe|cannot breathe|suicid|hurt myself|stroke|medical emergency)/i.test(text)) {
    say('This may require immediate attention. Call 911 or go to an emergency department now. Do not wait for an evaluation through this chat.', false, true);
    return true;
  }
  if (V.lang.startsWith('en') && /(social security|medicare number|credit card|bank account)/i.test(text)) {
    say('For your protection, do not send Social Security, Medicare, credit card, or bank account numbers in this chat.', false, true);
    return true;
  }
  return false;
}

function topicFrom(text){
  const low = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if (/(diez veces|10 veces|ten times|cuanto seguro|how much life)/.test(low)) return 'vida_necesidad';
  if (/(temporal|permanente|term (life|insurance)|permanent (life|insurance)|whole life)/.test(low)) return 'vida_tipo';
  if (/(seguro.*trabajo|trabajo.*seguro|empleador|employer|workplace|cambio de empleo|leave.*job)/.test(low)) return 'vida_trabajo';
  if (/(condicion de salud|problema de salud|health condition|enfermedad.*seguro de vida)/.test(low)) return 'vida_salud';
  if (/(revisar.*poliza|cambiar.*beneficiario|beneficiario|review.*policy|change.*beneficiar)/.test(low)) return 'vida_revision';
  if (/(prima.*deducible|costo.*plan|plan.*barato|costo anual|total cost|annual cost|cheapest plan)/.test(low)) return 'salud_costos';
  if (/(que (es|significa).*(prima|deducible|copago|coaseguro)|deductible|copay|coinsurance)/.test(low)) return 'salud_terminos';
  if (/(medico.*red|doctor.*red|proveedor.*red|in.?network|provider network|doctor.*network)/.test(low)) return 'salud_red';
  if (/(maximo de bolsillo|out.of.pocket maximum|out of pocket maximum)/.test(low)) return 'salud_bolsillo';
  if (/(cumplir.*65|tengo 65|turning 65|turn 65|cerca.*65|almost 65)/.test(low)) return 'medicare_65';
  if (/(ingreso.*por vida|dinero.*acabar|lifetime income|money.*run out)/.test(low)) return 'retiro_ingreso';
  if (/(retirar.*dinero|sacar.*dinero|cargo.*rescate|liquid|withdraw|surrender charge)/.test(low)) return 'retiro_liquidez';
  if (/(indexada|indice|indexed annuit|invest.*index)/.test(low)) return 'retiro_indice';
  if (/(regla.*4|4 ?%|four percent rule)/.test(low)) return 'retiro_cuatro';
  if (/(medicare|65 anos|65 years)/.test(low)) return 'medicare';
  if (/(vida|life insurance|familia|family|hipoteca|mortgage|gastos finales|final expenses)/.test(low)) return 'vida';
  if (/(salud|health|medical coverage|obamacare|aca)/.test(low)) return 'salud';
  if (/(retiro|retirement|anualidad|annuit)/.test(low)) return 'retiro';
  if (/(cita|appointment|contact|hablar con william|talk to william|telefono|phone|whatsapp)/.test(low)) return 'contacto';
  return 'fallback';
}
function baseTopic(topic){
  if (topic.startsWith('vida_')) return 'vida';
  if (topic.startsWith('salud_')) return 'salud';
  if (topic.startsWith('medicare_')) return 'medicare';
  if (topic.startsWith('retiro_')) return 'retiro';
  return topic;
}
function openWhatsApp(){
  const msg = V.lang.startsWith('en') ? 'Hello William, I visited your website and have a general question.' : 'Hola William, visité tu página y tengo una pregunta general.';
  window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
}
function contextualButtons(topic){
  const en = V.lang.startsWith('en');
  const items = [];
  if (!en && ['vida','salud','medicare','retiro'].includes(topic)) {
    const destinations = {vida:'life_need',salud:'health_coverage',medicare:'medicare_handoff',retiro:'retirement_timing'};
    items.push({label:'Continuar con preguntas',go:true,fn:()=>{botOpts.innerHTML='';typing(()=>go(destinations[topic]));}});
  }
  items.push({label:en ? 'Choose another topic' : 'Elegir otro tema',fn:showTopicMenu});
  items.push({label:en ? 'Open calculators' : 'Abrir calculadoras',fn:()=>goToSection('#calculadoras')});
  items.push(AUTORIZADO
    ? {label:en ? 'View available times' : 'Ver horarios',go:true,fn:()=>goToSection('#agenda')}
    : {label:en ? 'Message William' : 'Escribirle a William',go:true,fn:openWhatsApp});
  buttons(items);
}
function respondTopic(topic){
  const lang = V.lang.startsWith('en') ? 'en' : 'es';
  say(FREE_REPLIES[lang][topic] || FREE_REPLIES[lang].fallback);
  contextualButtons(baseTopic(topic));
}
function showTopicMenu(){
  const en = V.lang.startsWith('en');
  if (en) say('What would you like to understand?');
  else say('¿Sobre qué tema deseas orientación?');
  buttons([
    {label:en?'Life insurance':'Seguro de vida',fn:()=>respondTopic('vida')},
    {label:en?'Health coverage':'Cobertura de salud',fn:()=>respondTopic('salud')},
    {label:'Medicare',fn:()=>respondTopic('medicare')},
    {label:en?'Retirement and annuities':'Retiro y anualidades',fn:()=>respondTopic('retiro')},
    {label:en?'Talk to William':'Hablar con William',go:true,fn:()=>respondTopic('contacto')}
  ]);
}
function startEnglish(){
  say('Welcome. I am William Pérez-Mederos’s virtual assistant. I can provide general educational information and help you prepare a conversation with William. I am not an insurer and cannot quote or determine eligibility.');
  showTopicMenu();
}
function resetConversation(){
  stopRealtime('');
  V.speechId++; bot.classList.remove('is-speaking','is-listening','is-thinking');
  /* SpeechSynthesis del navegador desactivado. */
  Object.keys(S.data).forEach(k=>delete S.data[k]);
  S.tags.length=0; Object.keys(S.meta).forEach(k=>delete S.meta[k]);
  S.started=false; S.node=null; S.multi=new Set(); S.ended=false;
  botLog.innerHTML=''; botOpts.innerHTML=''; ultimoTexto='';
}
function syncLanguage(){
  const c=copy(), en=V.lang.startsWith('en');
  $('#botName').textContent=c.name; $('#botSub').textContent=c.sub;
  $('#botLang').textContent=c.langButton; $('#botLang').setAttribute('aria-label',c.langLabel);
  $('#botInput').placeholder=c.input;
  $('#botFoot').textContent=c.foot; $('#botSend').setAttribute('aria-label',en?'Send':'Enviar');
  $('#botClose').setAttribute('aria-label',en?'Close assistant':'Cerrar asistente');
  syncVoiceControls();
}
function sendFree(){
  const el = $('#botInput'), text = el.value.trim();
  if (!text) return;
  el.value = '';
  if (R.active && R.dc?.readyState==='open') {
    if (checkInterrupts(text)) { say(text,true); botOpts.innerHTML=''; S.ended=true; return; }
    sendRealtimeText(text);
    return;
  }
  say(text, true);
  if (checkInterrupts(text)) { botOpts.innerHTML = ''; S.ended = true; return; }
  typing(() => {
    respondTopic(topicFrom(text));
  });
}
$('#botSend').onclick = sendFree;
$('#botInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendFree(); });

$('#botLang').onclick = () => {
  V.lang = V.lang.startsWith('es') ? 'en-US' : 'es-US';
  if (V.recognition && V.listening) V.recognition.stop();
  resetConversation(); syncLanguage();
  if (bot.classList.contains('is-open')) {
    S.started=true;
    V.lang.startsWith('en') ? startEnglish() : go(BOT_TREE.start_node);
  }
};

function syncVoiceControls(){
  const c=copy();
  const micLabel=R.active&&R.mode==='voice'?(R.micMuted?c.mic:c.stopMic):R.connecting?c.connecting:c.mic;
  $('#botMic').setAttribute('aria-label',micLabel); $('#botMic').title=micLabel;
  const en=V.lang.startsWith('en');
  const vozLabel=V.output?(en?'Mute spoken answers':'Silenciar respuestas por voz'):(en?'Turn on spoken answers':'Activar respuestas por voz');
  $('#botVoice').setAttribute('aria-label',vozLabel); $('#botVoice').title=vozLabel;
  $('#botVoice').setAttribute('aria-pressed',String(V.output));
  $('#botVoice').classList.toggle('is-off',!V.output);
}
function setVoiceState(state,status){
  if(R.state===state&&$('#botVoiceStatus').textContent===(status||'')){syncVoiceControls();return;}
  R.state=state;
  bot.classList.remove('is-speaking','is-listening','is-thinking');
  $('#botMic').classList.remove('is-listening','is-connected');
  if(state==='listening'){
    bot.classList.add('is-listening'); $('#botMic').classList.add('is-listening');
  }else if(state==='thinking'){
    bot.classList.add('is-thinking'); $('#botMic').classList.add('is-connected');
  }else if(state==='speaking'){
    bot.classList.add('is-speaking'); $('#botMic').classList.add('is-connected');
  }else if(state==='connecting') $('#botMic').classList.add('is-connected');
  $('#botVoiceStatus').textContent=status||'';
  syncVoiceControls();
}
function stopRealtime(status){
  const hadSession=R.active||R.connecting||R.pc||R.stream;
  R.generation++;
  if(R.timer) clearTimeout(R.timer);
  if(R.watch) clearInterval(R.watch);
  if(R.responseWatch) clearTimeout(R.responseWatch);
  if(R.sessionWatch) clearTimeout(R.sessionWatch);
  const dc=R.dc, pc=R.pc, stream=R.stream, audio=R.audio;
  if(V.recognition&&V.listening){ try{V.recognition.abort();}catch(_){} }
  V.listening=false; V.recognitionMode=''; V.lastTranscript=''; V.recognitionSent=false;
  R.dc=null; R.pc=null; R.stream=null; R.audio=null; R.timer=null; R.watch=null; R.sender=null; R.responseWatch=null; R.sessionWatch=null; R.greeted=false; R.responsePending=false; R.recording=false; R.switching=false; R.mode=''; R.micMuted=false;
  sesionAudio('auto');
  R.active=false; R.connecting=false;
  try{if(dc)dc.close();}catch(_){}
  try{if(pc)pc.close();}catch(_){}
  if(stream) stream.getTracks().forEach(track=>track.stop());
  if(audio){audio.pause();audio.srcObject=null;audio.remove();}
  if(hadSession||status) setVoiceState('',status||''); else syncVoiceControls();
}
function handleRealtimeEvent(raw,generation){
  if(generation!==R.generation) return;
  let event;
  try{event=JSON.parse(raw.data);}catch(_){return;}
  const c=copy();
  if(event.type==='session.updated'&&!R.greeted){
    if(R.sessionWatch) clearTimeout(R.sessionWatch);
    R.sessionWatch=null;
    R.greeted=true;
    R.dc.send(JSON.stringify({type:'response.create',response:{instructions:proactiveGreeting()}}));
  }
  else if(event.type==='input_audio_buffer.speech_started'){
    R.recording=true;
    setVoiceState('listening',c.listening);
  }
  else if(event.type==='input_audio_buffer.speech_stopped'){
    setVoiceState('thinking',c.thinking);
  }
  else if(event.type==='response.created'){
    R.responsePending=true;
    if(R.responseWatch) clearTimeout(R.responseWatch);
    R.responseWatch=null;
    setVoiceState('thinking',c.thinking);
  }
  else if(event.type==='output_audio_buffer.started'){
    /* Mantener la pista WebRTC enviando audio. Safari puede no reanudarla
       después de cambiar track.enabled durante la bienvenida. */
    setVoiceState('speaking',c.speaking);
  }
  else if(event.type==='response.output_audio.delta') setVoiceState('speaking',c.speaking);
  else if(event.type==='output_audio_buffer.stopped'||event.type==='output_audio_buffer.cleared'){
    if(R.active && R.mode==='voice' && !R.micMuted) setVoiceState('listening',c.listening);
    else setVoiceState('',c.connected);
  }
  else if(event.type==='response.done'){
    R.responsePending=false;
    if(R.active && R.mode==='voice' && !R.micMuted) setVoiceState('listening',c.listening);
    else if(R.state==='thinking') setVoiceState('',c.connected);
  }
  else if(event.type==='conversation.item.input_audio_transcription.completed'&&event.transcript&&event.transcript.trim()){
    /* Lo que la asistente entendió aparece en el chat como mensaje del visitante */
    say(event.transcript.trim(),true);
  }
  else if(event.type==='response.output_audio_transcript.done'&&event.transcript) say(event.transcript);
  else if(event.type==='error'){
    /* Los errores de un turno no cierran la conversación: si la conexión
       se cae de verdad, lo detectan dc.onclose y connectionState. */
    console.warn('Realtime API error',event.error||event);
    if(event.error?.message&&R.state==='thinking') $('#botVoiceStatus').textContent=c.realtimeError;
  }
}

/* ═══ VOZ EN iPHONE / iPAD: sesión de audio y micrófono vigilado ═══ */
function sesionAudio(tipo){
  try{ if(navigator.audioSession) navigator.audioSession.type=tipo; }catch(_){}
}
function configuracionVoz(){
  return {
    type:'realtime',
    model:'gpt-realtime-2.1-mini',
    instructions:realtimeInstructions(),
    output_modalities:['audio'],
    audio:{
      output:{voice:'coral'},
      input:{
        noise_reduction:{type:'near_field'},
        turn_detection:{
          type:'semantic_vad',
          eagerness:'auto',
          create_response:true,
          interrupt_response:true
        }
      }
    }
  };
}
async function recuperarMic(generation){
  if(generation!==R.generation||!R.sender||R.recuperando) return;
  if(Date.now()-(R.ultimaRecuperacion||0)<8000) return;
  R.recuperando=true; R.ultimaRecuperacion=Date.now();
  const en=V.lang.startsWith('en');
  $('#botVoiceStatus').textContent=en?'Reconnecting your microphone…':'Reconectando tu micrófono…';
  try{
    const nuevo=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    if(generation!==R.generation||!R.sender){nuevo.getTracks().forEach(t=>t.stop());return;}
    const pista=nuevo.getAudioTracks()[0];
    await R.sender.replaceTrack(pista);
    if(R.stream) R.stream.getTracks().forEach(t=>t.stop());
    R.stream=nuevo; vigilarPista(pista,generation);
    $('#botVoiceStatus').textContent=copy().connected;
  }catch(err){
    console.warn('No se pudo recuperar el micrófono',err);
    $('#botVoiceStatus').textContent=en
      ?'I cannot hear your microphone. Check that it is allowed for this site and tap the microphone again.'
      :'No me llega el sonido de tu micrófono. Revisa que esté permitido para este sitio y toca el micrófono otra vez.';
  }finally{ R.recuperando=false; }
}
function vigilarPista(pista,generation){
  /* iOS puede "silenciar" o cerrar la captura (una llamada, otra app, Siri) */
  pista.onended=()=>recuperarMic(generation);
  pista.onmute=()=>{ setTimeout(()=>{ if(pista.muted) recuperarMic(generation); },1500); };
}
function vigilarEnvio(pc,generation){
  /* Si el micrófono deja de enviar audio unos segundos,
     se intenta reconectar sin cortar la conversación. */
  let previo=-1, quietos=0;
  R.watch=setInterval(async()=>{
    if(generation!==R.generation||!R.active){clearInterval(R.watch);return;}
    const abierto=R.stream&&R.stream.getAudioTracks().some(t=>t.readyState==='live');
    if(!abierto){quietos=0;return;}
    try{
      let enviados=-1;
      (await pc.getStats()).forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='audio') enviados=r.packetsSent; });
      if(enviados<0) return;
      quietos=(enviados===previo)?quietos+1:0; previo=enviados;
      if(quietos>=3){ quietos=0; recuperarMic(generation); }
    }catch(_){}
  },1500);
}

function realtimeInstructions(){
  return `Eres la asistente virtual pública del sitio web de William Pérez-Mederos, agente de seguros con licencia 2-15 en Florida. Atiendes a cualquier visitante que entre al website para conocer y entender mejor seguros y los servicios que William presenta en su página.

# Tu función
- Eres una recepcionista y orientadora virtual para visitantes del sitio, no una herramienta interna para William ni para empleados.
- Ayuda a la persona a entender, con lenguaje sencillo, seguro de vida, cobertura de salud, Medicare, retiro y anualidades.
- Si pregunta quién es William o cómo contactarlo, explica brevemente que es agente de seguros en Florida y puede atender en español. Puedes indicar el teléfono y WhatsApp publicados en el sitio: (786) 354-8796.
- Si la persona quiere hablar con William, invítala a usar WhatsApp, llamar o los botones de contacto del website.
- No inventes aseguradoras, nombramientos, precios, beneficios, disponibilidad de productos ni datos que no estén confirmados.

# Idioma
- Usa español por defecto.
- No cambies al inglés por el acento del visitante ni por una palabra aislada en inglés.
- Cambia a inglés solamente si el visitante lo pide o mantiene claramente la conversación en inglés.

# Voz, acento y ritmo
- En español usa una voz femenina, cálida, cercana y profesional.
- Habla con español latino natural y una influencia cubana habanera suave, propia de una conversación cotidiana en Miami, sin caricaturas ni exageraciones.
- Mantén el acento consistente; evita sonar como locutora automática o lectura de texto.
- Usa ritmo conversacional, pausas naturales, entonación amable y dicción clara.
- Responde normalmente en dos o tres frases breves y haz una sola pregunta a la vez.

# Conversación
- Si es el primer turno, saluda brevemente y pregunta qué desea conocer: seguro de vida, salud o Medicare, o retiro y anualidades.
- Responde primero la pregunta concreta del visitante. Después, si ayuda, haz una sola pregunta de seguimiento.
- Si la consulta es vaga, ayúdala a escoger tema en vez de interrogarla.
- No repitas tu presentación ni advertencias en cada respuesta.

# Límites
El sitio está en modo educativo. Explica conceptos generales y comparaciones educativas, pero no cotices primas, no recomiendes un producto específico, no prometas cobertura o aprobación, no completes solicitudes y no afirmes representar a una aseguradora ni al gobierno. Cuando una pregunta requiera revisar elegibilidad, costos, cobertura o una póliza concreta, explica qué factores suelen importar e indica que William debe revisarla personalmente. Si una regla, fecha o cifra puede haber cambiado, no la inventes: recomienda verificarla en la fuente oficial correspondiente.

No solicites ni repitas números de Seguro Social, Medicare, cuentas bancarias, tarjetas, contraseñas ni detalles médicos sensibles. Si alguien comparte esos datos, pídele que deje de hacerlo. Para emergencias médicas o peligro inmediato, indica llamar al 911. Aclara cuando corresponda que eres una asistente virtual y que la información es educativa, no asesoría legal, médica o financiera.`;
}

function proactiveGreeting(){
  return V.lang.startsWith('en')
    ? 'Greet the visitor warmly and briefly. Introduce yourself as William’s virtual educational assistant, then ask one concise question offering these choices: life insurance, health coverage or Medicare, or retirement and annuities. Do not add a long disclaimer.'
    : 'Di exactamente una bienvenida breve y natural, con tono cálido: “Hola, soy la asistente virtual de William Pérez-Mederos. Estoy aquí para ayudarte a conocer y entender mejor tus opciones de seguros.” Luego pregunta: “¿Qué te gustaría conocer: seguro de vida, salud o Medicare, o retiro y anualidades?” No añadas una advertencia larga.';
}

async function startRealtime(){
  const c=copy();
  V.output=true;
  try{sessionStorage.setItem('wpVozRespuestas','1');}catch(_){}
  if(R.audio){ R.audio.muted=false; R.audio.volume=1; }
  if(R.active){toggleRealtimeMic();return;}
  if(R.connecting) return;
  if(!window.RTCPeerConnection||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    $('#botVoiceStatus').textContent=c.realtimeError; return;
  }
  if(V.recognition&&V.listening) V.recognition.stop();
  V.speechId++;
  R.connecting=true;
  const generation=++R.generation;
  setVoiceState('connecting',c.connecting);
  /* iOS 17+: se declara desde el toque que vamos a hablar y escuchar a la vez,
     así Safari no cambia de modo a mitad de la conversación. */
  sesionAudio('play-and-record');

  try{
    const pc=new RTCPeerConnection(); R.pc=pc;
    const audio=document.createElement('audio');
    audio.autoplay=true; audio.playsInline=true; audio.hidden=true; audio.setAttribute('aria-hidden','true');
    audio.setAttribute('playsinline',''); audio.setAttribute('webkit-playsinline','');
    audio.muted=false; audio.volume=1;
    document.body.appendChild(audio); R.audio=audio;
    /* Se "desbloquea" el reproductor dentro del mismo toque (requisito de iOS) */
    try{ const p=audio.play(); if(p&&p.catch) p.catch(()=>{}); }catch(_){}
    pc.ontrack=e=>{
      audio.srcObject=e.streams[0];
      audio.muted=false; audio.volume=1;
      const reproducir=()=>audio.play().catch(()=>{
        $('#botVoiceStatus').textContent=V.lang.startsWith('en')?'Tap the speaker button to hear the assistant.':'Toca el botón de bocina para escuchar a la asistente.';
      });
      reproducir();
      audio.onloadedmetadata=reproducir;
      audio.oncanplay=reproducir;
    };
    pc.onconnectionstatechange=()=>{
      if(generation!==R.generation) return;
      if(pc.connectionState==='failed') stopRealtime(copy().unavailable);
    };

    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    if(generation!==R.generation){stream.getTracks().forEach(track=>track.stop());return;}
    R.stream=stream;
    stream.getAudioTracks().forEach(track=>{ R.sender=pc.addTrack(track,stream); });

    const dc=pc.createDataChannel('oai-events'); R.dc=dc;
    dc.onmessage=event=>handleRealtimeEvent(event,generation);
    dc.onopen=async()=>{
      if(generation!==R.generation) return;
      if(R.timer) clearTimeout(R.timer);
      R.connecting=false; R.active=true; R.mode='voice'; R.micMuted=false; R.recording=true;
      /* Mantener el micrófono conectado. OpenAI Realtime recibe la pista WebRTC
         y server_vad detecta automáticamente cuándo termina la pregunta. */
      dc.send(JSON.stringify({type:'session.update',session:configuracionVoz()}));
      R.sessionWatch=setTimeout(()=>{
        if(generation!==R.generation||R.greeted) return;
        stopRealtime(copy().realtimeError);
      },8000);
      setVoiceState('listening',copy().listening);
      R.timer=setTimeout(()=>stopRealtime(copy().sessionLimit),CONFIG.voiceMaxMs);
    };
    dc.onclose=()=>{
      if(generation===R.generation&&R.active) stopRealtime(copy().ended);
    };

    const offer=await pc.createOffer();
    await pc.setLocalDescription(offer);
    const controller=new AbortController();
    const connectionTimeout=setTimeout(()=>controller.abort(),20000);
    let response;
    try{
      response=await fetch(CONFIG.voiceEndpoint,{method:'POST',body:offer.sdp,headers:{'Content-Type':'application/sdp'},signal:controller.signal});
    }finally{clearTimeout(connectionTimeout);}
    const responseText=await response.text();
    if(!response.ok) throw new Error('Voice session '+response.status+': '+responseText.slice(0,160));
    if(generation!==R.generation) return;
    await pc.setRemoteDescription({type:'answer',sdp:responseText});
    R.timer=setTimeout(()=>{
      if(generation!==R.generation||!R.connecting) return;
      stopRealtime(copy().realtimeError);
    },15000);
  }catch(error){
    if(generation!==R.generation) return;
    console.error('Natural voice connection error',error);
    const denied=error&&(['NotAllowedError','PermissionDeniedError'].includes(error.name));
    stopRealtime(denied?copy().denied:'');
    if(!denied) $('#botVoiceStatus').textContent=copy().realtimeError;
  }
}

function toggleRealtimeMic(){
  if(!R.active || R.mode!=='voice') return;
  const track=R.stream&&R.stream.getAudioTracks&&R.stream.getAudioTracks()[0];
  if(!track){
    setVoiceState('',copy().unavailable);
    return;
  }
  R.micMuted=!R.micMuted;
  track.enabled=!R.micMuted;
  R.recording=!R.micMuted;
  if(R.micMuted){
    setVoiceState('',V.lang.startsWith('en')?'Microphone paused. Tap again to continue.':'Micrófono pausado. Toca otra vez para continuar.');
  }else{
    setVoiceState('listening',copy().listening);
  }
  syncVoiceControls();
}


function voiceGate(){
  if(R.active){toggleRealtimeMic();return;}
  if(R.connecting) return;
  V.output=true;
  try{
    sessionStorage.setItem('wpVozOk','1');
    sessionStorage.setItem('wpVozRespuestas','1');
  }catch(_){}
  $('#botVoiceStatus').textContent=V.lang.startsWith('en')
    ?'Opening the microphone…'
    :'Abriendo el micrófono…';
  startRealtime();
}
$('#botVoice').onclick=()=>{
  V.output=!V.output;
  try{sessionStorage.setItem('wpVozRespuestas',V.output?'1':'0');}catch(_){}
  if(R.audio){
    R.audio.muted=!V.output;
    if(V.output) R.audio.play().catch(()=>{});
  }
  $('#botVoiceStatus').textContent=V.output?copy().voiceOn:copy().voiceOff;
  syncVoiceControls();
};

function sendRealtimeText(text){
  const t=String(text||'').trim();
  if(!t||!R.active||R.dc?.readyState!=='open') return false;
  try{
    if(R.responsePending) R.dc.send(JSON.stringify({type:'response.cancel'}));
    if(R.state==='speaking') R.dc.send(JSON.stringify({type:'output_audio_buffer.clear'}));
    say(t,true);
    setVoiceState('thinking',copy().heard);
    R.dc.send(JSON.stringify({
      type:'conversation.item.create',
      item:{type:'message',role:'user',content:[{type:'input_text',text:t}]}
    }));
    R.dc.send(JSON.stringify({type:'response.create'}));
    return true;
  }catch(error){
    console.warn('Realtime text turn could not be sent',error);
    setVoiceState('',copy().realtimeError);
    return false;
  }
}

$('#botMic').onclick=voiceGate;

syncLanguage();

$('#botOpen').onclick = () => {
  const isOpen = !bot.classList.contains('is-open');
  bot.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('bot-open', isOpen);
  $('#botOpen').setAttribute('aria-expanded', isOpen);
  // El pulso del botón cumple su función una sola vez: al abrirlo, el
  // visitante ya sabe que existe y no hace falta seguir llamándole.
  $('#botOpen').classList.add('is-known');
  if (isOpen && !S.started) {
    S.started = true; V.lang.startsWith('en') ? startEnglish() : go(BOT_TREE.start_node);
    $('#botVoiceStatus').textContent=copy().voiceReady;
  }
};
$('#botClose').onclick = () => {
  bot.classList.remove('is-open'); document.body.classList.remove('bot-open');
  $('#botOpen').setAttribute('aria-expanded', false);
  if (V.recognition && V.listening) V.recognition.stop();
  stopRealtime('');
  V.speechId++; bot.classList.remove('is-speaking','is-listening','is-thinking');
  /* SpeechSynthesis del navegador desactivado. */
};
window.addEventListener('pagehide',()=>stopRealtime(''));

/* ═══════════ PANEL ═══════════ */
const LEADS = [
  { n:'M. Fernández', t:'(305) 555-0119', r:'vida',  d:'Reemplazo de ingreso', e:'Esperando documentos' },
  { n:'J. Álvarez',   t:'(786) 555-0142', r:'vida',  d:'Hipoteca y educación', e:'Revisión agendada' },
  { n:'Familia B.',   t:'(954) 555-0177', r:'salud', d:'Comparación de red',   e:'3 opciones' },
  { n:'C. Ruiz',      t:'(305) 555-0163', r:'salud', d:'Medicare',             e:'Agente certificado' },
  { n:'L. Sarmiento', t:'(786) 555-0188', r:'anual', d:'Liquidez y plazo',     e:'Ilustración pendiente' }
];
const MAP = { 'Seguro de vida':'vida','Ahorro universitario':'vida','Cobertura de salud':'salud',
  'Medicare':'salud','Retiro o anualidades':'anual' };

function addLead(p){
  LEADS.unshift({ n:p.nombre, t:p.telefono, r:MAP[p.interes] || 'vida', d:p.interes, e:'Nuevo · sin contactar' });
  if (!$('#board').hidden) renderBoard();
}
function renderBoard(){
  ['vida','salud','anual'].forEach(k => {
    const list = LEADS.filter(l => l.r === k);
    $('#n-' + k).textContent = list.length;
    $('#c-' + k).innerHTML = list.map((l,i) =>
      '<div class="lead-card"><b>' + l.n + '</b><span>' + l.t + '</span>' +
      '<div class="meta"><span>' + l.d + '</span><span>' + l.e + '</span></div>' +
      '<div class="acts"><button data-mv="' + k + '|' + i + '">Mover</button>' +
      '<button data-cl="' + k + '|' + i + '">Cerrar</button></div></div>'
    ).join('') || '<p style="color:#5A6D84;font-size:.84rem">Sin solicitudes en esta etapa.</p>';
  });
  $$('[data-mv]').forEach(b => b.onclick = () => {
    const [k,i] = b.dataset.mv.split('|');
    const l = LEADS.filter(x => x.r === k)[+i];
    l.r = k === 'vida' ? 'salud' : k === 'salud' ? 'anual' : 'vida';
    renderBoard();
  });
  $$('[data-cl]').forEach(b => b.onclick = () => {
    const [k,i] = b.dataset.cl.split('|');
    const l = LEADS.filter(x => x.r === k)[+i];
    LEADS.splice(LEADS.indexOf(l), 1);
    renderBoard();
  });
}
function checkPanel(){
  const on = location.hash === '#panel-agente' || new URLSearchParams(location.search).get('panel') === '1';
  $('#panel').classList.toggle('is-on', on);
  document.body.classList.toggle('panel-mode', on);
}
$('#pinGo').onclick = () => {
  if ($('#pin').value === CONFIG.panelPin) { $('#gate').hidden = true; $('#board').hidden = false; renderBoard(); }
  else { $('#pin').value = ''; $('#pin').placeholder = 'Clave incorrecta'; }
};
$('#pin').addEventListener('keydown', e => { if (e.key === 'Enter') $('#pinGo').click(); });
/* Salir del panel: hay que limpiar tanto el hash (#panel-agente) como el
   parámetro (?panel=1), porque cualquiera de los dos vuelve a abrirlo. */
$('#exitPanel').onclick = () => {
  const url = new URL(location.href);
  url.searchParams.delete('panel');
  url.hash = 'top';
  location.href = url.toString();
};

/* ═══════════ ARQUITECTURA DE LA PROTECCIÓN ═══════════
   Un solo IntersectionObserver activa toda la sección: añade .is-in y el
   CSS se encarga del resto (capas, anillos, tarjetas) mediante delays.
   Los contadores sí necesitan JS, con requestAnimationFrame. */
(function arquitectura(){
  const sec = document.getElementById('arquitectura');
  if (!sec) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function contar(el){
    const fin = Number(el.dataset.cuenta) || 0;
    if (reduce) { el.textContent = fin; return; }
    const dur = 1200, ini = performance.now();
    const paso = ahora => {
      const p = Math.min((ahora - ini) / dur, 1);
      // easeOutCubic: sube rápido y se asienta al final.
      el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }

  if (!('IntersectionObserver' in window)) {
    // Sin soporte: se muestra todo en su estado final, sin animación.
    sec.classList.add('is-in');
    sec.querySelectorAll('[data-cuenta]').forEach(el => { el.textContent = el.dataset.cuenta; });
    return;
  }

  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      sec.classList.add('is-in');
      // Los contadores arrancan cuando las tarjetas ya están entrando.
      setTimeout(() => sec.querySelectorAll('[data-cuenta]').forEach(contar), reduce ? 0 : 320);
      obs.disconnect();           // una sola vez por visita
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  obs.observe(sec);
})();

/* ═══════════ ACCESO DISCRETO AL PANEL ═══════════
   Tres toques seguidos en el logo del encabezado abren el panel interno.
   No hay enlace visible: un visitante no descubre la puerta por accidente
   y el sitio público no anuncia que existe un espacio privado. */
(function accesoPanel(){
  const logo = document.querySelector('.header .brand');
  if (!logo) return;
  let toques = 0, reloj = null;
  logo.addEventListener('click', e => {
    toques++;
    if (toques === 1) { reloj = setTimeout(() => { toques = 0; }, 1200); }
    if (toques >= 3) {
      e.preventDefault();
      clearTimeout(reloj); toques = 0;
      const url = new URL('./', location.href);
      url.searchParams.set('panel', '1');
      location.href = url.toString();
    }
  });
})();

/* ═══════════ CITA EN CURSO ═══════════
   Guía de conversación para usar frente al cliente. Cada pregunta está
   escrita como se dice en voz alta, no como una etiqueta de formulario.
   Nada se guarda: vive solo mientras dura la cita. */
(function citaEnCurso(){
  const CE = window.InsuranceCalculators;
  if (!CE) return;

  const GUIAS = {
    vida: {
      titulo: 'Proteger a la familia',
      preguntas: [
        { k:'annualIncome',     di:'¿Cuánto gana al año, más o menos?',            ayuda:'Un aproximado basta.', v:60000 },
        { k:'replacementYears', di:'¿Por cuántos años querría que su familia siga recibiendo ese ingreso?', ayuda:'Hasta que los hijos terminen estudios suele ser el punto de partida.', v:10 },
        { k:'mortgageBalance',  di:'¿Cuánto debe todavía de la casa?',             ayuda:'Si renta, déjelo en cero.', v:0 },
        { k:'otherDebts',       di:'¿Tiene otras deudas? Carro, tarjetas…',        ayuda:'', v:0 },
        { k:'educationGoal',    di:'¿Quisiera dejar algo para los estudios de sus hijos?', ayuda:'', v:0 },
        { k:'finalExpenses',    di:'¿Y para los gastos finales?',                   ayuda:'Un funeral en Florida ronda los $10,000–$15,000.', v:15000 },
        { k:'existingCoverage', di:'¿Tiene ya algún seguro de vida?',               ayuda:'Cuente también el del trabajo.', v:0 },
        { k:'liquidAssets',     di:'¿Cuánto tiene ahorrado que podría usarse?',     ayuda:'', v:0 },
        { k:'otherGoals',       di:'¿Alguna otra meta que quiera cubrir?',          ayuda:'', v:0 }
      ],
      fn:'lifeInsuranceNeed',
      leer: r => ({
        cifra: r.estimatedNeed,
        rotulo: 'Protección que faltaría',
        frase: r.estimatedNeed > 0
          ? 'Con lo que me contó, faltarían alrededor de esta cantidad para que su familia mantenga su nivel de vida.'
          : 'Con lo que me contó, sus recursos actuales ya cubrirían lo que conversamos.'
      })
    },
    salud: {
      titulo: 'Cobertura médica',
      preguntas: [
        { k:'monthlyPremium',          di:'¿Cuánto paga al mes por su plan?', ayuda:'Si no tiene, pruebe con un estimado.', v:180 },
        { k:'expectedAllowedCharges',  di:'¿Cuánto cree que usaría de médico en el año?', ayuda:'Consultas, exámenes, terapias.', v:6000 },
        { k:'deductible',              di:'¿Cuál es su deducible?', ayuda:'Lo que paga antes de que el plan empiece a cubrir.', v:3000 },
        { k:'coinsuranceRate',         di:'¿Qué porcentaje le toca después del deducible?', ayuda:'Normalmente 20% o 30%.', v:20 },
        { k:'annualCopays',            di:'¿Cuánto suma en copagos al año?', ayuda:'', v:400 },
        { k:'outOfPocketMaximum',      di:'¿Cuál es su máximo de bolsillo?', ayuda:'El tope que puede llegar a pagar en el año.', v:9200 },
        { k:'nonCoveredCosts',         di:'¿Gastos que el plan no cubre?', ayuda:'', v:0 },
        { k:'outOfNetworkCosts',       di:'¿Gastos con médicos fuera de la red?', ayuda:'', v:0 }
      ],
      fn:'annualHealthCost',
      leer: r => ({
        cifra: r.results.estimatedTotalAnnualCost,
        rotulo: 'Costo anual estimado',
        frase: 'Sumando lo que paga de prima y lo que pondría de su bolsillo, el año le costaría cerca de esto.'
      })
    },
    retiro: {
      titulo: 'Retiro',
      preguntas: [
        { k:'currentAge',           di:'¿Qué edad tiene?', ayuda:'', v:45 },
        { k:'retirementAge',        di:'¿A qué edad le gustaría retirarse?', ayuda:'', v:65 },
        { k:'currentSavings',       di:'¿Cuánto tiene ahorrado para el retiro?', ayuda:'Cuente 401k, IRA, ahorros.', v:0 },
        { k:'monthlyContribution',  di:'¿Cuánto puede apartar al mes?', ayuda:'', v:400 },
        { k:'annualReturn',         di:'¿Qué rendimiento anual suponemos?', ayuda:'5% es un punto de partida conservador.', v:5 },
        { k:'annualInflation',      di:'¿Y qué inflación?', ayuda:'2.5% es lo habitual.', v:2.5 },
        { k:'withdrawalRate',       di:'¿Qué porcentaje retiraría cada año?', ayuda:'La regla del 4% es una hipótesis, no una garantía.', v:4 },
        { k:'planningAge',          di:'¿Hasta qué edad planificamos?', ayuda:'90 años es lo prudente.', v:90 }
      ],
      fn:'retirementProjection',
      leer: r => ({
        cifra: r.results.monthlyPlanningIncome,
        rotulo: 'Ingreso mensual al retirarse',
        frase: 'Si sigue así, al retirarse podría contar con este ingreso mensual aproximado.'
      })
    }
  };

  let guia = null, datos = {}, tocados = new Set(), modoCliente = false;

  // El motor espera los porcentajes como decimales (20% → 0.20), igual que
  // hacen las calculadoras públicas del sitio.
  const PCT = { retiro:['annualReturn','annualInflation','withdrawalRate'], salud:['coinsuranceRate'], vida:[] };

  const num = v => { const n = Number(String(v).replace(/[^0-9.\-]/g,'')); return Number.isFinite(n) ? n : 0; };

  function paraMotor(){
    const pcts = PCT[guia.tema] || [];
    const out = {};
    for (const k in datos) out[k] = pcts.includes(k) ? datos[k]/100 : datos[k];
    return out;
  }

  function pintarPreguntas(){
    $('#citaPreguntas').innerHTML = guia.preguntas.map((p,i) => `
      <div class="preg${tocados.has(p.k)?' is-ok':''}" data-k="${p.k}">
        <div class="preg__n">${i+1}</div>
        <div class="preg__c">
          <label for="q-${p.k}">${p.di}</label>
          ${p.ayuda ? `<small>${p.ayuda}</small>` : ''}
          <input id="q-${p.k}" type="text" inputmode="decimal" value="${datos[p.k] ?? p.v}">
        </div>
      </div>`).join('');

    $$('#citaPreguntas input').forEach(inp => {
      inp.addEventListener('input', () => {
        const k = inp.closest('.preg').dataset.k;
        datos[k] = num(inp.value);
        tocados.add(k);
        inp.closest('.preg').classList.add('is-ok');
        calcular();
      });
    });
  }

  function calcular(){
    let r;
    try {
      r = CE[guia.fn](paraMotor());
    } catch(err) {
      // El motor valida rangos (p. ej. edad entre 18 y 100). Mientras el
      // agente escribe puede quedar un valor fuera de rango un instante;
      // se avisa en lugar de dejar una cifra congelada sin explicación.
      $('#citaEstado').textContent = 'Revisa un dato';
      $('#citaEstado').className = 'is-pend';
      $('#citaResultado').innerHTML =
        `<p class="cifra__falta">${(err && err.message) || 'Hay un dato fuera del rango esperado.'}</p>`;
      return;
    }
    const { cifra, rotulo, frase } = guia.leer(r);
    const faltan = guia.preguntas.length - tocados.size;

    $('#citaEstado').textContent = faltan > 0
      ? `Faltan ${faltan} por confirmar`
      : 'Todo confirmado';
    $('#citaEstado').className = faltan > 0 ? 'is-pend' : 'is-ok';

    $('#citaResultado').innerHTML = `
      <div class="cifra${modoCliente?' is-big':''}">
        <small>${rotulo}</small>
        <strong>${USD.format(Math.max(0, cifra))}</strong>
      </div>
      <p class="cifra__frase">${frase}</p>
      ${!modoCliente && faltan > 0 ? `<p class="cifra__falta">Aún no ha confirmado ${faltan} dato(s). La cifra cambiará.</p>` : ''}`;
  }

  $$('#citaTemas .tema').forEach(b => b.onclick = () => {
    guia = GUIAS[b.dataset.tema];
    guia.tema = b.dataset.tema;
    datos = {}; tocados = new Set();
    guia.preguntas.forEach(p => datos[p.k] = p.v);
    $('#citaTitulo').textContent = guia.titulo;
    $('#citaTemas').hidden = true;
    $('#citaPreguntas').hidden = false;
    $('#citaLado').hidden = false;
    $('#citaReset').hidden = false;
    pintarPreguntas();
    calcular();
  });

  $('#citaReset').onclick = () => {
    guia = null; datos = {}; tocados = new Set(); modoCliente = false;
    $('#citaTitulo').textContent = '¿De qué van a hablar hoy?';
    $('#citaTemas').hidden = false;
    $('#citaPreguntas').hidden = true;
    $('#citaLado').hidden = true;
    $('#citaReset').hidden = true;
    document.body.classList.remove('cliente-mode');
  };

  $('#citaModo').onclick = () => {
    modoCliente = !modoCliente;
    $('#citaModo').setAttribute('aria-pressed', String(modoCliente));
    $('#citaModo').textContent = modoCliente ? 'Volver a mi vista' : 'Mostrar al cliente';
    document.body.classList.toggle('cliente-mode', modoCliente);
    if (guia) calcular();
  };

  // Pestañas del panel
  $$('.office-tabs button').forEach(t => t.onclick = () => {
    $$('.office-tabs button').forEach(o => { o.classList.remove('is-on'); o.setAttribute('aria-selected','false'); });
    t.classList.add('is-on'); t.setAttribute('aria-selected','true');
    const cita = t.id === 'tab-cita';
    $('#pane-cita').hidden = !cita;
    $('#pane-solicitudes').hidden = cita;
  });
})();
addEventListener('hashchange', checkPanel);
checkPanel();

/* ═══════════ LEGALES ═══════════ */
const LEGAL = {
  privacidad:['Política de Privacidad',
    'Mientras el sitio esté en modo educativo no hay formularios activos. Si escribes por WhatsApp, llamas o envías un correo, usamos lo que compartas únicamente para responderte. Cuando se habilite el formulario, recopilaremos solo nombre, teléfono, correo, estado de residencia, área de interés y preferencia de presupuesto, para preparar tu revisión y contactarte con tu autorización.',
    'No solicitamos ni almacenamos números de Seguro Social, números de Medicare, datos bancarios, diagnósticos ni medicamentos a través de este sitio.',
    'Asistente virtual con IA: fuera de una sesión de voz, las respuestas escritas básicas se generan en tu navegador. La conversación por voz es opcional y solo empieza cuando la aceptas. Mientras esa sesión está activa, el audio y las preguntas que escribas se envían a la API de OpenAI para generar respuestas en tiempo real. Este sitio no guarda grabaciones. La voz audible de la asistente no usa SpeechSynthesis del navegador; proviene de OpenAI Realtime.',
    'Puedes retirar tu consentimiento y pedir acceso, corrección o eliminación de tus datos escribiendo a wperezmedero@gmail.com. Eliminamos los mensajes y registros que ya no sean necesarios para atenderte.'],
  cookies:['Política de Cookies',
    'Este sitio no instala cookies propias de publicidad ni de medición.',
    'Las tipografías se cargan desde Google Fonts, que recibe datos técnicos como tu dirección IP para entregarlas. Si aceptas el aviso de voz, tu navegador recuerda esa decisión solo mientras dure la sesión, sin usar cookies.',
    'Los enlaces a WhatsApp, YouTube, Apple Music o Amazon te llevan a servicios externos que aplican sus propias políticas y cookies.'],
  terminos:['Términos y Condiciones',
    'El contenido de este sitio es educativo y no constituye una oferta contractual ni asesoramiento legal, fiscal, médico o de inversión.',
    'Las calculadoras producen estimaciones basadas en supuestos generales y en los datos que introduzcas. No son cotizaciones, ofertas, recomendaciones, promesas de cobertura ni garantías de rendimiento.',
    'La disponibilidad de productos, la elegibilidad, las primas, los beneficios y las garantías dependen de la aseguradora emisora, el contrato aplicable y la evaluación correspondiente.'],
  accesibilidad:['Accesibilidad',
    'Buscamos cumplir las pautas WCAG 2.2 nivel AA: navegación por teclado, foco visible, contraste suficiente, etiquetas asociadas a cada campo, mensajes anunciados y respeto a la preferencia de movimiento reducido.',
    'Si encuentras una barrera de acceso, escríbenos a wperezmedero@gmail.com y la corregiremos.']
};
const legalModal = $('#legalModal');
$$('[data-legal]').forEach(a => a.onclick = e => {
  e.preventDefault();
  const arr = LEGAL[a.dataset.legal];
  $('#legalTitle').textContent = arr[0];
  $('#legalBody').innerHTML = arr.slice(1).map(p => '<p>' + p + '</p>').join('');
  openDialog(legalModal);
});
$('#legalClose').onclick = () => closeDialog(legalModal);

/* ═══════════ VARIAS PÁGINAS: CONTINUIDAD ═══════════
   1. El tema elegido para el formulario viaja a la página de calculadoras.
   2. La conversación del asistente sigue donde iba al cambiar de página.
      Se guarda solo en esta pestaña (sessionStorage) y caduca a los 30 minutos. */
try {
  const pendiente = sessionStorage.getItem('wps-prefill');
  if (pendiente && document.querySelector('#interes')) { sessionStorage.removeItem('wps-prefill'); prefill(pendiente); }
} catch (_) {}

(function continuidadAsistente(){
  const CLAVE = 'wps-asistente', VIDA = 30 * 60 * 1000;
  function guardar(){
    try {
      if (!S.started) { sessionStorage.removeItem(CLAVE); return; }
      const copia = botLog.cloneNode(true);
      copia.querySelectorAll('.typing').forEach(n => n.remove());
      sessionStorage.setItem(CLAVE, JSON.stringify({
        log: copia.innerHTML, abierto: bot.classList.contains('is-open'),
        data: S.data, tags: S.tags, meta: S.meta, nodo: S.node && S.node.id,
        fin: S.ended, lang: V.lang, t: Date.now()
      }));
    } catch (_) {}
  }
  addEventListener('pagehide', guardar);

  let st = null;
  try { st = JSON.parse(sessionStorage.getItem(CLAVE) || 'null'); } catch (_) {}
  if (!st || !st.log || Date.now() - st.t > VIDA) return;

  botLog.innerHTML = st.log;
  S.started = true; S.data = st.data || {}; S.meta = st.meta || {}; S.ended = !!st.fin;
  if (st.lang && st.lang !== V.lang) { V.lang = st.lang; syncLanguage(); }

  /* Se vuelven a mostrar los botones del punto donde iba la conversación,
     sin repetir mensajes ni leerlos en voz alta. */
  const decir = say;
  say = function(){};
  try {
    const n = st.nodo && nodeById(st.nodo);
    const ESPERA = ['single_choice', 'single_choice_optional', 'multi_choice', 'yes_no'];
    if (S.ended) closeOptions();
    else if (n && ESPERA.includes(n.type)) go(n.id);
    else showTopicMenu();
  } catch (_) {
  } finally {
    say = decir;
    S.tags = st.tags || [];
  }

  $('#botOpen').classList.add('is-known');
  $('#botVoiceStatus').textContent = copy().voiceReady;
  /* En pantallas amplias el asistente sigue abierto; en el teléfono queda
     cerrado para no tapar la página nueva, pero la conversación está intacta. */
  if (st.abierto && matchMedia('(min-width: 900px)').matches) {
    bot.classList.add('is-open'); document.body.classList.add('bot-open');
    $('#botOpen').setAttribute('aria-expanded', true);
  }
  requestAnimationFrame(() => { botLog.scrollTop = botLog.scrollHeight; });
})();


/* ═══ CIERRE ═══ */
(()=>{
  const sec=document.getElementById('cierre'),card=document.getElementById('ciCard');
  if(!sec||!card)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS='http://www.w3.org/2000/svg';
  function guil(svg,cx,cy,s,seed){
    const add=d=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',d);svg.append(p)};
    const rose=(R,r,dd,turns,rot)=>{let d='';for(let i=0;i<=900;i++){const t=i/900*Math.PI*2*turns,x=(R-r)*Math.cos(t)+dd*Math.cos((R-r)/r*t),y=(R-r)*Math.sin(t)-dd*Math.sin((R-r)/r*t),xr=x*Math.cos(rot)-y*Math.sin(rot),yr=x*Math.sin(rot)+y*Math.cos(rot);d+=(i?'L':'M')+(cx+xr*s).toFixed(1)+' '+(cy+yr*s).toFixed(1)}add(d)};
    rose(96,26.4,42,11,seed);rose(82,22.8,36,11,seed+.3);rose(60,15,30,4,seed+.7);
    for(let k=0;k<7;k++){let d='';for(let x=-10;x<=350;x+=4){d+=(x===-10?'M':'L')+x+' '+(184+k*5+Math.sin(x/17+k*.55+seed)*5+Math.sin(x/41+k)*3).toFixed(1)}add(d)}
  }
  const size=()=>{const r=card.getBoundingClientRect(),rect=card.querySelector('.ci-outline rect');rect.setAttribute('width',Math.max(0,r.width-2));rect.setAttribute('height',Math.max(0,r.height-2))};
  let qrDone=false;
  function drawQr(){
    if(qrDone||!window.QRCode)return;qrDone=true;
    const el=document.getElementById('ciQr');
    new QRCode(el,{text:'https://williamperezseguros.com/tarjeta/?src=sitio',width:320,height:320,colorDark:'#0B1B2E',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
    el.querySelectorAll('img,canvas').forEach(n=>{n.setAttribute('aria-hidden','true');if(n.tagName==='IMG')n.alt=''});
  }
  function prepare(){
    guil(document.getElementById('ciG1'),262,96,.92,0);
    guil(document.getElementById('ciG2'),70,110,.95,1.1);
    size();addEventListener('resize',size,{passive:true});
    if(window.QRCode){drawQr();return}
    const s=document.createElement('script');s.src='/tarjeta/vendor/qrcode.min.js';s.async=true;s.onload=drawQr;document.head.append(s);
  }
  let busy=false;
  function flip(on){
    if(busy||card.classList.contains('flipped')===on)return;
    const set=()=>{card.classList.toggle('flipped',on);card.setAttribute('aria-pressed',on);card.setAttribute('aria-label',on?'Voltear tarjeta para ver el frente':'Voltear tarjeta para ver el código QR')};
    if(reduced){set();return}
    busy=true;card.classList.add('fold');
    setTimeout(()=>{set();card.classList.add('unfold');card.classList.remove('fold');void card.offsetWidth;card.classList.add('opening');card.classList.remove('unfold');
      setTimeout(()=>{card.classList.remove('opening');busy=false},460)},380);
  }
  card.addEventListener('click',()=>flip(!card.classList.contains('flipped')));
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip(!card.classList.contains('flipped'))}});
  const run=()=>{
    sec.classList.add('play');
    if(reduced){sec.classList.add('idle');return}
    setTimeout(()=>flip(true),2900);
    setTimeout(()=>flip(false),5600);
    setTimeout(()=>sec.classList.add('idle'),6300);
  };
  if('IntersectionObserver' in window){
    new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();prepare()}},{rootMargin:'600px 0px'}).observe(sec);
    new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();run()}},{threshold:.35}).observe(sec);
  }else{prepare();run()}
  document.getElementById('ciAsistente').addEventListener('click',()=>{const b=document.getElementById('botOpen');if(b&&b.getAttribute('aria-expanded')!=='true')b.click()});
  const more=document.querySelector('.about__more'),full=document.getElementById('aboutFull');
  if(more&&full)more.addEventListener('click',()=>{
    const open=full.hidden;full.hidden=!open;more.setAttribute('aria-expanded',open);
    more.textContent=open?'Mostrar menos':'Leer mi historia completa';
    if(!open)more.scrollIntoView({block:'center'});
  });
})();

/* ═══ MOVIMIENTO Y CALCULADORAS VISUALES ═══ */
(()=>{
  'use strict';
  const section=document.getElementById('sobre-mi');
  const body=section?.querySelector('.about__body');
  if(!section||!body)return;

  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrative=[...body.children].filter(el=>!el.classList.contains('about__legal'));
  const facts=[...section.querySelectorAll('.about__facts .fact')];
  const animated=[...narrative,...facts];

  animated.forEach(el=>el.classList.add('story-reveal'));
  facts.forEach((el,index)=>el.style.setProperty('--story-delay',`${220+(index*105)}ms`));

  if(reduce||!('IntersectionObserver' in window)){
    animated.forEach(el=>el.classList.add('is-written'));
    return;
  }

  section.classList.add('story-motion');
  const observer=new IntersectionObserver(entries=>{
    const visible=entries
      .filter(entry=>entry.isIntersecting)
      .sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);

    visible.forEach((entry,index)=>{
      if(!entry.target.closest('.about__facts')){
        entry.target.style.setProperty('--story-delay',`${Math.min(index,3)*85}ms`);
      }
      entry.target.classList.add('is-written');
      observer.unobserve(entry.target);
    });
  },{threshold:.08,rootMargin:'0px 0px -9% 0px'});

  animated.forEach(el=>observer.observe(el));
})();
(()=>{
  'use strict';
  const root=document.documentElement;
  root.classList.add('motion-ready');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  // (La cascada de .reveal vive ahora en el sistema único de revelado.)

  // Draw the three illustrative SVGs once, only when they actually enter view.
  const cases=[...document.querySelectorAll('.case')];
  if(reduce.matches || !('IntersectionObserver' in window)){
    cases.forEach(card=>card.classList.add('motion-in'));
  }else if(cases.length){
    const caseObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        entry.target.classList.add('motion-in');
        caseObserver.unobserve(entry.target);
      });
    },{threshold:.28,rootMargin:'0px 0px -7% 0px'});
    cases.forEach(card=>caseObserver.observe(card));
  }

  // Desktop-only depth: a few pixels, deliberately below “3D effect” territory.
  const hero=document.querySelector('.hero');
  const method=hero?.querySelector('.method');
  const finePointer=window.matchMedia('(min-width:1000px) and (hover:hover) and (pointer:fine)');
  if(hero && method && finePointer.matches && !reduce.matches){
    let raf=0;
    const reset=()=>{
      method.style.setProperty('--hero-depth-x','0px');
      method.style.setProperty('--hero-depth-y','0px');
    };
    hero.addEventListener('pointermove',event=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        const rect=hero.getBoundingClientRect();
        const nx=((event.clientX-rect.left)/rect.width)-.5;
        const ny=((event.clientY-rect.top)/rect.height)-.5;
        method.style.setProperty('--hero-depth-x',`${(-nx*10).toFixed(2)}px`);
        method.style.setProperty('--hero-depth-y',`${(-ny*7).toFixed(2)}px`);
      });
    },{passive:true});
    hero.addEventListener('pointerleave',reset,{passive:true});
  }
})();
(()=>{
'use strict';
const IC=window.InsuranceCalculators;
if(!IC)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const USD=new Intl.NumberFormat('es-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const N=v=>{const n=Number(String(v??'').replace(/[$,\s%]/g,''));return Number.isFinite(n)?n:0};
const configs={
 vida:{prefix:'cv',fn:'lifeInsuranceNeed',pct:[],fields:['annualIncome','replacementYears','mortgageBalance','otherDebts','educationGoal','finalExpenses','otherGoals','existingCoverage','liquidAssets']},
 retiro:{prefix:'cr',fn:'retirementProjection',pct:['annualReturn','annualInflation','withdrawalRate'],fields:['currentAge','retirementAge','currentSavings','monthlyContribution','annualReturn','annualInflation','withdrawalRate','planningAge']},
 salud:{prefix:'cs',fn:'annualHealthCost',pct:['coinsuranceRate'],fields:['monthlyPremium','expectedAllowedCharges','deductible','coinsuranceRate','annualCopays','outOfPocketMaximum','nonCoveredCosts','outOfNetworkCosts']},
 uni:{prefix:'cu',fn:'collegeSavings',pct:['collegeInflation','annualReturn'],fields:['currentAnnualCost','yearsUntilCollege','yearsInCollege','collegeInflation','currentSavings','annualReturn']}
};
function collect(key){const c=configs[key],o={};c.fields.forEach(f=>{const el=document.getElementById(`${c.prefix}-${f}`);let v=N(el?.value);if(c.pct.includes(f))v/=100;o[f]=v});return o}
function engine(key,input){return IC[configs[key].fn](input)}
function head(){return `<div class="viz-head"><span class="viz-kicker"><i class="viz-live"></i>Visualización del resultado</span><span class="viz-engine">mismo motor de cálculo</span></div>`}
function metric(label,value,gold=false){return `<div class="viz-metric${gold?' viz-metric--gold':''}"><span>${label}</span><b>${value}</b></div>`}
function mount(key,html){const out=document.getElementById(`out-${key}`);if(!out)return;out.querySelector('.calc-viz')?.remove();const node=document.createElement('div');node.className='calc-viz';node.dataset.viz=key;node.innerHTML=head()+html;out.appendChild(node);animate(node)}
function animate(node){if(reduce){node.classList.add('is-animated');return}const go=()=>requestAnimationFrame(()=>node.classList.add('is-animated'));if(!('IntersectionObserver'in window)){go();return}const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){go();io.disconnect()}},{threshold:.22});io.observe(node)}
function life(r){const b=r.breakdown,g=Math.max(1,b.grossNeed),p1=Math.max(0,b.incomeReplacement)/g*100,p2=Math.max(0,b.obligationsAndGoals)/g*100,cov=Math.min(100,Math.max(0,b.availableResources)/g*100);return `<div class="viz-panel"><div class="viz-title"><span>Composición de la necesidad bruta</span><b>${USD.format(b.grossNeed)}</b></div><div class="viz-track"><i class="viz-seg viz-gold" style="width:${p1}%"></i><i class="viz-seg viz-blue" style="width:${p2}%"></i></div><div class="viz-legend"><span><i class="viz-gold"></i>Ingresos</span><span><i class="viz-blue"></i>Obligaciones y metas</span></div></div><div class="viz-grid"><div class="viz-ringrow viz-panel"><div class="viz-ring" style="--pct:${cov}%"><span>${Math.round(cov)}%<br>cubierto</span></div><div>${metric('Recursos disponibles',USD.format(b.availableResources))}</div></div>${metric('Brecha estimada',USD.format(r.estimatedNeed),true)}</div><p class="viz-note">La proporción visual compara recursos disponibles con la necesidad bruta calculada. Es una referencia educativa, no una recomendación de cobertura.</p>`}
function retire(r){const inp=r.inputs,years=Math.max(0,Math.round(inp.retirementAge-inp.currentAge)),count=Math.min(24,Math.max(2,years+1)),vals=[];for(let i=0;i<count;i++){const t=years*(i/(count-1));const ra=inp.currentAge+t;try{const rr=IC.retirementProjection({...inp,retirementAge:ra,planningAge:Math.max(inp.planningAge,ra+1)});vals.push(rr.results.projectedSavings)}catch{vals.push(i?vals[i-1]:inp.currentSavings)}}const W=520,H=205,P=24,max=Math.max(1,...vals);const pts=vals.map((v,i)=>[P+(W-2*P)*(i/(vals.length-1)),H-P-(H-2*P)*(v/max)]);const path=pts.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');const area=`M${pts[0][0]},${H-P} ${pts.map(p=>`L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} L${pts.at(-1)[0]},${H-P} Z`;const grids=[.25,.5,.75].map(q=>`<line class="viz-gridline" x1="${P}" y1="${(P+(H-2*P)*q).toFixed(1)}" x2="${W-P}" y2="${(P+(H-2*P)*q).toFixed(1)}"/>`).join('');return `<div class="viz-panel"><div class="viz-title"><span>Trayectoria proyectada del ahorro</span><b>${USD.format(r.results.projectedSavings)}</b></div><svg class="viz-chart" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs><linearGradient id="retireArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D4AF37" stop-opacity=".28"/><stop offset="1" stop-color="#D4AF37" stop-opacity="0"/></linearGradient></defs>${grids}<path class="viz-area" d="${area}"/><path class="viz-line" pathLength="1" d="${path}"/><circle class="viz-dot" cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="5"/><text class="viz-axis" x="${P}" y="${H-5}">Edad ${Math.round(inp.currentAge)}</text><text class="viz-axis" text-anchor="end" x="${W-P}" y="${H-5}">Edad ${Math.round(inp.retirementAge)}</text></svg></div><div class="viz-grid">${metric('Ingreso mensual de planificación',USD.format(r.results.monthlyPlanningIncome),true)}${metric('Ingreso anual en dólares de hoy',USD.format(r.results.annualIncomeTodayDollars))}</div><p class="viz-note">La curva usa el mismo motor y los mismos supuestos de rendimiento, aportes e inflación. No representa rendimiento garantizado ni una cotización de anualidad.</p>`}
function health(r){const premium=r.results.annualPremium,oop=r.results.estimatedCoveredOutOfPocket,extra=r.inputs.nonCoveredCosts+r.inputs.outOfNetworkCosts,total=Math.max(1,r.results.estimatedTotalAnnualCost);const a=premium/total*100,b=oop/total*100,c=Math.max(0,extra)/total*100;const high=Math.max(total,r.results.highUseScenario);const currentPct=Math.min(100,total/high*100);return `<div class="viz-panel"><div class="viz-title"><span>Composición del costo anual estimado</span><b>${USD.format(r.results.estimatedTotalAnnualCost)}</b></div><div class="viz-track"><i class="viz-seg viz-gold" style="width:${a}%"></i><i class="viz-seg viz-blue" style="width:${b}%"></i><i class="viz-seg viz-teal" style="width:${c}%"></i></div><div class="viz-legend"><span><i class="viz-gold"></i>Primas</span><span><i class="viz-blue"></i>Participación cubierta</span><span><i class="viz-teal"></i>No cubierto / fuera de red</span></div></div><div class="viz-panel" style="margin-top:.7rem"><div class="viz-title"><span>Estimado frente a escenario de uso alto</span><b>${USD.format(r.results.highUseScenario)}</b></div><div class="viz-track"><i class="viz-seg viz-gold" style="width:${currentPct}%"></i></div></div><div class="viz-grid">${metric('Costo mensual equivalente',USD.format(r.results.estimatedTotalAnnualCost/12),true)}${metric('Máximo de bolsillo ingresado',USD.format(r.inputs.outOfPocketMaximum))}</div><p class="viz-note">La barra separa los componentes del estimado. Gastos no cubiertos o fuera de red pueden no contar para el máximo de bolsillo.</p>`}
function college(r){const arr=r.results.projectedCostByAcademicYear||[],max=Math.max(1,...arr),cols=arr.map((v,i)=>`<div class="viz-col"><i style="--h:${Math.max(4,v/max*100)}%"></i><small>Año ${i+1}</small></div>`).join('');const cover=Math.min(100,r.results.totalProjectedCost?Math.max(0,r.results.projectedCurrentSavings/r.results.totalProjectedCost*100):100);return `<div class="viz-panel"><div class="viz-title"><span>Costo proyectado por año académico</span><b>${USD.format(r.results.totalProjectedCost)}</b></div><div class="viz-bars">${cols}</div></div><div class="viz-panel" style="margin-top:.7rem"><div class="viz-title"><span>Ahorro proyectado frente al costo</span><b>${Math.round(cover)}% cubierto</b></div><div class="viz-track"><i class="viz-seg viz-gold" style="width:${cover}%"></i></div></div><div class="viz-grid">${metric('Brecha estimada',USD.format(r.results.fundingGap))}${metric('Aporte mensual estimado',USD.format(r.results.requiredMonthlyContribution),true)}</div><p class="viz-note">Proyección educativa basada en los supuestos introducidos; no incluye becas, ayuda financiera, impuestos ni cambios futuros de matrícula.</p>`}
const renderers={vida:life,retiro:retire,salud:health,uni:college};
function render(key){try{const input=collect(key),r=engine(key,input);mount(key,renderers[key](r,input))}catch{/* The primary calculator already renders validation errors. */}}
Object.keys(configs).forEach(render);
document.querySelectorAll('[data-run]').forEach(btn=>btn.addEventListener('click',()=>requestAnimationFrame(()=>render(btn.dataset.run))));
document.querySelectorAll('[data-reset]').forEach(btn=>btn.addEventListener('click',()=>requestAnimationFrame(()=>document.querySelector(`#out-${btn.dataset.reset} .calc-viz`)?.remove())));
})();
