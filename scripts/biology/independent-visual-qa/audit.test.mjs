import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {audit} from './audit.mjs';

const valid='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><title>Cell</title><circle cx="50" cy="50" r="20"/></svg>';
function fixture(fn){
  const root=mkdtempSync(join(tmpdir(),'biolab-visual-qa-'));
  const write=(path,content)=>{
    const target=join(root,path);mkdirSync(dirname(target),{recursive:true});
    writeFileSync(target,typeof content==='string'?content:JSON.stringify(content));
  };
  write('src/biology/curriculum/registry.json',[{id:'A1.1'}]);
  const lesson={topicId:'A1.1',sections:[{understandingIds:['A1.1.1'],assets:['diagram']}],
    assets:[{id:'diagram',src:'/biology/test/test.svg',alt:'A labelled cell membrane and cytoplasm'}]};
  write('src/biology/learning/water/lesson.json',lesson);
  write('public/biology/test/test.svg',valid);
  try{fn({root,write,lesson});}finally{rmSync(root,{recursive:true,force:true});}
}
test('valid SVG, lesson, and curriculum mapping',()=>fixture(({root})=>{
  const r=audit(root,1);assert.equal(r.errorCount,0);
  assert.equal(r.topicCount,1);assert.equal(r.assetCount,1);
  assert.deepEqual(r.inventory[0].understandingIds,['A1.1.1']);
}));
test('missing registered image is an error rather than a biology claim',()=>fixture(({root,write,lesson})=>{
  lesson.assets[0].src='/biology/test/missing.svg';
  write('src/biology/learning/water/lesson.json',lesson);
  const r=audit(root,1);assert.ok(r.errors.some(x=>x.code==='MISSING_ASSET'));
}));
test('invalid XML and invalid viewBox are detected',()=>fixture(({root,write})=>{
  write('public/biology/test/test.svg','<svg viewBox="0 0 0 100"><g></svg>');
  const r=audit(root,1);assert.ok(r.errors.some(x=>x.code==='INVALID_XML'));
  assert.ok(r.errors.some(x=>x.code==='SVG_STRUCTURE'));
}));
test('recall must have a matching canvas and differ from labelled image',()=>fixture(({root,write,lesson})=>{
  lesson.assets[0].recallSrc='/biology/test/recall.svg';
  write('src/biology/learning/water/lesson.json',lesson);
  write('public/biology/test/recall.svg',valid);
  const r=audit(root,1);assert.ok(r.errors.some(x=>x.code==='IDENTICAL_RECALL'));
  write('public/biology/test/recall.svg',valid.replace('100 100','100 120'));
  const s=audit(root,1);assert.ok(s.errors.some(x=>x.code==='RECALL_VIEWBOX_MISMATCH'));
}));
