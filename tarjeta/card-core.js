/* William Pérez-Mederos · card v2. Native, local-first, no analytics IDs or lead backend. */
(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const CANONICAL='https://williamperezseguros.com/tarjeta/', PHONE='17863548796';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const labels={vida:'Vida',salud:'Salud',medicare:'Medicare',retiro:'Retiro'};
const services={
 vida:{label:'SEGURO DE VIDA',title:'Pensar en ellos también es cuidar de usted.',text:'Hablemos de las personas que dependen de usted y de las opciones de protección para su familia.',note:'Un buen comienzo: entender qué necesita proteger.',message:'Hola William. Vi su tarjeta digital y quisiera revisar opciones de seguro de vida.'},
 salud:{label:'COBERTURA DE SALUD',title:'Su salud merece una conversación clara.',text:'Revisemos sus preguntas sobre cobertura de salud y qué aspectos conviene considerar antes de elegir.',note:'Empecemos por lo que es importante para usted.',message:'Hola William. Vi su tarjeta digital y quisiera información sobre mis opciones de cobertura de salud.'},
 medicare:{label:'ORIENTACIÓN SOBRE MEDICARE',title:'Entender sus opciones. Decidir con calma.',text:'Conversemos sobre Medicare y sus partes A, B, C y D, con explicaciones en español y espacio para sus preguntas.',note:'Orientación independiente, sin afiliación con Medicare ni los CMS.',message:'Hola William. Vi su tarjeta digital y quisiera orientación sobre Medicare.'},
 retiro:{label:'RETIRO / ANUALIDADES',title:'Su próximo capítulo empieza con claridad.',text:'Hablemos de sus objetivos para el retiro y de sus preguntas sobre anualidades, sus condiciones y cómo funcionan.',note:'Primero sus objetivos. Después, las opciones.',message:'Hola William. Vi su tarjeta digital y quisiera conversar sobre opciones para mi retiro.'}
};
const keys=['src','utm_source','utm_medium','utm_campaign','utm_content'], params=new URLSearchParams(location.search);
const validTag=v=>typeof v==='string' && /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/.test(v) && !/^\d{7,}$/.test(v);
const clean=o=>Object.fromEntries(keys.filter(k=>validTag(o[k])).map(k=>[k,o[k]]));
let attribution=clean(Object.fromEntries(params));
try{
 const previous=JSON.parse(sessionStorage.getItem('wp-card-attribution-v2')||'null');
 if(!Object.keys(attribution).length && previous && Number.isFinite(previous.at) && Date.now()-previous.at<1800000 && Date.now()>=previous.at) attribution=clean(previous.tags||{});
 if(Object.keys(attribution).length) sessionStorage.setItem('wp-card-attribution-v2',JSON.stringify({at:Date.now(),tags:attribution}));
 else sessionStorage.removeItem('wp-card-attribution-v2');
}catch{}
function track(event,extra={}){ const detail={event,...attribution,...extra}; window.dataLayer=window.dataLayer||[];window.dataLayer.push(detail);document.dispatchEvent(new CustomEvent('card:analytics',{detail})); }
let selected=Object.hasOwn(services,params.get('interes'))?params.get('interes'):'vida';
let intentional=Object.hasOwn(services,params.get('interes'));
const originNote=()=>Object.keys(attribution).length?'\nOrigen de la tarjeta: '+new URLSearchParams(attribution):'';
function waURL(message){return 'https://wa.me/'+PHONE+'?text='+encodeURIComponent(message+originNote());}
function sharedURL(method){const url=new URL(CANONICAL);for(const [k,v] of Object.entries(attribution))url.searchParams.set(k,v);if(!url.searchParams.has('src'))url.searchParams.set('src',method);if(intentional)url.searchParams.set('interes',selected);return url.href;}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),4500);}
function updateWA(){
 $$('[data-wa]').forEach(a=>{let key=a.dataset.wa;let message;
 if(key==='context')message=intentional?services[selected].message:'Hola William. Vi su tarjeta digital y quisiera que me explique mis opciones.';
 else message=services[key]?.message || (key==='accidentes'?'Hola William. Quisiera información sobre seguro de accidentes.':'Hola William. Quisiera una asesoría personal para entender mis opciones.');
 a.href=waURL(message);a.dataset.waService=key==='context'?(intentional?selected:'general'):key;
 });
 $('#serviceWa').href=waURL(services[selected].message);$('#serviceWa').dataset.waService=selected;
 $('#serviceWa').lastChild.textContent='Hablar sobre '+labels[selected];
 $('#stickyContext').textContent=intentional?'Conversemos sobre '+labels[selected]:'Hablemos de sus opciones';
}
function selectService(key,emit=true){selected=key;intentional=emit||intentional;
 $$('[data-service]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.service===key)));
 for(const [id,prop] of [['serviceLabel','label'],['serviceTitle','title'],['serviceText','text'],['serviceNote','note']])$('#'+id).textContent=services[key][prop];
 const copy=$('.service-copy');copy.classList.remove('changed');requestAnimationFrame(()=>copy.classList.add('changed'));
 $('#leadInterest').value=key;resetDraft();updateWA();if(emit)track('service_selected',{service:key});
}
$$('[data-service]').forEach(b=>b.addEventListener('click',()=>selectService(b.dataset.service)));
$$('[data-wa]').forEach(a=>a.addEventListener('click',()=>track('whatsapp_click',{service:a.dataset.waService,placement:a.dataset.placement||'area'})));
$$('a[href^="tel:"]').forEach(a=>a.addEventListener('click',()=>track('phone_click')));
$('#mainCta').addEventListener('click',()=>{track('cta_main_click');setTimeout(()=>$('#necesidades').focus({preventScroll:true}),100);});
// Native dialogs retain keyboard focus and Escape semantics.
function openDialog(id){const d=$('#'+id);d._opener=document.activeElement;if(!d.open)d.showModal();}
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>openDialog(b.dataset.open)));
$$('dialog').forEach(d=>{
 let outside=false;const isOutside=e=>{const r=d.getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;};
 d.addEventListener('pointerdown',e=>outside=e.target===d&&isOutside(e));
 d.addEventListener('click',e=>{if(outside&&e.target===d&&isOutside(e))d.close();outside=false;});
 d.addEventListener('close',()=>{if(d._opener?.isConnected)d._opener.focus({preventScroll:true});});
});
new IntersectionObserver(entries=>{const show=!entries[0].isIntersecting;$('#sticky').hidden=!show;},{threshold:0}).observe($('#hero'));
const rail=$('#rail');function railState(){$('#railPrev').disabled=rail.scrollLeft<4;$('#railNext').disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-4;}
$('#railPrev').addEventListener('click',()=>rail.scrollBy({left:-rail.clientWidth*.8,behavior:reduced?'auto':'smooth'}));
$('#railNext').addEventListener('click',()=>rail.scrollBy({left:rail.clientWidth*.8,behavior:reduced?'auto':'smooth'}));rail.addEventListener('scroll',railState,{passive:true});addEventListener('resize',railState);railState();
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
const escapeV=s=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
function foldV(line){let out='',segment='',bytes=0;for(const ch of line){const size=new TextEncoder().encode(ch).length;if(bytes+size>75){out+=segment+'\r\n';segment=' ';bytes=1;}segment+=ch;bytes+=size;}return out+segment;}
$('#guardar').addEventListener('click',()=>{
 const rows=['BEGIN:VCARD','VERSION:3.0','N:Pérez-Mederos;William;;;','FN:William Pérez-Mederos','TITLE:Agente de Seguros Licenciado en Florida (0215)','ORG:'+escapeV('William Pérez-Mederos, Agente de Seguros'),'TEL;TYPE=CELL,VOICE:+17863548796','EMAIL;TYPE=INTERNET:wperezmedero@gmail.com','URL:https://williamperezseguros.com','ADR;TYPE=WORK:;;650 E 58th St;Hialeah;FL;33013;USA','NOTE:'+escapeV('Vida, Salud y Contratos Variables. Licencia de Florida 0215 n.º G369134 · NPN 22325493.'),'END:VCARD'];
 download(new Blob([rows.map(foldV).join('\r\n')+'\r\n'],{type:'text/vcard;charset=utf-8'}),'William-Perez-Mederos.vcf');track('save_contact',{method:'vcf_download'});toast('Abra el archivo descargado para guardar el contacto.');
});
async function copyField(id){const el=$('#'+id);try{await navigator.clipboard.writeText(el.value);toast('Copiado.');return true;}catch{el.focus();el.select();toast('Mantenga pulsado el texto seleccionado y elija Copiar.');return false;}}
$('#compartir').addEventListener('click',async()=>{
 const data={title:'William Pérez-Mederos — Agente de seguros',text:'Vida, Salud, Medicare y Retiro. Atención en español.',url:sharedURL('compartir')};
 if(navigator.share){try{await navigator.share(data);track('share_card',{method:'native'});return;}catch(e){if(e.name==='AbortError')return;}}
 $('#shareUrl').value=data.url;openDialog('shareDialog');
});
$('#copyShare').addEventListener('click',async()=>{if(await copyField('shareUrl'))track('share_card',{method:'clipboard'});});
$$('[data-qr]').forEach(b=>b.addEventListener('click',()=>{
 const url=sharedURL('qr'),el=$('#qrCode');el.replaceChildren();$('#qrUrl').value=url;
 if(typeof QRCode==='undefined'){toast('No se pudo generar el QR. Puede compartir el enlace.');openDialog('qrDialog');return;}
 new QRCode(el,{text:url,width:216,height:216,colorDark:'#0a192f',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
 el.querySelectorAll('img,canvas').forEach(child=>{child.setAttribute('aria-hidden','true');if(child.tagName==='IMG')child.alt='';});
 openDialog('qrDialog');track('qr_open');
}));
$('#copyQr').addEventListener('click',()=>copyField('qrUrl'));
$('#downloadQr').addEventListener('click',()=>{
 const source=$('#qrCode canvas');if(!source){toast('Genere el QR de nuevo antes de descargar.');return;}
 const canvas=document.createElement('canvas');canvas.width=1120;canvas.height=1120;const c=canvas.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,1120,1120);c.imageSmoothingEnabled=false;c.drawImage(source,128,128,864,864);canvas.toBlob(blob=>{if(blob)download(blob,'William-Perez-QR.png');});
});
// DIME: keep the existing educational formula and make its assumptions explicit.
const inputs=['cD','cI','cH','cN'].map(id=>$('#'+id));const money=n=>'$'+Math.round(n).toLocaleString('en-US');let calcTimer,lastSignature='';
function calculate(emit=false){clearTimeout(calcTimer);let valid=true;
 inputs.forEach(i=>{const n=Number(i.value),ok=!i.validity.badInput&&Number.isFinite(n)&&n>=0&&n<=Number(i.max)&&Number.isInteger(n);i.setAttribute('aria-invalid',String(!ok));if(!ok)valid=false;});
 $('#calcError').textContent=valid?'':'Use cantidades enteras de 0 a 100,000,000 y de 0 a 10 hijos.';
 if(!valid){$('#cTotal').textContent='—';$('#cDesglose').replaceChildren();$('#cWa').removeAttribute('href');$('#cWa').setAttribute('aria-disabled','true');return;}
 const [D,I,H,N]=inputs.map(i=>Number(i.value)),total=D+I*10+H+N*40000+15000;
 $('#cTotal').textContent=money(total);$('#cDesglose').replaceChildren();
 [['Deudas',D],['Ingreso × 10 años',I*10],['Casa',H],['Educación',N*40000],['Gastos finales',15000]].forEach(([label,value])=>{const row=document.createElement('div'),span=document.createElement('span'),b=document.createElement('b');span.textContent=label;b.textContent=money(value);row.append(span,b);$('#cDesglose').append(row);});
 $('#cWa').removeAttribute('aria-disabled');$('#cWa').href=waURL('Hola William. Usé la calculadora DIME de su tarjeta y el estimado educativo fue de '+money(total)+'. Quiero revisar este resultado y entender mis opciones.');
 const signature=inputs.map(i=>i.value).join('|');if(emit&&signature!==lastSignature)calcTimer=setTimeout(()=>{lastSignature=signature;track('calculator_complete',{method:'dime'});},650);
}
inputs.forEach(i=>i.addEventListener('input',()=>calculate(true)));
$('#abreCalc').addEventListener('click',()=>{openDialog('calc');calculate();track('calculator_start');});
$('#cWa').addEventListener('click',e=>{if($('#cWa').getAttribute('aria-disabled')==='true'){e.preventDefault();return;}track('whatsapp_click',{service:'vida',placement:'calculator'});});
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let recognition;
$$('.voz').forEach(b=>{if(!SR){b.hidden=true;return;}$('#voiceNote').hidden=false;b.addEventListener('click',()=>{
 recognition?.abort();recognition=new SR();recognition.lang='es-US';recognition.interimResults=false;recognition.maxAlternatives=1;
 recognition.onstart=()=>b.classList.add('oyendo');recognition.onend=()=>b.classList.remove('oyendo');recognition.onerror=()=>toast('No se pudo usar el micrófono. Puede escribir la cifra.');
 recognition.onresult=e=>{const text=e.results[0][0].transcript.toLowerCase();let n=Number.parseFloat(text.replace(/[^0-9.,]/g,'').replace(/,/g,''));if(/mill[oó]n/.test(text))n*=1000000;else if(/mil\b/.test(text)&&n<1000)n*=1000;if(Number.isFinite(n)&&n>=0){$('#'+b.dataset.voz).value=Math.round(n);calculate(true);}else toast('No entendí el número. Intente escribirlo.');};
 try{recognition.start();}catch{toast('El dictado no está disponible. Puede escribir la cifra.');}
});});
$('#calc').addEventListener('close',()=>{recognition?.abort();clearTimeout(calcTimer);});
// No backend exists. Build a truthful, reviewable manual email handoff.
function resetDraft(){$('#leadDraft').hidden=true;$('#leadForm').hidden=false;$('#leadPreview').value='';$('#sendEmail').href='mailto:wperezmedero@gmail.com';}
$$('[data-lead]').forEach(b=>b.addEventListener('click',()=>{$('#leadInterest').value=selected;resetDraft();openDialog('lead');track('lead_form_open',{service:selected});}));
const leadPhone=$('#leadPhone'),leadName=$('#leadName');
function validateLead(){let phone=leadPhone.value.replace(/\D/g,'');if(phone.length===11&&phone[0]==='1')phone=phone.slice(1);leadPhone.setCustomValidity(/^[2-9]\d{2}[2-9]\d{6}$/.test(phone)?'':'Ingrese un teléfono válido de EE. UU. con código de área.');leadName.setCustomValidity(leadName.value.trim().length>=2?'':'Escriba su nombre.');return phone;}
[leadPhone,leadName].forEach(el=>el.addEventListener('input',validateLead));
$('#leadForm').addEventListener('submit',e=>{e.preventDefault();const phone=validateLead();if(!e.target.reportValidity())return;
 const data=new FormData(e.target),service=data.get('interes');
 const text=['Hola William. Quisiera que me contacte para conversar sobre mis opciones.','','Nombre: '+leadName.value.trim(),'Teléfono: +1'+phone,'Interés: '+labels[service],'Horario preferido: '+data.get('horario'),'Método preferido: '+data.get('metodo'),'','Autorizo a William Pérez-Mederos a contactarme sobre esta solicitud por el medio elegido.',originNote().trim()].filter((v,i,arr)=>v||arr[i-1]).join('\n');
 $('#leadPreview').value=text;$('#sendEmail').href='mailto:wperezmedero@gmail.com?subject='+encodeURIComponent('Solicitud de contacto — '+labels[service])+'&body='+encodeURIComponent(text);
 $('#leadForm').hidden=true;$('#leadDraft').hidden=false;$('#leadPreview').focus();track('lead_form_submit',{service,status:'prepared',delivery:'manual_email'});
});
$('#copyLead').addEventListener('click',()=>copyField('leadPreview'));$('#editLead').addEventListener('click',()=>{resetDraft();leadName.focus();});
let installPrompt;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
$('#install').addEventListener('click',async()=>{if(installPrompt){try{await installPrompt.prompt();await installPrompt.userChoice;}catch{}installPrompt=null;}else openDialog('installDialog');});
function connection(){$('#connection').hidden=navigator.onLine;}addEventListener('online',connection);addEventListener('offline',connection);connection();
if('serviceWorker' in navigator && location.protocol!=='file:' && !window.CARD_PREVIEW){
 addEventListener('load',async()=>{try{const registration=await navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'});await navigator.serviceWorker.ready;$('#pwaStatus').textContent='Tarjeta disponible sin conexión. Los mensajes necesitan conexión.';registration.update().catch(()=>{});}catch{$('#pwaStatus').textContent='La tarjeta está disponible en línea. No se pudo preparar el modo sin conexión.';}});
}
if(location.hash==='#nfc'){$('#nfc').hidden=false;$('#nfc').addEventListener('click',async()=>{if(!('NDEFReader' in window)){toast('Este navegador no permite escribir NFC. Use el QR o comparta el enlace.');return;}try{await new NDEFReader().write({records:[{recordType:'url',data:sharedURL('nfc')}]});toast('Sticker NFC grabado.');}catch{toast('No se pudo grabar el NFC. Compruebe el permiso y el sticker.');}});}
selectService(selected,false);track('card_view');
})();
