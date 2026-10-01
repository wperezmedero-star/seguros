const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'../assets/js/navegacion.js'),'utf8');
function setup({cover=false,reduce=false}={}){
 let time=0,seq=0;const timers=new Map(),events={},bandEvents={},classes=new Set(cover?['trans-suave','rayo-cubre']:[]),storage=new Map(),visits=[];
 const cl={contains:x=>classes.has(x),add:(...x)=>x.forEach(v=>classes.add(v)),remove:(...x)=>x.forEach(v=>classes.delete(v))};
 const band={addEventListener:(n,f)=>(bandEvents[n]??=new Set()).add(f),removeEventListener:(n,f)=>bandEvents[n]?.delete(f)};
 const ctx={document:{documentElement:{classList:cl},body:{classList:cl,dataset:{pagina:'sobre-mi',modo:'autorizado'}},querySelector:()=>band,getElementById:()=>null,addEventListener:()=>{}},matchMedia:()=>({matches:reduce}),sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},location:{href:'https://williamperezseguros.com/sobre-mi.html'},URL,window:{},addEventListener:(n,f)=>events[n]=f,setTimeout:(f,ms)=>{timers.set(++seq,{f,at:time+ms});return seq},clearTimeout:id=>timers.delete(id)};
 let href=ctx.location.href;Object.defineProperty(ctx.location,'href',{get:()=>href,set:v=>{visits.push(v);href=v}});
 vm.runInNewContext(source,ctx);
 const advance=ms=>{const end=time+ms;while(true){const [id,t]=[...timers].sort((a,b)=>a[1].at-b[1].at)[0]||[];if(!t||t.at>end)break;time=t.at;timers.delete(id);t.f()}time=end};
 return {nav:ctx.window.WPS.navegar,classes,visits,advance,band,emit:(target)=>[...(bandEvents.animationend||[])].forEach(f=>f({target})),event:(n,e={})=>events[n]?.(e)};
}
let x=setup();x.nav('calculadoras.html');x.advance(500);assert.equal(x.visits.length,1);assert(x.classes.has('rayo-sale'));x.advance(1300);assert(!x.classes.has('rayo-sale'));x.nav('preguntas.html');x.advance(420);assert.equal(x.visits.length,2);
x=setup();x.nav('preguntas.html');x.emit({child:true});assert.equal(x.visits.length,0);x.emit(x.band);assert.equal(x.visits.length,1);x.advance(420);assert.equal(x.visits.length,1);
x=setup();x.nav('preguntas.html');x.event('pagehide');x.event('pageshow',{persisted:true});x.advance(2000);assert.equal(x.visits.length,0);assert(!x.classes.has('rayo-sale'));x.nav('calculadoras.html');x.advance(500);assert.equal(x.visits.length,1);
x=setup({cover:true});x.advance(1300);assert(!x.classes.has('rayo-cubre'));
x=setup({cover:true});x.nav('preguntas.html');x.advance(1300);assert(x.classes.has('rayo-sale'));assert(x.classes.has('trans-suave'));x.advance(500);assert(!x.classes.has('rayo-sale'));
x=setup({reduce:true});x.nav('calculadoras.html');x.nav('preguntas.html');assert.equal(x.visits.length,2);assert(!x.classes.has('rayo-sale'));
console.log('PASS: stalled navigation recovers; nested events ignored; back cache cancels timers; entry fallback preserves new exit; reduced motion stays unlocked.');
