import {useState} from 'react';
import type {Level,ThemeId} from '../../curriculum/schema';
import {themes} from '../../curriculum/manifest';
import {drawingRequirements,requirementLabel} from './requirements.mjs';
export default function DrawingCatalogue({level,theme}:{level:Level;theme?:ThemeId}){
 const [query,setQuery]=useState('');
 const list=drawingRequirements.filter(e=>(level==='HL'||e.level!=='HL')&&(!theme||e.topicId.startsWith(theme))&&`${e.title} ${e.understandingId}`.toLowerCase().includes(query.trim().toLowerCase()));
 return <section className="bio-drawing bio-drawing-catalogue" id="bio-topic-browser" aria-labelledby="bio-diagram-heading">
  <div className="bio-drawing-intro"><span className="bio-eyebrow">DRAWING CHECKLIST · {level}</span><h2 id="bio-diagram-heading">Know what to draw.</h2><p>Choose a diagram, study its reference, then hide it and draw on paper. Each activity includes a checklist for comparing your drawing.</p><p><strong>IB drawing requirement</strong> means the guide explicitly asks for drawing, sketching or constructing. <strong>IB diagram skill</strong> covers chart and grid skills. <strong>Useful practice</strong> supports learning without adding a separate compulsory drawing.</p></div>
  <label htmlFor="bio-topic-search">Find a diagram by name or syllabus code</label><input id="bio-topic-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try membrane, C4.2 or reproduction"/>
  <p role="status">{list.length} diagram activities · Requirements checked against the IB Biology Guide, first assessment 2025.</p>
  {(['A','B','C','D'] as ThemeId[]).filter(id=>!theme||id===theme).map(id=><section className="bio-diagram-theme" key={id}><h3>Theme {id} · {themes[id].title}</h3>{list.filter(e=>e.topicId.startsWith(id)).map(e=><a className="bio-diagram-card" key={e.id} href={`#biology/topic/${e.topicId}/drawing?diagram=${e.id}`}><div><span className="bio-eyebrow">{e.understandingId} · {e.level==='HL'?'HL only':'SL & HL'}</span><h4>{e.title}</h4><p>{e.checks[0]}</p><small>{requirementLabel(e.kind)} · Guide p. {e.guidePage}</small></div><span className="bio-diagram-open">Practise →</span></a>)}{!list.some(e=>e.topicId.startsWith(id))&&<p>No matching diagrams in this theme.</p>}</section>)}
  <p className="bio-drawing-note">This is a focused drawing checklist, not a list of every figure you may need to interpret. Graphing, micrograph interpretation and data skills also apply throughout the course.</p>
 </section>;
}
