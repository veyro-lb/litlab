import {readdir,readFile} from 'node:fs/promises';
import {extname,join,relative} from 'node:path';

const root=process.cwd();
const src=join(root,'src');
const problems=[];

async function walk(dir){
  const entries=await readdir(dir,{withFileTypes:true});
  const files=[];
  for(const entry of entries){
    const full=join(dir,entry.name);
    if(entry.isDirectory())files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const files=await walk(src);
const textFiles=files.filter(file=>['.css','.ts','.tsx','.html'].includes(extname(file)));

for(const file of textFiles){
  const text=await readFile(file,'utf8');
  const name=relative(root,file);

  if(extname(file)==='.css'){
    const malformedTransition=/(?:^|[;{])\s*(background|background-color|border-color|box-shadow|color|opacity|transform)\s+\.\d+(?:ms|s)\s+(?:ease|ease-in|ease-out|ease-in-out|linear)(?=[,;}])/gm;
    let match;
    while((match=malformedTransition.exec(text))){
      const line=text.slice(0,match.index).split('\n').length;
      problems.push(`${name}:${line} malformed CSS transition fragment near "${match[0].trim()}"`);
    }
  }

  const unterminatedEntity=/&(quot|amp|lt|gt|#39)(?!;)/g;
  let entity;
  while((entity=unterminatedEntity.exec(text))){
    const tail=text.slice(entity.index,entity.index+12);
    // Ignore entities that are intentionally part of a longer source-code token.
    if(/^&(quot|amp|lt|gt|#39)[A-Za-z0-9_]/.test(tail))continue;
    const line=text.slice(0,entity.index).split('\n').length;
    problems.push(`${name}:${line} HTML entity "${entity[0]}" is missing its semicolon`);
  }
}

const index=await readFile(join(root,'index.html'),'utf8');
const moduleScripts=[...index.matchAll(/<script\s+type=["']module["'][^>]*src=["']([^"']+)["'][^>]*><\/script>/g)].map(match=>match[1]);
if(moduleScripts.length>2)problems.push(`index.html has ${moduleScripts.length} top-level module scripts; keep feature code behind src/site-runtime.ts`);
if(!moduleScripts.includes('/src/main.tsx'))problems.push('index.html is missing the React main entry /src/main.tsx');
if(!moduleScripts.includes('/src/site-runtime.ts'))problems.push('index.html is missing the route-aware /src/site-runtime.ts entry');

if(problems.length){
  console.error('\nSite quality checks failed:\n');
  for(const problem of problems)console.error(`- ${problem}`);
  process.exitCode=1;
}else{
  console.log(`Site quality checks passed across ${textFiles.length} source files.`);
  console.log(`Top-level module entries: ${moduleScripts.join(', ')}`);
}
