const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const root=process.argv[2], out=process.argv[3];
const t=JSON.parse(fs.readFileSync(root+'/tokens.json','utf8'));
let css=':root,[data-theme="light"]{'+t.color.tokens.map(x=>`--${x.name}:${x.value.light};`).join('')+t.shadow.tokens.map(x=>`--${x.name}:${x.value.light};`).join('')+'}\n';
css+='[data-theme="dark"]{'+t.color.tokens.map(x=>`--${x.name}:${x.value.dark};`).join('')+t.shadow.tokens.map(x=>`--${x.name}:${x.value.dark};`).join('')+'}\n';
css+=':root{'+[...t.spacing.tokens,...t.radius.tokens,...t.size.tokens].map(x=>`--${x.name}:${x.value};`).join('')+Object.entries(t.type.families).map(([k,v])=>`--font-${k}:${v};`).join('')+'}\n';
const bcss=fs.readFileSync(root+'/components/bundle.css','utf8');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:960,height:400}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
for(const c of fs.readdirSync(root+'/components').filter(d=>fs.existsSync(`${root}/components/${d}/preview.html`))){
 let h=fs.readFileSync(`${root}/components/${c}/preview.html`,'utf8');
 const ht=+(/height=(\d+)/.exec(h)[1]);
 for(const th of ['light','dark']){
  const doc=h.replace('<head>',`<head><style>${css}${c==='Cover'?'':bcss}</style>`).replace('<html lang="en">',`<html lang="en" data-theme="${th}">`).replace(/^<!--.*-->\n/,'');
  await p.setViewportSize({width:960,height:ht}); await p.setContent(doc);
  const sw=await p.evaluate(()=>document.documentElement.scrollHeight);
  if(sw>ht+2) console.log('taller',c,th,sw,'>',ht);
  await p.screenshot({path:`${out}/${c}-${th}.png`});
 }}
console.log('errors',errs);await b.close();})();
