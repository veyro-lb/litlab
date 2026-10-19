// Sprint 9 source-scoped validation. Run at repository root:
// node scripts/biology/final-d3-d4/validate.mjs
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const specifications = [
  ['reproduction', 'D3.1', 20, 13],
  ['inheritance', 'D3.2', 21, 16],
  ['homeostasis', 'D3.3', 11, 7],
  ['natural-selection', 'D4.1', 15, 9],
  ['stability-change', 'D4.2', 15, 12],
  ['climate-change', 'D4.3', 12, 9],
];
const report = { topics: 0, understandings: 0, written: 0, selection: 0, assets: 0, negativeControls: 0, illustrationChecks: 0 };
function load(path) { return JSON.parse(readFileSync(path, 'utf8')); }
function errors(spec, doc) {
  const [slug, code, number, hlStart] = spec, faults = [];
  const check = (ok, why) => { if (!ok) faults.push(why); };
  const ids = new Set(), sourceIds = new Set(doc.references.map(x=>x.id));
  const assets = new Set(doc.assets.map(x=>x.id));
  check(doc.topicId === code, code + ': topic ID');
  check(doc.sections.length === number, code + ': coverage');
  doc.sections.forEach((s, i) => {
    const id = code + '.' + (i + 1), level = i + 1 >= hlStart ? 'HL' : 'shared';
    check(JSON.stringify(s.understandingIds) === JSON.stringify([id]), id + ': numbered ID');
    check(s.level === level, id + ': SL/HL boundary');
    check(!ids.has(id), id + ': duplicate');
    ids.add(id);
    check(s.explanation === s.teachingBlocks.map(b=>b.explanation).join('\n\n'), id + ': teaching block/source concordance');
    check(s.explanation === s.claimReferences.map(b=>b.claim).join('\n\n'), id + ': claim/source concordance');
    check(s.explanation.length >= 80, id + ': explanation');
    check(s.interactions.length > 0 && s.recall.length > 0, id + ': interactive teaching');
    for (const i of s.interactions.filter(x=>x.kind === 'selection'))
      check(i.options.length >= 3 && i.options.filter(o=>o.correct).length === 1 && i.options.every(o=>o.feedback), id + ': interaction answer key');
    for (const key of s.assets || []) check(assets.has(key), id + ': missing asset ' + key);
    for (const b of [...s.claimReferences, ...s.teachingBlocks])
      for (const ref of b.referenceIds || []) check(sourceIds.has(ref), id + ': unknown source ' + ref);
    const written = doc.questions.filter(q=>q.kind === 'structured-response' && q.understandingIds.includes(id));
    check(written.length === 1, id + ': exactly one structured response');
    for (const q of written) {
      // D3.2.2 is an intentionally five-part controlled-cross question.
      const requiredMarks = id === 'D3.2.2' ? 5 : 3;
      check(q.marks === requiredMarks, id + ': mark value');
      check(q.markingPoints.length === requiredMarks && q.markingPoints.every(p=>typeof p==='string' && p.trim().length >= 10), id + ': specific ' + requiredMarks + '-point rubric');
      if(id === 'D3.2.2') check(new Set(q.markingPoints).size === 5, id + ': unique five-part rubric');
      check(q.level === level, id + ': written question level');
      check(q.sectionId === s.id, id + ': written question mapping');
    }
    const mcq = doc.questions.filter(q=>q.kind === 'selection' && q.understandingIds.includes(id));
    if (slug !== 'reproduction') check(mcq.length === 1, id + ': written/selection pair');
    for (const q of mcq) {
      check(q.level === level, id + ': MCQ level');
      check(q.options.length === 4 && q.options.filter(x=>x.correct).length === 1, id + ': MCQ correct key');
      check(q.options.every(x=>typeof x.feedback==='string' && x.feedback.length>8), id + ': distractor feedback');
    }
  });
  doc.questions.forEach(q => {
    for (const id of q.understandingIds) check(ids.has(id), q.id + ': question/section mapping');
    for (const ref of q.referenceIds || []) check(sourceIds.has(ref), q.id + ': question source');
  });
  doc.assets.forEach(a=>{
    check(a.src && a.alt && a.captionTitle && a.referenceIds && a.referenceIds.length, a.id + ': attribution');
    for(const ref of a.referenceIds||[])check(sourceIds.has(ref),a.id + ': figure source');
    check(existsSync('public' + a.src), a.id + ': missing SVG/image');
    if(a.src.endsWith('.svg') && existsSync('public' + a.src)){
      const svg = readFileSync('public' + a.src, 'utf8');
      check(svg.includes('<svg') && svg.includes('</svg>') && !/<script\b/i.test(svg),a.id + ': SVG preflight');
    }
  });
  return faults;
}
for(const spec of specifications) {
  const [slug,code,n] = spec;
  const doc=load('src/biology/learning/'+slug+'/lesson.json');
  const e=errors(spec,doc);
  assert.deepEqual(e, [],code+' preflight: '+JSON.stringify(e));
  report.topics++;report.understandings+=n;
  report.written += doc.questions.filter(q=>q.kind==='structured-response').length;
  report.selection += doc.questions.filter(q=>q.kind==='selection').length;
  report.assets += doc.assets.length;
  report.illustrationChecks += doc.assets.filter(a=>a.src.endsWith('.svg')).length;
  // Negative controls: tampering must be detected, not silently accepted.
  const badId=structuredClone(doc);
  badId.sections[0].understandingIds=['D9.9.99'];
  assert(errors(spec,badId).some(x=>x.includes('numbered ID')));report.negativeControls++;
  const badScope=structuredClone(doc);
  badScope.sections[spec[3]-1].level='shared';
  assert(errors(spec,badScope).some(x=>x.includes('SL/HL boundary')));report.negativeControls++;
  if(code === 'D3.2') {
    const bad=structuredClone(doc), question=bad.questions.find(q=>q.id==='d32-written-2');
    assert(question && question.marks===5 && question.markingPoints.length===5,'Question changed without re-review');
    question.marks=3;
    assert(errors(spec,bad).includes('D3.2.2: mark value'));
    const badPoints=structuredClone(doc);
    badPoints.questions.find(q=>q.id==='d32-written-2').markingPoints.pop();
    assert(errors(spec,badPoints).includes('D3.2.2: specific 5-point rubric'));
  }
  const badClaim=structuredClone(doc);
  badClaim.sections[0].explanation += ' unreferenced';
  assert(errors(spec,badClaim).some(x=>x.includes('concordance')));report.negativeControls++;
  const badKey=structuredClone(doc);
  badKey.sections[0].interactions[0].options[0].correct=true;
  badKey.sections[0].interactions[0].options[1].correct=true;
  assert(errors(spec,badKey).some(x=>x.includes('answer key')));report.negativeControls++;
}
assert.equal(report.understandings,94);
assert.equal(report.written,94);
assert.equal(report.negativeControls,24);
console.log(JSON.stringify({status:'PASS', ...report},null,2));
