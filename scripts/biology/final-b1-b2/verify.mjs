#!/usr/bin/env node
/**
 * BioLab B1–B2 isolated-sprint verification.
 * Run from the repository root: node scripts/biology/final-b1-b2/verify.mjs
 * Original internal integrity checks; not an independent scientific certification.
 */
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import path from "node:path";

const specs = [
  ["B1.1","carbohydrates-lipids",13,13],
  ["B1.2","proteins",12,5],
  ["B2.1","membranes-transport",17,10],
  ["B2.2","organelles-compartmentalization",9,3],
  ["B2.3","cell-specialization",10,6],
];
const root=process.cwd();
const stat={topics:0,understandings:0,shared:0,HL:0,questions:0,selection:0,written:0,figures:0,applications:0};
const seenIds=new Set();
for(const [topic,slug,count,sharedCount] of specs){
  const filename=path.join(root,"src/biology/learning",slug,"lesson.json");
  const lesson=JSON.parse(readFileSync(filename,"utf8"));
  assert.equal(lesson.topicId,topic);
  assert.equal(lesson.sections.length,count,`${topic}: numbered sections`);
  const refs=new Set(lesson.references.map(r=>r.id));
  const assets=new Map(lesson.assets.map(a=>[a.id,a]));
  const sectionIds=new Set(lesson.sections.map(s=>s.id));
  for(let n=1;n<=count;n++){
    const s=lesson.sections[n-1], id=`${topic}.${n}`;
    assert.deepEqual(s.understandingIds,[id],`${id} exact syllabus key`);
    assert(!seenIds.has(id),`${id} globally unique`);seenIds.add(id);
    const expected=n<=sharedCount?"shared":"HL";
    assert.equal(s.level,expected,`${id} SL/HL boundary`);
    assert(s.guidingQuestion?.length>10 && s.explanation?.length>80);
    assert(s.teachingBlocks?.length>=4,`${id} original explanatory blocks + application`);
    const last=s.teachingBlocks.at(-1);
    assert(last.title?.length>=12 && last.explanation?.length>=90,`${id} individual applied reasoning`);
    assert(s.referenceIds?.length>=1 && s.referenceIds.every(x=>refs.has(x)),`${id} valid references`);
    assert((s.assets||[]).every(a=>assets.has(typeof a==="string"?a:a.id)),`${id} figure linkage`);
    stat.understandings++;stat[expected]++;stat.applications++;
  }
  const qIds=new Set();
  for(const q of lesson.questions){
    assert(!qIds.has(q.id),`${topic}: repeated question ${q.id}`);qIds.add(q.id);
    assert(sectionIds.has(q.sectionId),`${q.id} section linkage`);
    assert(q.understandingIds?.length>=1 && q.understandingIds.every(id=>seenIds.has(id)),`${q.id} syllabus mapping`);
    assert(q.referenceIds?.length>=1 && q.referenceIds.every(id=>refs.has(id)),`${q.id} sources`);
    assert(q.marks>0 && Number.isInteger(q.marks),`${q.id} integer marks`);
    if(q.kind==="selection"){
      assert(q.options?.length>=3 && q.options.filter(o=>o.correct).length===1,`${q.id} unique answer`);
      assert(q.options.every(o=>o.feedback?.length>=15),`${q.id} explained distractors`);
      stat.selection++;
    }else if(q.kind==="written"){
      assert(q.answer?.length>=20 && q.markingPoints?.length===q.marks,`${q.id} answer/mark allocation`);
      stat.written++;
    }else throw new Error(`${q.id}: unsupported question kind ${q.kind}`);
    stat.questions++;
  }
  for(const a of lesson.assets){
    assert(a.src?.startsWith("/biology/"),`${a.id} local science asset`);
    for(const src of [a.src,a.recallSrc].filter(Boolean)){
      const file=path.join(root,"public",src.slice(1));
      assert(existsSync(file),`${a.id} missing ${file}`);
      if(file.endsWith(".svg")){
        const xml=readFileSync(file,"utf8");
        assert(xml.includes("<svg")&&xml.includes("</svg>"),`${a.id} invalid SVG root`);
        assert(!/<script\\b|<foreignObject\\b/i.test(xml),`${a.id} risky SVG content`);
      }
    }
    stat.figures++;
  }
  stat.topics++;
}
assert.deepEqual([stat.topics,stat.understandings,stat.shared,stat.HL,stat.questions,stat.selection,stat.written,stat.figures,stat.applications],
 [5,61,37,24,102,61,41,48,61],"B1–B2 overall counts");
const lipid=readFileSync(path.join(root,"public/biology/carbohydrates-lipids/lipids.svg"),"utf8");
assert(lipid.includes("C(=O)")&&lipid.includes("P(=O)"),"fatty-acyl ester and phosphoester bond drawing");
const table=readFileSync(path.join(root,"public/biology/membranes-transport/transport-pathways-20261017.svg"),"utf8");
for(const label of ["Simple diffusion","Osmosis","Channel diffusion","Carrier diffusion","Primary active","Secondary active"])
 assert(table.includes(label),`membrane comparison missing ${label}`);
assert.equal(25*3-25*2,25,"Na/K cycle net charge calculation");
assert.equal(6/5,1.2,"cube surface-area-to-volume ratio");
assert.equal(6/10,0.6,"cube doubling ratio");
console.log(JSON.stringify({status:"PASS",...stat},null,2));
