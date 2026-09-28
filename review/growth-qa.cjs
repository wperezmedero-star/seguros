/* Run: NODE_PATH=<QA dependencies> CHROMIUM_EXECUTABLE=<optional binary> node review/growth-qa.cjs
   Dependencies: playwright, axe-core, jsqr, pngjs. No production requests or real submissions. */
const {chromium,webkit}=require('playwright');
const {PNG}=require('pngjs'), jsQR=require('jsqr'), fs=require('fs'),path=require('path'), http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'), out=path.resolve(process.env.QA_OUTPUT||path.join(__dirname,'growth-qa'));
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.webmanifest':'application/manifest+json','.vcf':'text/vcard'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),clean=decodeURIComponent(url.pathname),f=path.join(root,clean.endsWith('/')?clean+'index.html':clean);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',mime[path.extname(f)]||'text/plain');res.end(fs.readFileSync(f));});
const report={screens:[],flows:[],errors:[],externalRequests:[]};
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await (process.env.QA_ENGINE==='webkit'?webkit:chromium).launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']}:{} )});
try{
const routes=['','proteccion.html','calculadoras.html','sobre-mi.html','preguntas.html','tarjeta/','privacidad.html'];
for(const width of [360,390,768,1024,1440]){
 const context=await browser.newContext({viewport:{width,height:width<600?844:1000},reducedMotion:'reduce',hasTouch:width<1100,deviceScaleFactor:1});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push({width,error:e.message}));
 page.on('response',r=>{if(r.status()>=400)report.errors.push({width,status:r.status(),url:r.url()});});
 await page.route('**/*',route=>{if(route.request().url().startsWith(base)||/^(data:|blob:)/.test(route.request().url()))route.continue();else{report.externalRequests.push(route.request().url());route.abort();}});
 for(const route of routes){
  await page.goto(base+'/'+route);await page.evaluate(()=>document.fonts.ready);
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1, brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')),h1:document.querySelectorAll('h1').length}));
  // Trigger lazy images before checking their loaded state.
  await page.evaluate(async()=>{for(const i of document.images)if(i.loading==='lazy'){i.loading='eager';await i.decode().catch(()=>{});}});
  layout.brokenImages=await page.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src')));
  const item={width,route:route||'index.html',...layout};
  if(width===390||width===1440){await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});const axe=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));item.accessibility=axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));}
  if(width===390||width===1440){await page.screenshot({path:path.join(out,`${width}-${route.replace(/[/\.]/g,'-')||'home'}.png`),fullPage:true});}
  report.screens.push(item);
 }
 await context.close();
}
const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await ctx.newPage();p.on('pageerror',e=>report.errors.push({flow:true,error:e.message}));
await p.goto(base+'/');
await p.locator('[data-need="deudas"]').click();assert.equal(await p.locator('[data-lead-form] [name="interes"]').inputValue(),'deudas');assert(await p.locator('#need-response').isVisible());report.flows.push('Self-identification explains and prefills without product recommendation');
await p.locator('#burger').click();assert.equal(await p.locator('#drawer').getAttribute('aria-hidden'),'false');await p.keyboard.press('Escape');assert.equal(await p.locator('#drawer').getAttribute('aria-hidden'),'true');report.flows.push('Mobile navigation opens, focuses, closes with Escape');
const form=p.locator('[data-lead-form]');await form.locator('button[type=submit]').click();assert.equal(await form.locator('[name=nombre]').getAttribute('aria-invalid'),'true');
await form.locator('[name=nombre]').fill('Prueba QA');await form.locator('[name=telefono]').fill('2025550123');await form.locator('[name=consentimiento]').check();await form.locator('button[type=submit]').click();assert(await form.locator('[data-handoff]').isVisible());assert((await form.locator('[data-email-send]').getAttribute('href')).startsWith('mailto:wperezmedero@gmail.com?'));
assert(!(await p.evaluate(()=>window.dataLayer)).some(x=>x.event==='form_submitted'));assert(!(await p.locator('[data-form-status]').innerText()).includes('Gracias.'));
await form.locator('[name=nombre]').fill('Cambio QA');assert(!(await form.locator('[data-handoff]').isVisible()));report.flows.push('Validation, consent, email fallback, invalidation after edits; no false sent event');
await p.goto(base+'/calculadoras.html');await p.locator('[data-run=vida]').click();assert((await p.locator('#out-vida').innerText()).includes('$870,000'));await p.locator('#cv-annualIncome').fill('-1');await p.locator('[data-run=vida]').click();assert((await p.locator('#out-vida').innerText()).toLowerCase().includes('no se pudo calcular'));report.flows.push('DIME default result $870,000; negative input rejected');
for(const k of ['retiro','salud','uni']) {const btn=p.locator(`[data-calc="${k}"]`);if(await btn.count()){await btn.click();await p.locator(`[data-run="${k}"]`).click();assert(!(await p.locator('#out-'+k).innerText()).toLowerCase().includes('no se pudo calcular'));}}
await p.goto(base+'/preguntas.html');await p.locator('#faq-vida summary').first().click();assert(await p.locator('#faq-vida details[open]').count());await p.locator('[data-faq=salud]').click();assert(await p.locator('#faq-salud').isVisible());report.flows.push('FAQs expand and tabs work');
await p.goto(base+'/sobre-mi.html');await p.locator('.about__more').click();assert(await p.locator('#aboutFull').isVisible());report.flows.push('Biography disclosure retained');
await p.goto(base+'/tarjeta/');await p.locator('#flip').click();assert.equal(await p.locator('#flip').getAttribute('aria-pressed'),'true');await p.locator('#flip').click();
const qr64=await p.locator('#backQr canvas').evaluate(c=>c.toDataURL().split(',')[1]);const png=PNG.sync.read(Buffer.from(qr64,'base64'));const decoded=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);assert(decoded&&decoded.data.startsWith('https://williamperezseguros.com/tarjeta/'));report.flows.push('3D flip works; QR decoded: '+decoded.data);
assert.equal(await p.locator('#guardar').getAttribute('href'),'william-perez-mederos.vcf');const vc=await ctx.request.get(base+'/tarjeta/william-perez-mederos.vcf');assert((await vc.text()).includes('TEL'));assert(!(await vc.text()).match(/ADR[^\n]*\d{3,}/));
await p.locator('#guardar').click();assert((await p.evaluate(()=>window.dataLayer)).some(x=>x.event==='contact_saved'));report.flows.push('vCard download and contact event; no street address');
await p.locator('#openCalc').click();await p.locator('#cI').fill('60000');assert.equal(await p.locator('#cTotal').innerText(),'$615,000');await p.locator('#cWa').click();assert(!(await p.locator('#calc').isVisible()));assert.equal(await p.locator('#card-interes').inputValue(),'estimado');report.flows.push('Card DIME and contact handoff; no amounts in form');
await p.locator('[data-show-qr]').click();await p.waitForFunction(()=>document.getElementById('flip').getAttribute('aria-pressed')==='true');assert.equal(await p.locator('#flip').getAttribute('aria-pressed'),'true');
await p.evaluate(()=>Object.defineProperty(navigator,'share',{value:undefined,configurable:true}));
await p.locator('#compartir').click();assert(await p.locator('#shareSheet').isVisible());await p.locator('#copyUrl').click();report.flows.push('Share fallback and QR dialog');
const events=await p.evaluate(()=>window.dataLayer);assert(!JSON.stringify(events).includes('Prueba QA'));assert(!JSON.stringify(events).includes('2025550123'));assert(!JSON.stringify(events).includes('615000'));report.flows.push('Analytics omit form data and calculator amounts');
await ctx.close();
// Mock receiver: tests integration contract only; nothing goes to William or any external service.
for(const scenario of ['accepted','rejected','bad-ack','offline']){
 const c=await browser.newContext({reducedMotion:'reduce'}),page=await c.newPage();
 await page.route('**/assets/js/growth-config.js',r=>r.fulfill({contentType:'text/javascript',body:"window.WPS_GROWTH_CONFIG={leadEndpoint:'/api/leads'}"}));
 await page.route('**/api/leads',async r=>{const data=r.request().postDataJSON();assert.equal(data.nombre,'Prueba QA');assert.equal(data.consentimiento,true);if(scenario==='offline')return r.abort();return r.fulfill({status:scenario==='rejected'?503:200,contentType:'application/json',body:JSON.stringify({accepted:scenario==='accepted'})});});
 await page.goto(base+'/');const f=page.locator('[data-lead-form]');await f.locator('[name=nombre]').fill('Prueba QA');await f.locator('[name=preferencia]').selectOption('email');await f.locator('[name=email]').fill('qa@example.invalid');await f.locator('[name=consentimiento]').check();await f.locator('button[type=submit]').click();
 await page.waitForFunction(()=>!document.querySelector('[data-lead-form] button[type=submit]').disabled);
 const success=(await f.locator('[data-form-status]').innerText()).startsWith('Gracias.');assert.equal(success,scenario==='accepted');const sent=await page.evaluate(()=>window.dataLayer.filter(e=>e.event==='form_submitted').length);assert.equal(sent,scenario==='accepted'?1:0);report.flows.push('Receiver contract '+scenario);await c.close();
}
}catch(e){report.errors.push({assertion:e.stack});}finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));const issues=report.screens.filter(s=>s.overflow||s.brokenImages.length||s.h1!==1||s.accessibility?.length);console.log(JSON.stringify({screens:report.screens.length,flows:report.flows,errors:report.errors,issues,externalRequests:[...new Set(report.externalRequests)]},null,2));if(report.errors.length||issues.length)process.exitCode=1;}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
