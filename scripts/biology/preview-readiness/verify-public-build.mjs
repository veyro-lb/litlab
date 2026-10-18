import assert from 'node:assert/strict';
import {existsSync,readdirSync,statSync,readFileSync} from 'node:fs';
import {join,relative} from 'node:path';

const root='dist';
assert.ok(existsSync(root),'Built dist directory is missing');
const files=[];
function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory())walk(p);else if(entry.isFile())files.push(relative(root,p).replace(/\\/g,'/'))}}
walk(root);
assert.ok(files.length>5,'Unexpectedly empty build');
assert.ok(!existsSync(join(root,'biology/source-pdf-figures')),'Unlicensed textbook crops reappeared in public build');
const forbidden=files.filter(p=>/(^|\/)(?:\.env(?:\..*)?|\.git|private|secrets)(?:\/|$)|\.(?:pdf|pptx?|docx?|key|pem|p12|pfx|sqlite|db|zip|tar|7z)$/i.test(p));
assert.deepEqual(forbidden,[],'Prohibited document/secret artifact(s) included in dist: '+forbidden.join(', '));
let svgCount=0,photoCount=0;
for(const path of files){
 if(path.startsWith('biology/')&&path.endsWith('.svg'))svgCount++;
 if(path.startsWith('biology/authentic/')&&/\.(png|jpe?g|webp)$/i.test(path))photoCount++;
}
assert.ok(svgCount>10,'Expected original scientific SVGs are absent from public build');
assert.ok(photoCount>=6,'Expected rights-ledger photographs are absent from public build');
for(const path of files.filter(p=>/\.(?:html|js|json)$/i.test(p))){
 const content=readFileSync(join(root,path),'utf8');
 assert.ok(!content.includes('-----BEGIN PRIVATE KEY-----')&&!content.includes('-----BEGIN OPENSSH PRIVATE KEY-----'),'Secret key signature in '+path);
}
console.log(JSON.stringify({status:'PUBLIC BUILD RIGHTS AND PRIVATE FILE GATE PASSED',files:files.length,originalScientificSvgAssets:svgCount,licensedPhotoAssets:photoCount,prohibitedFiles:0}));
