import {useState} from 'react';
import type {MechanismChallenge} from './lesson-contract';
/** Small, reusable prediction-and-reasoning sequence. The result lives only within this component. */
export default function MechanismSequence({challenge}:{challenge:MechanismChallenge}){
 const [index,setIndex]=useState(0);
 const [selected,setSelected]=useState<string|null>(null);
 if(index===challenge.stages.length)return <section className="bio-mechanism" aria-label={challenge.title}>
  <h3>{challenge.title}</h3><p>You have explained each step of this mechanism. This is a completed exercise, not a mastery score.</p>
  <button type="button" onClick={()=>{setIndex(0);setSelected(null)}}>Try the mechanism again</button>
 </section>;
 const stage=challenge.stages[index],chosen=stage.options.find(x=>x.id===selected);
 return <section className="bio-mechanism" aria-label={challenge.title}>
   <span className="bio-eyebrow">BUILD THE MECHANISM / STEP {index+1} OF {challenge.stages.length}</span>
   <h3>{challenge.title}</h3>
   <p>{challenge.instructions}</p>
   <p className="bio-mechanism-question">{stage.prompt}</p>
   <div className="bio-mechanism-choices" role="group" aria-label={stage.prompt}>
     {stage.options.map(option=><button key={option.id} type="button" aria-pressed={selected===option.id} onClick={()=>setSelected(option.id)}>
       {option.text}
     </button>)}
   </div>
   <div className="bio-mechanism-feedback" role="status" aria-live="polite">
     {chosen?<><strong>{chosen.correct?'Correct prediction':'Try again'}</strong><p>{chosen.feedback}{chosen.correct?' '+stage.explanation:''}</p></>:<p>Choose a prediction to see the explanation.</p>}
   </div>
   <button className="bio-mechanism-next" type="button" disabled={!chosen?.correct} onClick={()=>{setIndex(i=>i+1);setSelected(null)}}>
     {index===challenge.stages.length-1?'Finish mechanism':'Predict next step'}
   </button>
 </section>
}
