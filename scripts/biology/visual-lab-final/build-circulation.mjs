// Original 2026 BioLab circulation SVG generator. Conceptual diagram: NEVER describe as empirical microscopy.
import {writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
function renderCirculation({recall=false,mobile=false}={}){
 const W=mobile?580:1160,H=mobile?1130:595;
 const rootTitle=recall?"Blood circulation — unlabelled recall":"Fish and mammalian blood circulation";
 const node=(x,y,w,h,lines,id)=>`<g data-node="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" class="node"/>${recall?`<text x="${x+w/2}" y="${y+h/2+7}" text-anchor="middle" class="blank">?</text>`:lines.map((s,i)=>`<text x="${x+w/2}" y="${y+h/2+(i-(lines.length-1)/2)*23+7}" text-anchor="middle" class="node-text">${s}</text>`).join("")}</g>`;
 const path=(d,from,to,blood)=>`<path data-from="${from}" data-to="${to}" class="flow-${blood}" d="${d}" marker-end="url(#arrow-${blood})"/>`;
 const panel=(kind,x,y)=>{
  const fish=kind==="fish";
  const title=fish?"FISH — single circulation":"MAMMAL — double circulation";
  let inner=`<rect width="540" height="450" rx="18" class="panel"/><text x="24" y="42" class="panel-title">${title}</text>`;
  if(fish){
   inner+=`<text x="24" y="89" class="sub">One circuit through gills and body</text>`;
   inner+=node(24,126,138,76,["Heart"],"fish-heart")+node(202,126,138,76,["Gill","capillaries"],"fish-gills")+node(380,126,138,76,["Systemic","capillaries"],"fish-body");
   inner+=path("M166 164 H197","fish-heart","fish-gills","low");
   inner+=path("M344 164 H375","fish-gills","fish-body","high");
   inner+=path("M449 207 V281 H93 V207","fish-body","fish-heart","low");
   inner+=`<text x="24" y="355" class="caption">Sequence: heart → gills → body → heart</text><text x="24" y="385" class="note">Blood passes through systemic capillaries before returning.</text>`;
  }else{
   inner+=`<text x="24" y="89" class="sub">Pulmonary and systemic routes in series</text>`;
   inner+=node(24,126,180,76,["Right heart"],"mammal-right-heart")+node(334,126,180,76,["Lung","capillaries"],"mammal-lungs")+node(334,281,180,76,["Left heart"],"mammal-left-heart")+node(24,281,180,76,["Systemic","capillaries"],"mammal-body");
   inner+=path("M209 164 H329","mammal-right-heart","mammal-lungs","low");
   inner+=path("M424 207 V276","mammal-lungs","mammal-left-heart","high");
   inner+=path("M329 320 H209","mammal-left-heart","mammal-body","high");
   inner+=path("M114 276 V207","mammal-body","mammal-right-heart","low");
   inner+=`<text x="24" y="392" class="note">Right heart → lungs → left heart</text><text x="24" y="418" class="note">→ body → right heart</text>`;
  }
  return `<g transform="translate(${x} ${y})" data-circuit="${kind}">${inner}</g>`;
 };
 const fishX=mobile?20:25, fishY=mobile?122:92, mammalX=mobile?20:595,mammalY=mobile?607:92;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="visual-title visual-description">
<title id="visual-title">${rootTitle}</title>
<desc id="visual-description">Original conceptual topology. Fish: heart to gill capillaries to systemic capillaries and back to heart. Mammal: right heart to lung capillaries to left heart to systemic capillaries and back to right heart. Every vessel connector has a one-way arrow. Blue means relatively low oxygen and red means relatively high oxygen; oxygen content is comparative, not numerical.</desc>
<defs>
 <marker id="arrow-low" markerWidth="8" markerHeight="8" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L7 3.5 L0 7 Z" fill="#2269a5"/></marker>
 <marker id="arrow-high" markerWidth="8" markerHeight="8" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L7 3.5 L0 7 Z" fill="#b43e50"/></marker>
</defs>
<style>
 .canvas{fill:#f8fbfd}.panel{fill:#fff;stroke:#c9d8e4;stroke-width:2}.node{fill:#edf5f9;stroke:#44748e;stroke-width:2}.heading,.panel-title,.node-text,.sub,.caption,.note,.blank{font-family:Arial,Helvetica,sans-serif;fill:#15364a}.heading{font-weight:700;font-size:29px}.panel-title{font-weight:700;font-size:22px}.sub{font-size:16px}.node-text{font-size:18px;font-weight:600}.blank{font-size:32px;font-weight:700}.caption{font-size:18px;font-weight:700}.note{font-size:16px}.flow-low,.flow-high{stroke-width:5;fill:none;stroke-linecap:round;stroke-linejoin:round}.flow-low{stroke:#2269a5}.flow-high{stroke:#b43e50}
</style>
<rect class="canvas" width="${W}" height="${H}" rx="18"/>
<text x="${mobile?20:25}" y="${mobile?42:38}" class="heading">${recall?"Recall: trace and name each blood-flow stage":"Compare circulation: fish and mammal"}</text>
<text x="${mobile?20:25}" y="${mobile?75:69}" class="sub">Arrowheads show direction · <tspan fill="#2269a5">blue = lower O₂</tspan> · <tspan fill="#b43e50">red = higher O₂</tspan></text>
${panel("fish",fishX,fishY)}
${panel("mammal",mammalX,mammalY)}
<text x="${mobile?20:25}" y="${H-18}" class="note">Conceptual flow model; not an anatomical drawing or a scaled measurement.</text>
</svg>`;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const dir=resolve(root,'public/biology/transport');mkdirSync(dir,{recursive:true});
for(const [name,options] of [['heart-circuits.svg',{}],['heart-circuits-recall.svg',{recall:true}],['heart-circuits-mobile.svg',{mobile:true}],['heart-circuits-mobile-recall.svg',{mobile:true,recall:true}]])writeFileSync(resolve(dir,name),renderCirculation(options));
console.log('Wrote 4 original circulation SVGs');
}
export {renderCirculation};
