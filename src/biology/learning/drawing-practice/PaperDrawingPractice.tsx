import {useState} from 'react';
import {ArrowLeft, ArrowRight, PencilLine} from 'lucide-react';
import type {Lesson,StudyState} from '../content';
import type {UpdateStudy} from '../StudyQuestion';
import type {Level} from '../../curriculum/schema';
import ScientificFigure from '../ScientificFigure';
import {drawingRequirements,requirementLabel} from './requirements.mjs';
const stages = ['Study', 'Draw', 'Compare'] as const;

export default function PaperDrawingPractice({lesson,level,study,update,requestedId,requestedDiagram,hasLabelActivity}:{lesson:Lesson;level:Level;study:StudyState;update:UpdateStudy;requestedId:string|null;requestedDiagram:string|null;hasLabelActivity?:boolean}){
 const eligible=drawingRequirements.filter(e=>e.topicId===lesson.topicId&&(level==='HL'||e.level!=='HL'));
 const [selection,setSelection]=useState(requestedDiagram??'');
 const scoped=requestedId?eligible.filter(e=>e.understandingId===requestedId):eligible;
 const exercise=scoped.find(e=>e.id===selection)??(!requestedDiagram ? scoped[0] : undefined);
 const [stage,setStage]=useState<(typeof stages)[number]>('Study');
 const [checked,setChecked]=useState<Record<string,boolean>>({});
 const [finished,setFinished]=useState(false);
 const restart = () => {
  setStage('Study');
  setChecked({});
  setFinished(false);
 };
 const base=`#biology/topic/${lesson.topicId}`;
 const themeLink=`#biology/theme/${lesson.topicId[0]}?resource=drawing`;
 if(!exercise)return <section className="bio-drawing bio-drawing-empty">
  <h2>{requestedDiagram ? 'Diagram unavailable at this level' : 'No drawing activity in this selection'}</h2>
  <p>{requestedDiagram ? 'Choose another diagram from the theme catalogue.' : 'Use the figures in the lesson to practise visual recall.'}</p>
  <div className="bio-drawing-actions">
   <a href={themeLink}>Theme {lesson.topicId[0]} diagrams <ArrowRight size={16} aria-hidden="true"/></a>
   {requestedId&&eligible.length>0&&<a href={`${base}/drawing`}>All topic diagrams <ArrowRight size={16} aria-hidden="true"/></a>}
  </div>
 </section>;
 const source=exercise.sourceCredit??(exercise.handoutPage?`IB Biology Drawings (Noteworthy Science / Marier), supplied handout, page ${exercise.handoutPage}.` : lesson.assets.find(a=>a.src===exercise.reference)?.attribution??'Reference in the topic lesson.');
 const reference=exercise.reference;
 const asset=reference?{id:'drawing-'+exercise.id,kind:'diagram',src:reference,alt:exercise.title+'. '+exercise.checks.join(' '),captionTitle:exercise.title,attribution:source,license:(exercise.handoutPage||exercise.sourceCredit)?'User-supplied reference; project owner confirmed permission for public use.':lesson.assets.find(a=>a.src===reference)?.license??'See lesson source record.',permissionEvidence:'Owner permission confirmed for supplied educational figures.',referenceIds:[],level:exercise.level,review:'source-mapped' as const,publicReproductionRights:'cleared' as const}:null;
 const noteKey='drawing-notes:'+exercise.id;
 const criteria=[...exercise.checks,'Use clear lines and keep label lines from crossing where labels are required.'];
 const completed=Object.values(checked).filter(Boolean).length;

 return <section className="bio-drawing" aria-labelledby="bio-drawing-title" data-exercise={exercise.id}>
  <a className="bio-diagram-return" href={themeLink}><ArrowLeft size={16} aria-hidden="true"/> Theme {lesson.topicId[0]} diagrams</a>
  <header className="bio-drawing-intro">
   <span className="bio-eyebrow">{requirementLabel(exercise.kind)} · {exercise.understandingId}</span>
   <h2 id="bio-drawing-title">{exercise.title}</h2>
   {hasLabelActivity&&<a href={`${base}/drawing`}>Practise the labels <ArrowRight size={16} aria-hidden="true"/></a>}
  </header>
  {scoped.length>1&&<div className="bio-drawing-picker">
   <label htmlFor="bio-drawing-structure">Choose a diagram</label>
   <select id="bio-drawing-structure" value={exercise.id} onChange={event=>{setSelection(event.target.value);restart()}}>
    {scoped.map(item=><option key={item.id} value={item.id}>{item.title} · {item.understandingId}</option>)}
   </select>
  </div>}
  <div className="bio-drawing-steps bio-paper-steps" aria-label="Drawing exercise steps">
   <ol>{stages.map((name,index)=><li key={name} aria-current={stage===name?'step':undefined}><span>{index+1}</span><span>{name}</span></li>)}</ol>
  </div>
  <div className="bio-drawing-actions">
   {stage==='Study'&&<button className="bio-drawing-primary" type="button" onClick={()=>setStage('Draw')}>{asset?'Hide reference & draw':'Start drawing'}</button>}
   {stage==='Draw'&&<button className="bio-drawing-primary" type="button" onClick={()=>setStage('Compare')}>{asset?'Reveal reference & compare':'Compare with the checklist'}</button>}
   {stage!=='Study'&&<button type="button" onClick={restart}>Start again</button>}
  </div>
  {stage==='Draw'?<div className="bio-drawing-hidden" role="status">
   <PencilLine size={28} aria-hidden="true"/>
   <strong>{asset?'Reference hidden':'Draw on paper'}</strong>
   <span>{asset?'Draw on paper from memory, then reveal the reference.':'Use the task below to construct your diagram, then check it.'}</span>
  </div>:asset?<ScientificFigure key={asset.id} asset={asset}/>:<div className="bio-drawing-reference">
   <h3>Construct from the checklist</h3>
   <p>{exercise.id==='energy-pyramid'?'Choose energy data from an ecosystem in your lesson or class investigation. Make each horizontal bar proportional to its energy value, with producers at the base. Record units and data source.':'Start with atmospheric CO₂, producers and consumers. Add arrows for photosynthesis (CO₂ to producers), feeding (producers to consumers), and respiration (organisms to atmospheric CO₂). Add dead organic matter and decomposers.'}</p>
   <a href={`${base}/learn?understanding=${exercise.understandingId}`}>Open the lesson and source material <ArrowRight size={16} aria-hidden="true"/></a>
  </div>}
  {stage!=='Compare'?<div className="bio-drawing-reference">
   <h3>Your drawing task</h3>
   <ul>{exercise.checks.map(criterion=><li key={criterion}>{criterion}</li>)}</ul>
   {exercise.id==='organelles'&&<p><a href={`${base}/learn?understanding=A2.2.11`}>Open the lesson’s electron micrographs</a> and draw the structures you see.</p>}
  </div>:<>
   <fieldset className="bio-drawing-checklist"><legend>Compare your drawing</legend>
    {criteria.map((criterion,index)=><label key={criterion}>
     <input type="checkbox" checked={!!checked[index]} onChange={event=>{const value=event.target.checked;setChecked(previous=>({...previous,[index]:value}));setFinished(false)}}/><span>{criterion}</span>
    </label>)}
   </fieldset>
   <label className="bio-drawing-notes" htmlFor="bio-drawing-notes">Notes for your next attempt</label>
   <textarea id="bio-drawing-notes" value={study.drafts[noteKey]??''} onChange={event=>{const value=event.target.value;update(previous=>({...previous,drafts:{...previous.drafts,[noteKey]:value}}))}} placeholder="Record a missing label or correction…"/>
   <div className="bio-drawing-actions"><button className="bio-drawing-primary" type="button" onClick={()=>setFinished(true)}>Finish self-check</button></div>
   {finished&&<p className="bio-drawing-selfcheck" role="status">{completed} of {criteria.length} criteria checked. Notes stay in this tab until you refresh.</p>}
  </>}
  <details className="bio-diagram-guide"><summary>Sources</summary><p>IB Biology Guide, first assessment 2025, p. {exercise.guidePage}.</p><p>Source: {source}</p></details>
 </section>;
}
