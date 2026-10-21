import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {drawingRequirements} from './requirements.mjs';

test('all catalogue links open the requested activity with a credited visible reference',async()=>{
 const server=await createServer({server:{middlewareMode:true},appType:'custom',optimizeDeps:{noDiscovery:true,entries:[]}});
 try{
  const {default:Paper}=await server.ssrLoadModule('/src/biology/learning/drawing-practice/PaperDrawingPractice.tsx');
  const {default:Catalogue}=await server.ssrLoadModule('/src/biology/learning/drawing-practice/DrawingCatalogue.tsx');
  const lessons=readdirSync('src/biology/learning',{withFileTypes:true}).filter(e=>e.isDirectory()).flatMap(e=>{try{return [JSON.parse(readFileSync(`src/biology/learning/${e.name}/lesson.json`,'utf8'))]}catch{return []}});
  const catalogue=renderToStaticMarkup(React.createElement(Catalogue,{level:'SL'}));
  for(const e of drawingRequirements){
   assert.ok(catalogue.includes(`diagram=${e.id}`),e.id+' link');
   const lesson=lessons.find(l=>l.topicId===e.topicId);assert.ok(lesson,e.topicId);
   const html=renderToStaticMarkup(React.createElement(Paper,{lesson,level:'SL',study:{drafts:{},revealed:{}},update:()=>{},requestedId:null,requestedDiagram:e.id}));
   assert.ok(html.includes(`data-exercise="${e.id}"`),e.id+' deep link');
   assert.ok(html.includes(e.reference),e.id+' reference');
   assert.ok(html.includes('Source:'),e.id+' credit');
   assert.ok(!html.includes('being checked'),e.id+' placeholder removed');
  }
  for(const theme of ['A','B','C','D']){
   const html=renderToStaticMarkup(React.createElement(Catalogue,{level:'HL',theme}));
   for(const e of drawingRequirements)assert.equal(html.includes(`diagram=${e.id}`),e.topicId.startsWith(theme),theme+':'+e.id);
  }
 }finally{await server.close()}
});
