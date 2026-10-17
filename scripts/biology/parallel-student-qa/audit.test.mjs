import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectChoice, inspectLesson} from './audit.mjs';
const option=(id,text,correct,feedback='Explanation')=>({id,text,correct,feedback});
const choice=(options)=>({id:'fixture-q',prompt:'Which is correct?',options});
const rules=items=>items.map(x=>x.rule);

test('selection answer key must be unique',()=>{
  const found=inspectChoice(choice([option('a','A',true),option('b','B',true)]),'A1.1','fixture');
  assert.ok(rules(found).includes('choice-key'));
});
test('exact duplicates are caught but capitalization distinctions remain valid',()=>{
  const duplicated=inspectChoice(choice([option('a','Same',true),option('b','Same',false)]),'A3.1','fixture');
  assert.ok(rules(duplicated).includes('choice-repeated'));
  const capitalization=inspectChoice(choice([
    option('a','Homo sapiens',true),option('b','homo Sapiens',false),option('c','HOMO SAPIENS',false)
  ]),'A3.1','fixture');
  assert.ok(!rules(capitalization).includes('choice-repeated'));
});
test('repeated generic feedback prompts review without declaring scientific error',()=>{
  const found=inspectChoice(choice([
    option('a','A',true,'Correct'),option('b','B',false,'Try again'),option('c','C',false,'Try again')
  ]),'C2.2','fixture');
  assert.ok(found.some(f=>f.rule==='choice-feedback-generic'&&f.severity==='medium'));
});
test('understanding coverage, HL isolation, table geometry and local asset references',()=>{
  const topic={id:'A1.1',lessonId:'a11',level:'shared',understandings:[{id:'A1.1.1',level:'shared'},{id:'A1.1.2',level:'HL'}]};
  const lesson={id:'a11',topicId:'A1.1',references:[],assets:[],questions:[],
    sections:[{id:'s1',understandingIds:['A1.1.1'],level:'shared',explanation:'Test lesson.',
      referenceIds:[],assets:['missing-asset'],interactions:[],
      visuals:[{kind:'comparison',title:'Bad table',afterBlock:0,headers:['A','B'],rows:[['only one cell']]}],
      graphTables:[]}]};
  const found=inspectLesson(topic,lesson,'fixture.json');
  for(const rule of ['coverage','asset-unresolved','comparison-columns'])assert.ok(rules(found).includes(rule),rule);
  lesson.sections[0].understandingIds=['A1.1.2'];
  assert.ok(rules(inspectLesson(topic,lesson,'fixture.json')).includes('section-scope'));
});
