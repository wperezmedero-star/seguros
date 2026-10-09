/* Campaign labels are allowlisted. No contact data in URLs, analytics or browser storage. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const health = params.get('tema') === 'salud';
  const channel = ['facebook', 'instagram', 'whatsapp', 'youtube'].includes(params.get('canal')) ? params.get('canal') : 'directo';
  const topic = health ? 'SALUD' : 'VIDA';
  const set = (id, value) => { document.getElementById(id).textContent = value; };
  document.getElementById('interes').value = health ? 'salud' : 'familia';
  document.getElementById('canal').value = channel;
  document.getElementById('whatsapp').href = 'https://wa.me/17863548796?text=' + encodeURIComponent(`Hola William, vengo de ${channel}. Me interesa ${topic} y quiero que me orientes en español.`);
  if (health) {
    document.title = 'Interés en cobertura de salud | William Pérez Seguros';
    set('eyebrow', 'COBERTURA DE SALUD');
    set('heading', '¿Buscas orientación sobre cobertura de salud?');
    set('intro', 'Déjame tu solicitud para conversar sobre lo que necesitas y confirmar cómo podemos ayudarte mediante los canales autorizados.');
    set('step2', 'Confirmamos el canal autorizado para atender tu solicitud.');
    set('step3', 'Te explicamos el siguiente paso antes de que decidas.');
    set('conditions', 'Registrar tu interés no es una inscripción, no activa una cobertura ni confirma elegibilidad o subsidios.');
    document.getElementById('online').hidden = true;
  }
  const form = document.getElementById('contact-form');
  form.hidden = false;
  const phone = document.getElementById('telefono');
  const status = document.getElementById('status');
  const submit = document.getElementById('submit');
  let busy = false;
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const digits = phone.value.replace(/\D/g, '');
    phone.setCustomValidity(/^(?:1)?\d{10}$/.test(digits) ? '' : 'Revisa el teléfono: debe tener 10 dígitos, con el 1 inicial opcional.');
    if (!form.reportValidity()) return;
    busy = true; submit.disabled = true;
    status.textContent = 'Enviando tu solicitud…';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const body = new FormData(form);
      body.set('nombre', document.getElementById('nombre').value.trim());
      body.set('subject', `Solicitud ${topic} — ${channel}`);
      body.set('enviado', new Date().toISOString());
      const response = await fetch(form.action, {method:'POST', headers:{Accept:'application/json'}, body, signal:controller.signal, credentials:'omit', cache:'no-store'});
      if (!response.ok) throw new Error('not-accepted');
      form.reset();
      document.getElementById('interes').value = health ? 'salud' : 'familia';
      document.getElementById('canal').value = channel;
      status.textContent = 'Gracias. El servicio registró tu solicitud. William la revisará para ponerse en contacto contigo.';
    } catch (_) {
      status.textContent = 'No pudimos confirmar la recepción. Tus datos siguen aquí. Puedes volver a intentarlo o usar WhatsApp o llamar al 786-354-8796.';
    } finally {
      clearTimeout(timer); busy = false; submit.disabled = false; status.focus();
    }
  });
})();
