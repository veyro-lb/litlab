import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFigures,validateFigureCorrections} from './validate-phase4-figures.mjs';
const files=await readFigures();
test('reviewed labelled and recall figure corrections pass',()=>assert.deepEqual(validateFigureCorrections(files),[]));
for(const [name,key,from,to] of [
 ['ribose external attachment','carbohydrates-lipids/sugar-rings.svg','x1="88" y1="103"','x1="99" y1="138"'],
 ['fructose atom numbering','carbohydrates-lipids/sugar-rings.svg','>C2</text><text x="145"','>C1</text><text x="145"'],
 ['invalid fill','carbohydrates-lipids/condensation.svg','fill="#e8f6f1"','fill="Linked molecule"'],
 ['disconnected tertiary chain','proteins/levels.svg','S160 320 179 297','M179 297'],
 ['missing collagen strand','proteins/forms.svg','data-chain="collagen-3"','data-chain="absent"'],
 ['wrong steroid nucleus','carbohydrates-lipids/steroid-rings.svg','150 145 L 150 105 L 185 85','150 145 L 185 125 L 220 145']
])test('rejects regression: '+name,()=>{const altered={...files,[key]:files[key].replace(from,to)};assert.notEqual(altered[key],files[key]);assert.ok(validateFigureCorrections(altered).length)});
