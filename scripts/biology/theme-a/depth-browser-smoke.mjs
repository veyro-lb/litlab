import {chromium,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const chrome=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[
 {id:'A1.1.6',topic:'A1.1',needle:'Compare aquatic habitat properties with the biological effect'},
 {id:'A1.2.6',topic:'A1.2',needle:'What an accurate IB DNA drawing must show'},
 {id:'A1.2.7',topic:'A1.2',needle:'Identify DNA and RNA by three required features'},
 {id:'A1.2.13',topic:'A1.2',needle:'Interpret the nucleosome as a DNA–protein complex'}
];
let passes=0;
try {
 await mkdir('qa-artifacts/theme-a-depth',{recursive:true});
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const context=await chrome.newContext({viewport,serviceWorkers:'block'});
  await context.addInitScript(()=>{
   localStorage.setItem('litlab:biology:preferences:v1','HL');
   localStorage.setItem('litlabTheme','light');
  });
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.origin===new URL(base).origin)return route.continue();
   return route.abort();
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  for(const item of checks){
   await page.goto(base+'#biology/topic/'+item.topic+'/learn?understanding='+item.id);
   const section=page.locator('.bio-lesson-content');
   await expect(section).toHaveAttribute('data-understanding-id',item.id,{timeout:15000});
   await expect(page.locator('.bio-reading')).toBeVisible();
   await expect(page.getByText(item.needle,{exact:false}).first()).toBeVisible();
   const passages=page.locator('.bio-reading-passage');
   if(await passages.count()<2)throw Error(item.id+': missing substantive passages');
   passes++;
   console.log('PASS '+viewport.width+' '+item.id+': '+await passages.count()+' visible teaching blocks');
  }
  await page.screenshot({path:'qa-artifacts/theme-a-depth/reading-'+viewport.width+'.png',fullPage:true});
  if(errors.length)throw Error('Browser JavaScript exceptions: '+errors.join('; '));
  await context.close();
 }
} finally {
 await chrome.close();
}
console.log('PASS representative Theme A browser checks: '+passes+' across two viewports');
