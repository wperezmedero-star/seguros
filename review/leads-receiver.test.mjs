import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../services/leads/worker.mjs';
const origin='https://williamperezseguros.com';
const payload=()=>({nombre:'Prueba QA',telefono:'2025550123',email:'',postal:'',preferencia:'llamada',interes:'familia',horario:'por-acordar',consentimiento:true,consentimientoVersion:'growth-v1',origen:'/',enviado:new Date().toISOString(),turnstileToken:'local-test-only'});
const request=(p=payload(),headers={},method='POST')=>new Request(origin+'/api/leads',{method,headers:{Origin:origin,'Content-Type':'application/json',...headers},...(method==='POST'?{body:typeof p==='string'?p:JSON.stringify(p)}:{})});
function env(){return {LEADS_ENABLED:'true',LEAD_FROM:'qa@williamperezseguros.com',TURNSTILE_SECRET_KEY:'local-mock-only',LEAD_LIMITER:{limit:async()=>({success:true})},EMAIL:{send:async()=>({messageId:'local-only'})}};}
const realFetch=globalThis.fetch;
let verification={success:true,hostname:'williamperezseguros.com',action:'lead_contact'};
globalThis.fetch=async(url,options)=>{assert.equal(url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');assert.equal(JSON.parse(options.body).secret,'local-mock-only');return Response.json(verification);};
test.after(()=>{globalThis.fetch=realFetch;});
test('accepts only after fixed recipient email provider acknowledgement',async()=>{
 const e=env();let sent;e.EMAIL.send=async m=>{sent=m;return {messageId:'mock-received'};};
 const r=await worker.fetch(request(),e);assert.equal(r.status,200);assert.deepEqual(await r.json(),{accepted:true});assert.equal(sent.to,'wperezmedero@gmail.com');assert(sent.text.includes('Prueba QA'));assert(!sent.text.includes('local-test-only'));assert(!sent.html);assert.equal(r.headers.get('Cache-Control'),'no-store');
});
test('email contact preference and safe reply address',async()=>{const p=payload();p.email='qa@example.invalid';p.telefono='';p.preferencia='email';const e=env();e.EMAIL.send=async m=>{assert.equal(m.replyTo,p.email);return {messageId:'mock'};};assert.equal((await worker.fetch(request(p),e)).status,200);});
for(const [name,change] of [
 ['missing consent',p=>p.consentimiento=false],['wrong consent version',p=>p.consentimientoVersion='unknown'],
 ['sensitive extra field',p=>p.ssn='forbidden'],['attacker recipient',p=>p.to='attacker@example.invalid'],
 ['empty name',p=>p.nombre=' '],['header injection',p=>p.email='qa@example.invalid\r\nBcc: attacker@example.invalid'],
 ['invalid phone',p=>p.telefono='123'],['invalid zip',p=>p.postal='123456'],['unknown interest',p=>p.interes='product'],
 ['unknown schedule',p=>p.horario='invalid'],['arbitrary origin path',p=>p.origen='/unknown'],['missing token',p=>p.turnstileToken=''],
 ['oversized token',p=>p.turnstileToken='x'.repeat(2049)],['invalid email preference',p=>p.preferencia='sms'],
 ['client timestamp invalid',p=>p.enviado='tomorrow'],['prototype key as interest',p=>p.interes='toString']
])test('rejects '+name,async()=>{const p=payload();change(p);assert.equal((await worker.fetch(request(p),env())).status,400);});
test('rejects excessive streamed body even without length header',async()=>assert.equal((await worker.fetch(request(' '.repeat(9000)),env())).status,400));
test('rejects malformed JSON',async()=>assert.equal((await worker.fetch(request('{'),env())).status,400));
test('rejects foreign / missing origins',async()=>{for(const Origin of ['https://attacker.invalid',''])assert.equal((await worker.fetch(request(payload(),{Origin}),env())).status,403);});
test('preflight is scoped; no GET, form encoding or other route',async()=>{
 assert.equal((await worker.fetch(request(null,{},'OPTIONS'),env())).status,204);
 assert.equal((await worker.fetch(request(null,{},'GET'),env())).status,405);
 assert.equal((await worker.fetch(request(payload(),{'Content-Type':'text/plain'}),env())).status,415);
 assert.equal((await worker.fetch(new Request(origin+'/session',{headers:{Origin:origin}}),env())).status,404);
});
test('fails closed if any required account configuration is absent',async()=>{for(const key of ['LEADS_ENABLED','EMAIL','LEAD_LIMITER','TURNSTILE_SECRET_KEY','LEAD_FROM']){const e=env();delete e[key];assert.equal((await worker.fetch(request(),e)).status,503);}});
test('rate limit prevents downstream sends',async()=>{const e=env();e.LEAD_LIMITER.limit=async()=>({success:false});e.EMAIL.send=()=>assert.fail('must not send');assert.equal((await worker.fetch(request(),e)).status,429);});
test('rejects failed, replayed, wrong hostname or wrong action challenge',async()=>{const good=verification;for(const bad of [{success:false},{...good,hostname:'attacker.invalid'},{...good,action:'other'}]){verification=bad;assert.equal((await worker.fetch(request(),env())).status,403);}verification=good;});
test('email failure and missing acknowledgement never produce accepted',async()=>{
 const e=env();e.EMAIL.send=async()=>{throw new Error('private provider error');};const r=await worker.fetch(request(),e);assert.equal(r.status,503);assert(!(await r.text()).includes('private'));
 e.EMAIL.send=async()=>({});assert.equal((await worker.fetch(request(),e)).status,502);
});
