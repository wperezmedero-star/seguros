const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const repo=path.resolve(__dirname,'../..');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
(async()=>{
 const server=http.createServer((req,res)=>{let pathname=new URL(req.url,'http://local').pathname;if(pathname.endsWith('/'))pathname+='index.html';const file=path.resolve(repo,'.'+pathname);fs.readFile(file,(e,data)=>{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.writeHead(e?404:200);res.end(e?'missing':data);});});
 await new Promise(r=>server.listen(8771,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:8771/tarjeta/');
  await page.waitForFunction(()=>window.dataLayer?.some(e=>e.event==='card_view'));
  await page.waitForFunction(()=>[...document.styleSheets].some(s=>s.href?.includes('card-luminous.css')));

  const topbarBg=await page.locator('.topbar').evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.equal(topbarBg,'rgb(15, 111, 134)','hero/topbar must be ocean blue');
  const needsBg=await page.locator('#necesidades').evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
  assert.match(needsBg,/rgb\(237, 248, 247\)|rgb\(248, 251, 248\)/,'needs area must be light');

  const expected={
   vida:['Pensar en ellos también es cuidar de usted.','personas que dependen'],
   salud:['Su salud merece una conversación clara.','cobertura de salud'],
   medicare:['Entender sus opciones. Decidir con calma.','Medicare'],
   retiro:['Su próximo capítulo empieza con claridad.','objetivos para el retiro']
  };
  for(const [key,[title,fragment]] of Object.entries(expected)){
   await page.locator(`[data-service="${key}"]`).click();
   await page.waitForFunction(({title})=>document.querySelector('#serviceTitle')?.textContent.trim()===title,{title});
   assert.equal((await page.locator('#serviceTitle').innerText()).trim(),title);
   assert.match(await page.locator('#serviceText').innerText(),new RegExp(fragment,'i'));
   assert.equal(await page.locator(`[data-service="${key}"]`).getAttribute('aria-pressed'),'true');
  }
  assert.deepEqual(errors,[]);
  console.log('Real card selector + luminous theme QA: PASS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
