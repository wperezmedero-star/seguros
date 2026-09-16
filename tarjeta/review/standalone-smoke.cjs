const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('path'),assert=require('assert/strict');
(async()=>{
 const file='file://'+path.resolve(__dirname,'INTERACTIVE.html');
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(file,{waitUntil:'load'});
  await page.locator('[data-service="salud"]').click();
  await page.waitForFunction(()=>document.querySelector('#serviceTitle')?.textContent.includes('salud merece'));
  assert.match(await page.locator('#serviceText').innerText(),/cobertura de salud/i);
  assert.equal(await page.locator('[data-service="salud"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-service="medicare"]').click();
  await page.waitForFunction(()=>document.querySelector('#serviceTitle')?.textContent.includes('Decidir con calma'));
  assert.match(await page.locator('#serviceText').innerText(),/Medicare/i);
  assert.equal(errors.length,0,'Standalone preview page errors: '+errors.join(' | '));
  console.log('Standalone selector QA: PASS');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
