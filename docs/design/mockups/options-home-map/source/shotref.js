// node shotref.js <out dir> : the project page's floating branch map in v13, the reference for the home options.
const {chromium}=require('playwright'); const path=require('path');
(async()=>{const b=await chromium.launch();
for (const scheme of ['light','dark']) { const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:2,colorScheme:scheme});
  await p.goto('file://'+path.resolve(__dirname,'../../timeline-v13-craft.html'));await p.waitForTimeout(600);
  await p.click('.pcard[data-proj="tl"]');await p.waitForTimeout(1500);
  await p.screenshot({path:`${process.argv[2]}/ref-${scheme}.png`}); await p.close(); }
await b.close();})();
