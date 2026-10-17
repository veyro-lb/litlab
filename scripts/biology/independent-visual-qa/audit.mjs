// Independent, deterministic source checks. No biology verdict is inferred from SVG geometry.
import {existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve, join, relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const browserWidths = [320,390,768,1024,1440,1920];
const imgFields = ['src','mobileSrc','recallSrc','recallMobileSrc'];
const issue = (code, severity, topic, understandingIds, assetId, path, detail) =>
  ({code,severity,topic,understandingIds,assetId,path,detail,verification:'automated-source-check'});

function viewBox(xml) {
  const m=xml.match(/\bviewBox\s*=\s*["']([^"']+)["']/);
  const a=m?.[1].trim().split(/[\s,]+/).map(Number);
  return a?.length===4 && a.every(Number.isFinite) && a[2]>0 && a[3]>0 ? a : null;
}
function shapes(xml) {
  return (xml.match(/<(?:path|circle|ellipse|polygon|polyline|line|rect)\b/g)||[]).length;
}
function textHints(xml) {
  const texts=[...xml.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)].map(m=>({
    attributes:m[1],value:m[2].replace(/<[^>]+>/g,'').replace(/&(?:amp|lt|gt|quot|apos);/g,' ').trim()
  }));
  const sizes=texts.map(t=>Number(t.attributes.match(/\bfont-size=["']([\d.]+)["']/)?.[1])).filter(n=>n>0);
  return {textNodes:texts.length,minExplicitFontSize:sizes.length?Math.min(...sizes):null};
}
function parseXmlWithPython(paths) {
  if (!paths.length) return [];
  const py=String.raw`import sys,json,xml.etree.ElementTree as ET
bad=[]
for path in sys.argv[1:]:
 try: ET.parse(path)
 except Exception as exc: bad.append({"path":path,"error":str(exc)})
print(json.dumps(bad))
`;
  const p=spawnSync('python3',['-c',py,...paths],{encoding:'utf8',maxBuffer:1024*1024*8});
  if(p.error || p.status!==0) return [{path:'(XML verifier)',error:p.stderr||String(p.error||p.status)}];
  try{return JSON.parse(p.stdout);}catch{return [{path:'(XML verifier)',error:'Invalid parser response'}];}
}
export function audit(root=process.cwd(), expectedTopicCount=40) {
  const input=resolve(root), errors=[], warnings=[], inventory=[], parsed=new Map(), variants=[];
  const registryPath=join(input,'src/biology/curriculum/registry.json');
  if(!existsSync(registryPath)) throw new Error('Missing pinned curriculum registry');
  const topics=JSON.parse(readFileSync(registryPath,'utf8'));
  if(!Array.isArray(topics)||topics.length!==expectedTopicCount)
    errors.push(issue('TOPIC_COUNT','high','all',[],null,registryPath,'Expected '+expectedTopicCount+' topics'));
  const entries=readdirSync(join(input,'src/biology/learning'),{withFileTypes:true});
  const lessonPaths=entries.filter(e=>e.isDirectory())
    .map(e=>join(input,'src/biology/learning',e.name,'lesson.json')).filter(existsSync);
  const lessonIds=new Set(), seen=new Map(), xmlPaths=new Set(), publicPaths=new Set();
  for(const path of lessonPaths){
    let lesson;
    try{lesson=JSON.parse(readFileSync(path,'utf8'));}catch(e){
      errors.push(issue('INVALID_LESSON_JSON','high','unknown',[],null,relative(input,path),String(e)));continue;
    }
    const topic=lesson.topicId;lessonIds.add(topic);
    const assetIds=new Set(), sections=lesson.sections||[], assets=lesson.assets||[];
    const placements=new Map();
    for(const s of sections){
      for(const id of s.assets||[]){
        if(!placements.has(id))placements.set(id,new Set());
        for(const u of s.understandingIds||[])placements.get(id).add(u);
      }
    }
    for(const a of assets){
      const ids=[...(placements.get(a.id)||new Set())];
      if(!a.id || assetIds.has(a.id))
        errors.push(issue('DUPLICATE_ASSET_ID','high',topic,ids,a.id,relative(input,path),'Missing/duplicate asset ID'));
      assetIds.add(a.id);
      if(!a.alt?.trim())
        errors.push(issue('MISSING_ALT','high',topic,ids,a.id,relative(input,path),'Missing descriptive alternative text'));
      if(!ids.length)
        warnings.push(issue('UNPLACED_ASSET','medium',topic,ids,a.id,relative(input,path),'Asset not referenced by a teaching section'));
      const row={topic,understandingIds:ids,assetId:a.id,paths:{},alt:a.alt||'',withheld:!!a.withheldReason};
      for(const field of imgFields){
        const src=a[field];if(!src)continue;
        if(typeof src!=='string'||!/^\/biology\/[a-z0-9/_.-]+$/i.test(src)||src.includes('..')){
          errors.push(issue('UNSAFE_ASSET_PATH','high',topic,ids,a.id,String(src),'Unexpected relative public-asset path'));continue;
        }
        const abs=join(input,'public',src);
        const rel=relative(input,abs);row.paths[field]=rel;publicPaths.add(rel);
        if(!existsSync(abs)){
          errors.push(issue('MISSING_ASSET','high',topic,ids,a.id,rel,'Referenced file does not exist'));continue;
        }
        const content=readFileSync(abs);
        if(!content.length)errors.push(issue('EMPTY_ASSET','high',topic,ids,a.id,rel,'Zero-byte file'));
        if(src.endsWith('.svg')){
          const xml=content.toString('utf8');xmlPaths.add(abs);
          const box=viewBox(xml), h=textHints(xml);
          parsed.set(rel,{box,shapes:shapes(xml),bytes:content.length, ...h,content:xml});
          if(!/<svg\b/.test(xml)||!/<\/svg\s*>/.test(xml)||!box)
            errors.push(issue('SVG_STRUCTURE','high',topic,ids,a.id,rel,'SVG root, closing tag or positive viewBox missing'));
          if(/<script\b|\bonload\s*=|<foreignObject\b/i.test(xml))
            errors.push(issue('UNSAFE_SVG','high',topic,ids,a.id,rel,'Executable or foreign SVG content'));
          if(/(?:href|xlink:href)\s*=\s*["']https?:\/\//i.test(xml))
            warnings.push(issue('EXTERNAL_SVG_RESOURCE','medium',topic,ids,a.id,rel,'External resource, review offline rendering'));
          if(box&&h.minExplicitFontSize){
            const estimate=+(h.minExplicitFontSize*Math.min(1,320/box[2])).toFixed(1);
            row.estimatedMinimumTextPixelsAt320=estimate;
            if(estimate<9) warnings.push(issue('SMALL_TEXT_320_ESTIMATE','medium',topic,ids,a.id,rel,
              'Projected smallest explicitly sized SVG text at 320px: '+estimate+' px; source-only estimate, not a browser result'));
          }
        }
      }
      if(a.recallSrc && a.src) variants.push({topic,ids,id:a.id,labelled:'public'+a.src,recall:'public'+a.recallSrc});
      inventory.push(row);
    }
  }
  for(const a of variants){
    const la=parsed.get(a.labelled),re=parsed.get(a.recall);
    if(!la||!re)continue;
    if(la.content===re.content)errors.push(issue('IDENTICAL_RECALL','high',a.topic,a.ids,a.id,a.recall,'Recall is byte-identical to labelled image'));
    if(JSON.stringify(la.box)!==JSON.stringify(re.box))
      errors.push(issue('RECALL_VIEWBOX_MISMATCH','high',a.topic,a.ids,a.id,a.recall,'Recall canvas differs from source'));
    const ratio=re.shapes/Math.max(1,la.shapes);
    if(ratio<0.7||ratio>1.3)
      warnings.push(issue('RECALL_GEOMETRY_CHANGED','medium',a.topic,a.ids,a.id,a.recall,
        'Shape count changes from '+la.shapes+' to '+re.shapes+'; manual semantic review needed'));
  }
  for(const path of parseXmlWithPython([...xmlPaths])){
    errors.push(issue('INVALID_XML','high','unknown',[],null,relative(input,path.path),path.error));
  }
  const topicSet=new Set(topics.map(t=>t.id));
  for(const id of lessonIds)if(!topicSet.has(id))
    errors.push(issue('UNREGISTERED_TOPIC','high',id,[],null,'registry.json','Lesson missing from registry'));
  for(const id of topicSet)if(!lessonIds.has(id))
    errors.push(issue('MISSING_LESSON','high',id,[],null,'src/biology/learning','No topic lesson JSON'));
  const allPublic=Object.entries({}).length; // reserved for forward-compatible aggregate metadata
  const result={schemaVersion:1,source:'local checkout, not browser or qualified biology review',
    widthsForBrowserFollowup:browserWidths,topicCount:topics.length,lessonCount:lessonPaths.length,
    assetCount:inventory.length,uniqueReferencedPaths:publicPaths.size,svgParsedCount:xmlPaths.size,
    recallPairCount:variants.length,errorCount:errors.length,warningCount:warnings.length,
    errors,warnings,inventory};
  return result;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=process.argv[2]||process.cwd();
  const report=audit(root);
  const out=join(root,'docs/biology/independent-visual-qa/SOURCE_AUDIT_EXECUTION.json');
  mkdirSync(resolve(out,'..'),{recursive:true});writeFileSync(out,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({topics:report.topicCount,assets:report.assetCount,svg:report.svgParsedCount,
    recallPairs:report.recallPairCount,errors:report.errorCount,warnings:report.warningCount,report:relative(root,out)}));
  if(report.errorCount)process.exitCode=1;
}
