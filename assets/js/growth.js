/* Shared contact and measurement. No contact data in storage, URLs or analytics. */
(() => {
  'use strict';
  const allowedEvents = new Set(['review_protection','talk_william','form_started','form_submitted','form_prepared','email_handoff','calculator_used','card_shared','contact_saved','call_started','ethos_quote']);
  function track(event, extra = {}) {
    if (!allowedEvents.has(event)) return;
    const detail = {event, surface: location.pathname.includes('/tarjeta') ? 'tarjeta' : 'website'};
    // Deliberate allowlist: never collect user values, calculator amounts or query strings.
    if (['vida','retiro','salud','universidad','dime'].includes(extra.calculator)) detail.calculator = extra.calculator;
    if (['native','clipboard','download','vcard'].includes(extra.method)) detail.method = extra.method;
    (window.dataLayer = window.dataLayer || []).push(detail);
    document.dispatchEvent(new CustomEvent('wps:analytics', {detail}));
  }
  const forms = [...document.querySelectorAll('[data-lead-form]')];
  const aliases = {'Seguro de vida':'familia',vida:'familia','Cobertura de salud':'salud','Retiro o anualidades':'retiro',Medicare:'medicare','Ahorro universitario':'legado'};
  function selectInterest(key) {
    const value = aliases[key] || key;
    if (value && !forms.length && ['familia','deudas','legado','permanente','estimado','orientacion','salud','medicare','retiro'].includes(value)) { try { sessionStorage.setItem('wps-interest',value); } catch (_) {} }
    forms.forEach(f => { if ([...f.elements.interes.options].some(o => o.value === value)) f.elements.interes.value = value; });
  }
  window.WPSGrowth = {track, selectInterest};
  const messages = {
    familia:'Antes de mirar productos, conviene saber cuánto necesita proteger tu familia y durante cuánto tiempo.',
    deudas:'Podemos revisar qué obligaciones quedarían pendientes y qué protección tienes hoy. Primero entendemos tu situación.',
    legado:'Hablemos de las personas que quieres dejar protegidas y de lo que te gustaría prever para ellas.',
    permanente:'Conviene entender la duración de tu necesidad, los costos y las condiciones antes de explorar protección permanente.',
    estimado:'Una estimación educativa puede servir de punto de partida. Después revisamos juntos los supuestos y tus prioridades.',
    orientacion:'Está bien empezar con preguntas. Te escucho y lo revisamos paso a paso, en español.'
  };
  document.querySelectorAll('[data-need]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[data-need]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const response = document.getElementById('need-response');
    response.hidden = false;
    response.querySelector('[data-need-response]').textContent = messages[b.dataset.need];
    selectInterest(b.dataset.need);
  }));
  document.addEventListener('click', e => {
    const el = e.target.closest('a,button'); if (!el) return;
    if (el.dataset.growthEvent) track(el.dataset.growthEvent);
    else if (/Revisar mi protección|Revisar mi estimado/.test(el.textContent)) track('review_protection');
    if (el.matches('a[href^="tel:"]')) track('call_started');
    if (el.dataset.needLink) selectInterest(el.dataset.needLink);
  });
  let pendingInterest = '';
  try { pendingInterest = sessionStorage.getItem('wps-interest') || ''; if (forms.length) sessionStorage.removeItem('wps-interest'); } catch (_) {}
  selectInterest(new URLSearchParams(location.search).get('interes') || pendingInterest || 'familia');
  const provider = window.WPS_GROWTH_CONFIG?.leadProvider || 'manual';
  const endpoint = window.WPS_GROWTH_CONFIG?.leadEndpoint || '';
  const formspree = provider === 'formspree' && /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint);
  const cloudflare = provider === 'cloudflare' && /^\/api\/leads$/.test(endpoint);
  const configured = formspree || cloudflare;
  const sitekey = window.WPS_GROWTH_CONFIG?.turnstileSitekey || '';
  let challengeScript;
  function loadChallenge() {
    if (window.turnstile) return Promise.resolve();
    if (!challengeScript) challengeScript = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      const timer = setTimeout(() => { script.remove(); reject(new Error('challenge-timeout')); }, 12000);
      script.onload = () => { clearTimeout(timer); window.turnstile ? resolve() : reject(new Error('challenge-unavailable')); };
      script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('challenge-unavailable')); };
      document.head.append(script);
    }).catch(error => { challengeScript = null; throw error; });
    return challengeScript;
  }
  forms.forEach(form => {
    const fields = form.elements, status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('button[type="submit"]'), handoff = form.querySelector('[data-handoff]');
    let started = false, busy = false, token = '', widget = null, loadingChallenge = false;
    const challenge = document.createElement('div');
    challenge.className = 'growth-challenge';
    challenge.setAttribute('aria-label', 'Verificación contra envíos automáticos');
    if (cloudflare) submit.before(challenge);
    async function prepareChallenge() {
      if (!cloudflare || !sitekey || widget !== null || loadingChallenge) return;
      loadingChallenge = true;
      try {
        await loadChallenge();
        widget = window.turnstile.render(challenge, {
          sitekey, action:'lead_contact', theme:'light', size:'flexible', 'response-field':false,
          callback: value => { token=value; status.textContent='Verificación completada. Puedes enviar tu solicitud.'; },
          'expired-callback': () => { token=''; status.textContent='La verificación caducó. Vuelve a verificar antes de enviar.'; },
          'error-callback': () => { token=''; status.textContent='No se pudo verificar la conexión. Inténtalo de nuevo o llama al 786-354-8796.'; },
          'timeout-callback': () => { token=''; status.textContent='La verificación necesita repetirse.'; }
        });
      } catch (_) { status.textContent='No se pudo cargar la verificación. Vuelve a intentarlo o llama al 786-354-8796.'; }
      finally { loadingChallenge=false; }
    }
    form.addEventListener('focusin', prepareChallenge);
    submit.disabled = false;
    if (configured) form.querySelector('[data-delivery]').textContent = formspree
      ? 'Formspree procesará tu solicitud y notificará a William por correo. Consulta cómo se usan tus datos.'
      : 'William recibirá tu solicitud para responderte personalmente.';
    function requirements() {
      const email = fields.preferencia.value === 'email';
      fields.email.required = email; fields.telefono.required = !email;
      form.querySelector('[data-phone-hint]').textContent = email ? '(opcional)' : '(requerido)';
      form.querySelector('[data-email-hint]').textContent = email ? '(requerido)' : '(opcional)';
    }
    requirements(); fields.preferencia.addEventListener('change', requirements);
    form.addEventListener('input', e => {
      if (!started) { track('form_started'); started = true; }
      e.target.removeAttribute('aria-invalid');
      handoff.hidden = true;
      form.querySelector('[data-email-send]').removeAttribute('href');
      status.textContent = '';
    });
    form.addEventListener('change', () => { handoff.hidden = true; form.querySelector('[data-email-send]').removeAttribute('href'); });
    form.querySelector('[data-email-send]').addEventListener('click', () => track('email_handoff'));
    form.addEventListener('submit', async e => {
      e.preventDefault(); if (busy) return;
      let invalid = null;
      for (const field of [...fields].filter(f => f.matches('input,select'))) {
        field.setCustomValidity('');
        if (field.name === 'nombre' && field.value.trim().length < 2) field.setCustomValidity('Escribe tu nombre.');
        if (field.name === 'telefono' && field.value.trim()) {
          const digits = field.value.replace(/\D/g,'');
          if (!/^\d{10}$/.test(digits) && !/^1\d{10}$/.test(digits)) field.setCustomValidity('Revisa el teléfono: debe tener 10 dígitos, con el 1 inicial opcional.');
        }
        const valid = field.checkValidity(); field.setAttribute('aria-invalid', String(!valid));
        if (!valid && !invalid) invalid = field;
      }
      if (invalid) { status.textContent = invalid.validationMessage; invalid.focus(); invalid.reportValidity(); return; }
      const payload = {
        nombre: fields.nombre.value.trim(), telefono: fields.telefono.value.trim(), email: fields.email.value.trim(),
        postal: fields.postal.value.trim(), preferencia: fields.preferencia.value, interes: fields.interes.value,
        horario: fields.horario.value, consentimiento: true, consentimientoVersion: 'growth-v1',
        origen: location.pathname, enviado: new Date().toISOString()
      };
      if (!configured) {
        const label = key => fields[key].selectedOptions[0].textContent;
        const body = `Hola William, me gustaría solicitar una conversación.\n\nNombre: ${payload.nombre}\nTeléfono: ${payload.telefono || 'No indicado'}\nEmail: ${payload.email || 'No indicado'}\nCódigo postal: ${payload.postal || 'No indicado'}\nPrefiero: ${label('preferencia')}\nQué me gustaría proteger: ${label('interes')}\nHorario: ${label('horario')}\n\nAutorizo a William a responder a esta solicitud por el medio elegido. No es una condición de compra.`;
        form.querySelector('[data-email-send]').href = 'mailto:wperezmedero@gmail.com?subject=' + encodeURIComponent('Solicitud de conversación — seguros') + '&body=' + encodeURIComponent(body);
        handoff.hidden = false; status.textContent = 'Solicitud preparada. Falta enviarla desde tu correo.'; status.focus();
        track('form_prepared'); return;
      }
      if (cloudflare && !sitekey) { status.textContent='El envío directo aún no está disponible. Puedes llamar al 786-354-8796.'; status.focus(); return; }
      if (cloudflare && !token) { await prepareChallenge(); status.textContent='Completa la verificación y vuelve a pulsar Solicitar conversación.'; status.focus(); return; }
      if (cloudflare) payload.turnstileToken = token;
      busy = true; submit.disabled = true; status.textContent = 'Enviando tu solicitud…';
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 15000);
      try {
        let body;
        if (formspree) {
          body = new FormData();
          for (const [key, value] of Object.entries(payload)) body.set(key, String(value));
          body.set('subject', 'Nueva solicitud de conversación — seguros');
        }
        const response = await fetch(endpoint, formspree
          ? {method:'POST', headers:{Accept:'application/json'}, body, signal:controller.signal, credentials:'omit', cache:'no-store'}
          : {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload), signal:controller.signal, credentials:'omit', cache:'no-store'});
        if (!response.ok) throw new Error('not-accepted');
        if (cloudflare && (await response.json()).accepted !== true) throw new Error('not-accepted');
        form.reset(); requirements(); handoff.hidden = true;
        status.textContent = 'Gracias. El servicio registró tu solicitud. William la revisará y se pondrá en contacto contigo.';
        track('form_submitted'); status.focus();
      } catch (_) {
        status.textContent = 'No pudimos confirmar la recepción de tu solicitud. Tus datos siguen aquí. Puedes intentarlo de nuevo o llamar al 786-354-8796.';
        status.focus();
      } finally { clearTimeout(timeout); busy = false; submit.disabled = false; token=''; if(widget !== null) window.turnstile.reset(widget); }
    });
  });
  // The existing closed mobile menu must not receive keyboard focus.
  const drawer = document.getElementById('drawer'), burger = document.getElementById('burger');
  if (drawer && burger) {
    document.addEventListener('keydown', e => {
      if (burger.getAttribute('aria-expanded') !== 'true') return;
      if (e.key === 'Escape') { burger.click(); return; }
      if (e.key !== 'Tab') return;
      const links = [...drawer.querySelectorAll('a,button')].filter(x => x.getClientRects().length);
      const first = links[0], last = links.at(-1);
      if (e.shiftKey && document.activeElement === first) {e.preventDefault(); last.focus();}
      else if (!e.shiftKey && document.activeElement === last) {e.preventDefault(); first.focus();}
    });
  }
})();
