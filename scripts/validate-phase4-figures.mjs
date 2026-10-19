import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
// Regression guards for specific reviewed schematic errors; not a chemical certification engine.
export function validateFigureCorrections(files){
 const errors=[];
 for(const [name,s] of Object.entries(files)){
  for(const [,fill] of s.matchAll(/\bfill="([^"]+)"/g))if(!/^(#[\da-f]{3,8}|none|transparent|white|black|url\(.*\))$/i.test(fill))errors.push('Invalid fill '+name);
  if(name.includes('sugar-rings')){
   if(!/data-bond="ribose-C4-C5" x1="88" y1="103"/.test(s))errors.push('Ribose C5 must branch from C4 '+name);
   if(!/data-bond="fructose-C5-C6"/.test(s))errors.push('Fructose C6 attachment '+name);
   if(!name.includes('recall'))for(const [x,y,atom] of [[158,393,'C2'],[145,429,'C3'],[99,429,'C4'],[89,393,'C5']])if(!new RegExp(`<text x="${x}" y="${y}"[^>]*>${atom}</text>`).test(s))errors.push('Fructose numbering '+name);
  }
  if(name.includes('steroid-rings')){
   const rings=[...s.matchAll(/data-ring="([ABCD])" d="M ([^"]+) Z"/g)];
   if(rings.length!==4||rings.some(([,,coords],i)=>coords.split(' L ').length!==[6,6,6,5][i]))errors.push('Steroid 6-6-6-5 ring topology '+name);
   if(!s.includes('150 145 L 150 105 L 185 85'))errors.push('Steroid angular C ring '+name);
  }
  if(name.includes('levels')){
   const chain=s.match(/data-chain="tertiary-single" d="([^"]+)"/)?.[1];
   if(!chain||chain.match(/M/g)?.length!==1)errors.push('Tertiary must be a connected single chain '+name);
  }
  if(name.includes('forms')&&[...s.matchAll(/data-chain="collagen-\d"/g)].length!==3)errors.push('Collagen must show three chains '+name);
 }
 return errors;
}
export async function readFigures(){const files={};for(const slug of ['carbohydrates-lipids','proteins'])for(const name of slug==='proteins'?['levels','forms']:['sugar-rings','steroid-rings','condensation'])for(const suffix of ['','-recall']){const path=`${slug}/${name}${suffix}.svg`;files[path]=await readFile(new URL('../public/biology/'+path,import.meta.url),'utf8')}return files}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){const errors=validateFigureCorrections(await readFigures());if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log('Phase 4 reviewed figure regressions passed; qualified diagram review remains pending.')}
