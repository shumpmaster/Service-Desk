const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs=[];
  for (const theme of ['light','dark']) for (const o of ['now','a','b','c']) {
    const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, colorScheme: theme });
    p.on('pageerror', e=>errs.push(o+': '+e.message));
    await p.goto('file://'+process.cwd()+'/optw/'+o+'.html'); await p.waitForTimeout(1200);
    await p.click('[data-proj="tl"]'); await p.waitForTimeout(2500);
    await p.addStyleTag({content:'html,body{scroll-behavior:auto!important}'});
    // hide the floating tab bar so the lanes show; noted on the page
    await p.evaluate(()=>{ [...document.querySelectorAll('body *')].filter(e=>getComputedStyle(e).position==='fixed' && e.getBoundingClientRect().top>600).forEach(t=>t.style.visibility='hidden'); });
    const y = await p.evaluate(()=>{const e=document.querySelector('.pl.open'); return e.getBoundingClientRect().top+window.scrollY;});
    await p.screenshot({ path: `optw/${o}-${theme}.png`, fullPage:true, clip:{x:0,y:y-110,width:393,height:760} });
    await p.close();
  }
  console.log(errs); await b.close();
})();
