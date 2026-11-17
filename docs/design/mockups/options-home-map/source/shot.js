// node shot.js <out dir> : screenshots v13 home as it is and with A, B, C, light and dark, at 393 wide.
const {chromium}=require('playwright'); const path=require('path'); const fs=require('fs');
const out=process.argv[2]; const src=__dirname;
(async()=>{const b=await chromium.launch();
for (const scheme of ['light','dark']) for (const opt of ['now','A','B','C']) {
  const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:2,colorScheme:scheme});
  p.on('pageerror',e=>console.log('ERR',opt,e.message));
  await p.goto('file://'+path.resolve(src,'../../timeline-v13-craft.html'));await p.waitForTimeout(700);
  if (opt!=='now') { await p.addStyleTag({path:path.join(src,'home.css')}); await p.evaluate(o=>window.HM_OPT=o,opt); await p.addScriptTag({path:path.join(src,'home.js')}); await p.waitForTimeout(200); }
  if (opt==='now'||opt==='B') await p.screenshot({path:`${out}/${opt}-${scheme}.png`});
  if (opt!=='B') { await p.evaluate(()=>{const d=document.querySelector('.desk');window.scrollTo(0,d.getBoundingClientRect().top+scrollY-12);}); await p.waitForTimeout(400); await p.screenshot({path:`${out}/${opt}-cards-${scheme}.png`}); }
  if (opt==='B') { await p.mouse.wheel(0,420); await p.waitForTimeout(400); await p.screenshot({path:`${out}/B-scrolled-${scheme}.png`}); }
  await p.close(); }
await b.close();})();
