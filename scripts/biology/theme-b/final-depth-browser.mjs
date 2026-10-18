import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const out='qa-artifacts/theme-b-depth';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=[
 ['B1.2','B1.2.9','HL'],['B2.1','B2.1.16','HL'],
 ['B3.1','B3.1.3','HL'],['B3.2','B3.2.14','HL'],
 ['B3.3','B3.3.2','HL'],['B4.1','B4.1.7','HL'],
 ['B4.2','B4.2.11','HL'],['B4.2','B4.2.12','HL']
];
const report={branch:'feature/biolab-ib-theme-b-final-20261018',checks:[],failures:[]};
const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
try{
 for(const width of [390,1280])for(const [topic,id,level] of cases){
  const ctx=await browser.newContext({viewport:{width,height:850},serviceWorkers:'block'});
  await ctx.addInitScript(level=>{localStorage.setItem('litlab:biology:preferences:v1',level);localStorage.litlabTheme='light'},level);
  await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.origin===new URL(base).origin?r.continue():r.abort()});
  const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(String(e)));
  const item={topic,id,width,pass:false};
  try{
   await p.goto(base+'#biology/topic/'+topic+'/learn?understanding='+id);
   await p.locator('[data-understanding-id="'+id+'"]').waitFor({timeout:15000});
   await p.locator('.bio-reading-passage').first().waitFor();
   const paragraphs=await p.locator('.bio-reading-passage').count();
   const visibleTexts=await p.locator('.bio-reading').innerText();
   const overflow=await p.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
   if(paragraphs<4)throw Error('Expected four or more substantive teaching blocks, got '+paragraphs);
   if(visibleTexts.length<1000)throw Error('Insufficient rendered teaching text');
   if(overflow.document>overflow.viewport+2)throw Error('Document overflow: '+JSON.stringify(overflow));
   if(errors.length)throw Error('Runtime errors: '+errors.join('; '));
   if(['B3.1.3','B3.2.14','B3.3.2','B4.1.7','B4.2.11','B4.2.12'].includes(id)){
    const visuals=await p.locator('.bio-learning-visual').count();
    if(!visuals)throw Error('Expected in-lesson sequence or comparison');
    item.visuals=visuals;
   }
   item.paragraphs=paragraphs;item.characterCount=visibleTexts.length;item.pass=true;
   await p.screenshot({path:out+'/'+id+'-'+width+'.png',fullPage:true});
  }catch(e){item.error=String(e);report.failures.push(item)}
  report.checks.push(item);await ctx.close();
 }
}finally{await browser.close()}
await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({tested:report.checks.length,passed:report.checks.filter(x=>x.pass).length,failed:report.failures.length,failures:report.failures},null,2));
if(report.failures.length)process.exitCode=1;
