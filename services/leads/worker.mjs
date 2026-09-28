/* Independent contact receiver. Never deploy over the voice Worker. */
const ORIGINS = new Set(['https://williamperezseguros.com', 'https://www.williamperezseguros.com']);
const RECIPIENT = 'wperezmedero@gmail.com'; // Existing public contact; not visitor-controlled.
const INTERESTS = {familia:'Protección familiar',deudas:'Hipoteca o deudas',legado:'Seres queridos y legado',permanente:'Protección permanente',estimado:'Revisar necesidad de cobertura',orientacion:'Orientación inicial',salud:'Salud',medicare:'Medicare',retiro:'Retiro / Anualidades'};
const HOURS = {'por-acordar':'Por acordar',manana:'Mañana',tarde:'Tarde',noche:'Noche'};
const KEYS = new Set(['nombre','telefono','email','postal','preferencia','interes','horario','consentimiento','consentimientoVersion','origen','enviado','turnstileToken']);
const clean = (v, max) => typeof v === 'string' && v.length <= max && !/[\x00-\x1f\x7f]/.test(v);
const emailOK = v => clean(v,150) && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v);
function valid(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p) || Object.keys(p).some(k=>!KEYS.has(k))) return false;
  if (!clean(p.nombre,80) || p.nombre.trim().length<2 || !clean(p.telefono,25) || !clean(p.email,150)) return false;
  if (p.telefono && (!/^[+\d ().-]+$/.test(p.telefono) || !/^(1)?\d{10}$/.test(p.telefono.replace(/\D/g,'')))) return false;
  if (p.email && !emailOK(p.email)) return false;
  if (!['llamada','email'].includes(p.preferencia) || (p.preferencia==='email' ? !p.email : !p.telefono)) return false;
  return typeof p.postal==='string' && /^(\d{5})?$/.test(p.postal) && Object.hasOwn(INTERESTS,p.interes) && Object.hasOwn(HOURS,p.horario)
    && p.consentimiento===true && p.consentimientoVersion==='growth-v1'
    && ['/','/index.html','/calculadoras.html','/tarjeta/','/tarjeta/index.html'].includes(p.origen)
    && clean(p.enviado,40) && Number.isFinite(Date.parse(p.enviado))
    && clean(p.turnstileToken,2048) && p.turnstileToken.length>0;
}
async function readLimited(request) {
  if (Number(request.headers.get('content-length'))>8192) throw new Error('size');
  const reader=request.body?.getReader(); if (!reader) throw new Error('body');
  const chunks=[];let length=0;
  try { while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>8192){await reader.cancel();throw new Error('size');}chunks.push(value);} }
  finally { reader.releaseLock(); }
  const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
  return JSON.parse(new TextDecoder().decode(bytes));
}
export default {
  async fetch(request,env) {
    const origin=request.headers.get('Origin')||'';
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
    const reply=(status,error)=>new Response(JSON.stringify({accepted:false,error}),{status,headers});
    if (!ORIGINS.has(origin)) return reply(403,'origin');
    Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});
    if (new URL(request.url).pathname!=='/api/leads') return reply(404,'route');
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(request.method!=='POST')return reply(405,'method');
    if(!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type')||''))return reply(415,'format');
    // Fail closed until account bindings, sender and secret have been verified.
    if(env.LEADS_ENABLED!=='true' || !env.EMAIL?.send || !env.LEAD_LIMITER?.limit || !env.TURNSTILE_SECRET_KEY
      || !emailOK(env.LEAD_FROM) || !env.LEAD_FROM.endsWith('@williamperezseguros.com'))return reply(503,'unavailable');
    let p;try{p=await readLimited(request);}catch{return reply(400,'payload');}
    if(!valid(p))return reply(400,'fields');
    try {
      // A generous regional circuit breaker, not a promise of global exact quotas.
      if(!(await env.LEAD_LIMITER.limit({key:'wps-contact'})).success)return reply(429,'busy');
      const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:p.turnstileToken}),signal:AbortSignal.timeout(6000)
      });
      if(!verification.ok)return reply(503,'verification');
      const check=await verification.json();
      if(check.success!==true || check.hostname!==new URL(origin).hostname || check.action!=='lead_contact')return reply(403,'verification');
      const text=[
        'Nueva solicitud de conversación — William Pérez-Mederos','',
        `Nombre: ${p.nombre.trim()}`,`Teléfono: ${p.telefono||'No indicado'}`,`Email: ${p.email||'No indicado'}`,
        `Código postal: ${p.postal||'No indicado'}`,`Preferencia: ${p.preferencia==='email'?'Email':'Llamada'}`,
        `Interés: ${INTERESTS[p.interes]}`,`Horario: ${HOURS[p.horario]}`,`Origen: ${p.origen}`,
        `Recibida (UTC): ${new Date().toISOString()}`,'',
        'Consentimiento growth-v1: autoriza a William a responder por el medio elegido. No es condición de compra; puede retirar su autorización.',
        'Contacto inicial únicamente. No representa cotización, recomendación de póliza ni aprobación.'
      ].join('\n');
      const result=await env.EMAIL.send({from:{email:env.LEAD_FROM,name:'William Pérez-Mederos · Web'},to:RECIPIENT,
        subject:'Nueva solicitud de conversación — seguros',text,...(p.email?{replyTo:p.email}:{})});
      // Provider acceptance is not an inbox/read receipt. Never report success on failure.
      if(!result?.messageId)return reply(502,'delivery');
      return new Response(JSON.stringify({accepted:true}),{status:200,headers});
    } catch { return reply(503,'unavailable'); } // No prospect data or provider errors in logs.
  }
};
