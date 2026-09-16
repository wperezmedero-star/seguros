const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const out=path.join(__dirname,'INTERACTIVE.html');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const dataUri=p=>{
 const full=path.join(root,p),ext=path.extname(p).toLowerCase();
 const mime={'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2','.svg':'image/svg+xml'}[ext]||'application/octet-stream';
 return `data:${mime};base64,${fs.readFileSync(full).toString('base64')}`;
};
let html=read('index.html');
let coreCss=read('card-core.css');
let motionCss=read('card.css').replace(/@import\s+url\(["']?card-core\.css["']?\);?/,'');
const qr=read('vendor/qrcode.min.js');
const coreJs=read('card-core.js');
let motionJs=read('card.js');
// In standalone mode the core logic is already inline, so boot motion directly.
motionJs=motionJs.replace(/\n\s*const core=document\.createElement\('script'\);[\s\S]*?document\.head\.appendChild\(core\);\n\}\)\(\);\s*$/,"\n  requestAnimationFrame(()=>requestAnimationFrame(bootMotion));\n})();");
const assetFiles=[];
function walk(dir,prefix=''){
 for(const name of fs.readdirSync(dir)){
  const full=path.join(dir,name),rel=path.posix.join(prefix,name);
  if(fs.statSync(full).isDirectory())walk(full,rel); else assetFiles.push(rel);
 }
}
walk(path.join(root,'assets'),'assets');
if(fs.existsSync(path.join(root,'icono.png')))assetFiles.push('icono.png');
// Longest first prevents accidental partial replacements.
assetFiles.sort((a,b)=>b.length-a.length);
for(const asset of assetFiles){
 const uri=dataUri(asset);
 coreCss=coreCss.split(asset).join(uri);
 motionCss=motionCss.split(asset).join(uri);
 html=html.split(asset).join(uri);
}
html=html
 .replace(/<link[^>]+href=["']card\.css["'][^>]*>\s*/i,'')
 .replace(/<link[^>]+rel=["']manifest["'][^>]*>\s*/ig,'')
 .replace(/<script[^>]+src=["']vendor\/qrcode\.min\.js["'][^>]*><\/script>\s*/i,'')
 .replace(/<script[^>]+src=["']card\.js["'][^>]*><\/script>\s*/i,'');
const bundle=`\n<style id="standalone-card-css">${coreCss}\n${motionCss}</style>\n<script>window.CARD_PREVIEW=true;<\/script>\n<script>${qr}<\/script>\n<script>${coreJs}<\/script>\n<script>${motionJs}<\/script>\n`;
html=html.replace('</body>',bundle+'\n</body>');
fs.writeFileSync(out,html);
console.log(`Standalone preview: ${out} (${Math.round(fs.statSync(out).size/1024)} KB)`);
