import {useState} from 'react';
import {ArrowLeft,ArrowRight,CheckCircle2,Eye,EyeOff,PencilLine,RotateCcw} from 'lucide-react';
import type {Lesson,Section,StudyState} from '../content';
import type {Level} from '../../curriculum/schema';
import type {UpdateStudy} from '../StudyQuestion';
import ScientificFigure from '../ScientificFigure';
import {availableExercises,isCorrectLabel} from './data.mjs';
import type {DrawingExercise} from './data.mjs';

type Step=0|1|2|3|4;
type Activity='identify'|'draw';
const stepTitles=['Study','Draw','Label','Compare','Self-check'] as const;

export default function DrawingPractice({lesson,sections,level,study,update,requestedId}:{
 lesson:Lesson;sections:Section[];level:Level;study:StudyState;update:UpdateStudy;requestedId:string|null
}){
 const eligible=availableExercises(lesson,level,sections);
 const scoped=requestedId?eligible.filter(e=>e.understandingId===requestedId):eligible;
 const [selection,setSelection]=useState(scoped[0]?.id??'');
 const [activity,setActivity]=useState<Activity>('identify');
 const [step,setStep]=useState<Step>(0);
 const [reviewed,setReviewed]=useState<Record<string,boolean>>({});
 const [confirmed,setConfirmed]=useState(false);
 const exercise=scoped.find(e=>e.id===selection)??scoped[0];
 const base=`#biology/topic/${lesson.topicId}`;
 if(!exercise)return <section className="bio-drawing bio-drawing-empty" aria-labelledby="bio-drawing-title">
  <span className="bio-eyebrow">OPTIONAL · DIAGRAM PRACTICE</span>
  <h2 id="bio-drawing-title">Diagrams are being checked for this topic</h2>
  <p>No figure in this selection yet has a confirmed source-checked, reusable labelled-and-unlabelled pair. We will not display a substitute or pretend you have completed an activity.</p>
  <a href={`${base}/learn${requestedId?'?understanding='+requestedId:''}`}>Read the explanation <ArrowRight size={16} aria-hidden="true"/></a>
 </section>;
 const asset=lesson.assets.find(a=>a.id===exercise.assetId)!;
 const key=(suffix:string)=>`drawing:${exercise.id}:${suffix}`;
 const revealed=!!study.revealed[key('reference')],tested=!!study.revealed[key('checked')];
 const answers=exercise.labels.map(label=>({label,value:study.drafts[key(label.id)]??''}));
 const figure=(hidden:boolean)=><ScientificFigure key={`${asset.id}:${hidden?'recall':'reference'}`} asset={asset} hideLabels={hidden}/>;
 const setReference=(value:boolean)=>update(s=>({...s,revealed:{...s.revealed,[key('reference')]:value}}));
 const setAnswer=(id:string,value:string)=>update(s=>({...s,drafts:{...s.drafts,[key(id)]:value},revealed:{...s.revealed,[key('checked')]:false}}}));
 const markChecked=()=>update(s=>({...s,revealed:{...s.revealed,[key('checked')]:true}}));
 const reset=()=>{
  update(s=>{
   const drafts={...s.drafts},revealed={...s.revealed};
   Object.keys(drafts).filter(k=>k.startsWith(`drawing:${exercise.id}:`)).forEach(k=>delete drafts[k]);
   Object.keys(revealed).filter(k=>k.startsWith(`drawing:${exercise.id}:`)).forEach(k=>delete revealed[k]);
   return {...s,drafts,revealed};
  });
  setStep(0);setReviewed({});setConfirmed(false);
 };
 const criteria=[
  ...exercise.labels.map(label=>({id:label.id,text:`${label.name}: labelled in the correct position`})),
  ...exercise.conventions.map((text,index)=>({id:`convention-${index}`,text}))
 ];
 return <section className="bio-drawing" aria-labelledby="bio-drawing-title" data-exercise={exercise.id}>
  <div className="bio-drawing-intro"><span className="bio-eyebrow">OPTIONAL · VISUAL ACTIVE RECALL</span>
   <h2 id="bio-drawing-title">Learn it. Hide it. Draw it.</h2>
   <p>Use original BioLab scientific art to practise identification. Typed labels are checked against specific authored clues; drawings made on paper are self-assessed, not computer-marked.</p>
  </div>
  {scoped.length>1&&<div className="bio-drawing-picker">
   <label htmlFor="bio-drawing-structure">Choose a structure</label>
   <select id="bio-drawing-structure" value={exercise.id} onChange={e=>{setSelection(e.target.value);setActivity('identify');setStep(0);setReviewed({});setConfirmed(false)}}>
    {scoped.map(item=><option value={item.id} key={item.id}>{item.title} · {item.understandingId}</option>)}
   </select>
  </div>}
  <header className="bio-drawing-exercise-head"><div><span className="bio-eyebrow">{exercise.understandingId} · {level}</span>
   <h3>{exercise.title}</h3><p>{exercise.introduction}</p></div><PencilLine size={24} aria-hidden="true"/>
  </header>
  <div className="bio-drawing-tabs" role="group" aria-label="Diagram activity">
   <button type="button" aria-pressed={activity==='identify'} onClick={()=>setActivity('identify')}>Identify &amp; label</button>
   <button type="button" aria-pressed={activity==='draw'} onClick={()=>{setActivity('draw');setStep(0);setReviewed({});setConfirmed(false)}}>Draw it yourself</button>
  </div>
  {activity==='identify'?<div className="bio-drawing-identify">
   <div className="bio-drawing-figure-head"><strong>{revealed?'Reference diagram':'Unlabelled recall diagram'}</strong>
    <button type="button" aria-pressed={revealed} onClick={()=>setReference(!revealed)}>
     {revealed?<><EyeOff size={16} aria-hidden="true"/> Hide labels</>:<><Eye size={16} aria-hidden="true"/> Reveal labels</>}
    </button>
   </div>
   {figure(!revealed)}
   <p className="bio-drawing-note">Name each feature from its clue. This checks terminology, <strong>not</strong> where you would place a leader line on the diagram.</p>
   <div className="bio-drawing-fields">{answers.map(({label,value},i)=>{
    const match=isCorrectLabel(label,value);
    return <div className="bio-drawing-field" key={label.id}>
     <label htmlFor={`bio-drawing-${exercise.id}-${label.id}`}><span>{i+1}.</span> {label.clue}</label>
     <input id={`bio-drawing-${exercise.id}-${label.id}`} type="text" autoComplete="off" spellCheck={false} value={value} onChange={e=>setAnswer(label.id,e.target.value)} placeholder="Scientific label" aria-describedby={tested?`bio-feedback-${label.id}`:undefined}/>
     {tested&&<p id={`bio-feedback-${label.id}`} role="status" className={match?'bio-drawing-right':'bio-drawing-retry'}>{match?'Matches the reference terminology.':value.trim()?'Not matched. Try the clue again or reveal the answer.':'Not answered yet.'}</p>}
    </div>;
   })}</div>
   <div className="bio-drawing-actions">
    <button className="bio-drawing-primary" type="button" onClick={markChecked}>Check labels</button>
    <button type="button" onClick={()=>setReference(!revealed)}>{revealed?'Hide labels':'Reveal labels'}</button>
    <button type="button" onClick={reset}><RotateCcw size={16} aria-hidden="true"/> Try again</button>
   </div>
   {tested&&<p role="status" className="bio-drawing-note">This is a clue-to-label comparison, not a mastery estimate or an assessment of your drawing.</p>}
   {revealed&&<ReferenceDetails exercise={exercise}/>}
  </div>:<div className="bio-drawing-paper">
   <nav className="bio-drawing-steps" aria-label="Drawing exercise steps"><ol>{stepTitles.map((name,index)=><li key={name} aria-current={index===step?'step':undefined}><span>{index+1}</span><span>{name}</span></li>)}</ol></nav>
   <div className="bio-drawing-paper-content"><span className="bio-eyebrow">STEP {step+1} OF 5</span><h4>{stepTitles[step]}</h4>
    {step===0&&<><p>Study the reference. Notice the shape, partial charges and the difference between solid and dashed lines.</p>{figure(false)}<ReferenceDetails exercise={exercise}/></>}
    {step===1&&<><p>{exercise.drawPrompt}</p><div className="bio-drawing-hidden" role="status"><PencilLine size={28} aria-hidden="true"/><strong>Reference hidden</strong><span>Draw on paper from memory. Do not copy the model.</span></div></>}
    {step===2&&<><p>Keep the reference hidden. Add these labels in their correct positions on your paper drawing.</p><ul className="bio-drawing-label-list">{exercise.labels.map(label=><li key={label.id}>{label.name}</li>)}</ul></>}
    {step===3&&<><p>Reveal the reference and compare your diagram. Read each function and correct inaccuracies on paper.</p>{figure(false)}<ReferenceDetails exercise={exercise}/></>}
    {step===4&&<><p>Assess what you actually included on paper. BioLab cannot see or grade your drawing. This is not an official IB mark scheme.</p>
     <fieldset className="bio-drawing-checklist"><legend>My self-assessment</legend>{criteria.map(c=><label key={c.id}>
      <input type="checkbox" checked={!!reviewed[c.id]} onChange={e=>{setConfirmed(false);setReviewed(s=>({...s,[c.id]:e.target.checked}))}}/><span>{c.text}</span>
     </label>)}</fieldset>
     {confirmed&&<p className="bio-drawing-selfcheck" role="status"><CheckCircle2 size={18} aria-hidden="true"/> Self-check recorded for this attempt only. Review any unchecked items and repeat.</p>}
    </>}
   </div>
   <div className="bio-drawing-actions">
    {step>0&&<button type="button" onClick={()=>{setStep(n=>(n-1) as Step);setConfirmed(false)}}><ArrowLeft size={16} aria-hidden="true"/> Back</button>}
    {step<4?<button className="bio-drawing-primary" type="button" onClick={()=>setStep(n=>(n+1) as Step)}>
     {['Hide reference & draw','I have drawn it','Compare drawing','Check my drawing'][step]} <ArrowRight size={16} aria-hidden="true"/>
    </button>:<button className="bio-drawing-primary" type="button" onClick={()=>setConfirmed(true)}>Finish self-check</button>}
    <button type="button" onClick={reset}><RotateCcw size={16} aria-hidden="true"/> Try again</button>
   </div>
  </div>}
  <footer className="bio-drawing-footer">
   <p>Figure evidence: {exercise.availabilityEvidence} Independent specialist review is pending. BioLab is not IB-certified.</p>
   <a href={`${base}/learn?understanding=${exercise.understandingId}`}>Read explanation <ArrowRight size={16} aria-hidden="true"/></a>
  </footer>
 </section>;
}
function ReferenceDetails({exercise}:{exercise:DrawingExercise}){
 return <div className="bio-drawing-reference"><h4>Reference: labels and functions</h4><dl>
  {exercise.labels.map(label=><div key={label.id}><dt>{label.name}</dt><dd>{label.function}</dd></div>)}
 </dl></div>;
}
