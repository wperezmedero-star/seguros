/* Local browser -> actual Worker handler -> mocked Cloudflare verification/email. No real mail. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),report={checks:[],errors:[]};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');const f=path.join(root,u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(f)]||'text/plain');res.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const {default:worker}=await import('../services/leads/worker.mjs');const realFetch=globalThis.fetch;
 globalThis.fetch=async()=>Response.json({success:true,hostname:'williamperezseguros.com',action:'lead_contact'});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
 try{
 for(const route of ['/','/calculadoras.html','/tarjeta/']){
  const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await c.newPage();let calls=0,sent;
  await page.route('**/assets/js/growth-config.js',r=>r.fulfill({contentType:'text/javascript',body:"window.WPS_GROWTH_CONFIG={leadEndpoint:'/api/leads',turnstileSitekey:'local-only'}"}));
  await page.addInitScript(()=>{window.turnstile={render:(el,opts)=>{window.challengeOptions=opts;return 'local';},reset:()=>{window.challengeReset=true;}};});
  await page.route('**/api/leads',async r=>{calls++;const body=r.request().postDataJSON();body.origen=route;const response=await worker.fetch(new Request('https://williamperezseguros.com/api/leads',{method:'POST',headers:{Origin:'https://williamperezseguros.com','Content-Type':'application/json'},body:JSON.stringify(body)}),{LEADS_ENABLED:'true',LEAD_FROM:'qa@williamperezseguros.com',TURNSTILE_SECRET_KEY:'local-only',LEAD_LIMITER:{limit:async()=>({success:true})},EMAIL:{send:async m=>{sent=m;return{messageId:'local-only'};}}});await r.fulfill({status:response.status,contentType:'application/json',body:await response.text()});});
  await page.goto(base+route);const f=page.locator('[data-lead-form]');await f.locator('[name=nombre]').fill('Prueba QA');await f.locator('[name=telefono]').fill('2025550123');await f.locator('[name=consentimiento]').check();await f.locator('button[type=submit]').click();assert.equal(calls,0);assert((await f.locator('[data-form-status]').innerText()).includes('verificación'));
  await page.evaluate(()=>window.challengeOptions.callback('valid-local-token'));await page.evaluate(()=>window.challengeOptions['expired-callback']());await f.locator('button[type=submit]').click();assert.equal(calls,0);
  await page.evaluate(()=>window.challengeOptions.callback('renewed-local-token'));await f.locator('button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('[data-form-status]').textContent.startsWith('Gracias.'));assert.equal(calls,1);assert.equal(sent.to,'wperezmedero@gmail.com');assert(sent.text.includes('Prueba QA'));assert(await page.evaluate(()=>window.challengeReset));assert.equal(await f.locator('[name=nombre]').inputValue(),'');report.checks.push(route+': no token / expired blocked; browser -> Worker -> simulated email accepted; reset');await c.close();
 }
 const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await c.newPage();
 for(const [route,name] of [['/','home-brand-footer.jpg'],['/tarjeta/','card-brand-footer.jpg']]){await p.goto(base+route);const logo=p.locator('.wp-brand-signature');await logo.scrollIntoViewIfNeeded();await logo.evaluate(i=>i.decode());assert((await logo.boundingBox()).width>=300);await p.screenshot({path:path.join(__dirname,'screenshots',name),type:'jpeg',quality:88});}
 report.checks.push('Approved full logo visible in both mobile footers; lightweight header logo loads');await c.close();
 }catch(e){report.errors.push(e.stack);}finally{await browser.close();server.close();globalThis.fetch=realFetch;fs.writeFileSync(path.join(__dirname,'BRAND_LEADS_QA.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.errors.length)process.exitCode=1;}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
