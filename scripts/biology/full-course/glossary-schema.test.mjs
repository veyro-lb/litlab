import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCompleteGlossary,validateLessonGlossary} from './glossary-schema.mjs';
test('full-course Learn vocabulary contract: 40 topics and 553 glossary arrays',()=>{
 assert.deepEqual(validateCompleteGlossary(),{topics:40,understandings:553});
});
test('negative: a single glossary string must fail rather than crash student Learn mode',()=>{
 const bad={sections:[{understandingIds:['C2.2.1'],terms:'Neuron: a nerve cell'}]};
 assert.throws(()=>validateLessonGlossary(bad),/glossary terms must be an array/);
});
test('negative: invalid or blank glossary entries must fail',()=>{
 const bad={sections:[{understandingIds:['C2.2.1'],terms:['Neuron: a nerve cell','  ',null]}]};
 assert.throws(()=>validateLessonGlossary(bad),/nonempty string/);
});
