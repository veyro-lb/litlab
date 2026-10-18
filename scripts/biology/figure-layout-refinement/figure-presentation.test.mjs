import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {getFigurePresentation} from '../../../src/biology/learning/figure-presentation.ts';
const asset=(extra={})=>({id:'a',kind:'diagram',src:'/biology/new.svg',captionTitle:'Example',...extra});
test('scientific sizes and overrides',()=>{
 assert.equal(getFigurePresentation(asset({kind:'molecular-model'})).size,'compact');
 assert.equal(getFigurePresentation(asset({id:'krebs-cycle'})).size,'detailed');
 assert.equal(getFigurePresentation(asset({id:'action-potential-trace'})).size,'wide');
 assert.equal(getFigurePresentation(asset({id:'krebs-cycle',displaySize:'standard'})).size,'standard');
});
test('PDF provenance is not reproduction permission',()=>{
 assert.equal(getFigurePresentation(asset({src:'/biology/source-pdf-figures/figure.png'})).rightsWithheld,true);
 assert.equal(getFigurePresentation(asset({src:'/biology/source-pdf-figures/figure.png',publicReproductionRights:'cleared'})).rightsWithheld,false);
});
test('all lesson figure placements still point to known assets',()=>{
 const location=resolve('src/biology/learning');let lessons=0,figures=0;
 for(const d of readdirSync(location,{withFileTypes:true})){
  if(!d.isDirectory())continue;
  let lesson;try{lesson=JSON.parse(readFileSync(join(location,d.name,'lesson.json'),'utf8'))}catch(e){if(e.code==='ENOENT')continue;throw e}
  lessons++;const assets=new Set(lesson.assets.map(a=>a.id));
  for(const section of lesson.sections)for(const p of section.figurePlacements||[]){assert.ok(assets.has(p.assetId),lesson.topicId+': '+p.assetId);figures++}
 }
 assert.equal(lessons,40);assert.ok(figures>0);
});
test('responsive original aspect ratio and zoom controls are styled',()=>{
 const css=readFileSync('src/biology/biology.css','utf8');
 for(const token of ['data-size="compact"','data-size="detailed"','bio-figure-zoom img','object-fit:contain','@media(max-width:760px)'])assert.ok(css.includes(token),token);
});
