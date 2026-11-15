const fs=require('fs'),{chromium}=require('playwright');
const root=process.argv[2], comp=process.argv[3], out=process.argv[4];
const t=JSON.parse(fs.readFileSync(root+'/tokens.json','utf8'));
let css=':root{'+t.color.tokens.map(x=>`--${x.name}:${x.value.light};`).join('')+t.shadow.tokens.map(x=>`--${x.name}:${x.value.light};`).join('')+[...t.spacing.tokens,...t.radius.tokens,...t.size.tokens].map(x=>`--${x.name}:${x.value};`).join('')+Object.entries(t.type.families).map(([k,v])=>`--font-${k}:${v};`).join('')+'}';
const b=fs.readFileSync(root+'/components/bundle.css','utf8');
(async()=>{const br=await chromium.launch();const p=await br.newPage({viewport:{width:393,height:852},deviceScaleFactor:3});
let h=fs.readFileSync(`${root}/components/${comp}/preview.html`,'utf8').replace('<head>',`<head><style>${css}${b}</style>`);
await p.setContent(h);await p.screenshot({path:out});await br.close();})();
