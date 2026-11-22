import {useId,useRef,useState} from 'react';
import {Check,X} from 'lucide-react';
import UnderstandingLabel from './UnderstandingLabel';
import type {Topic} from '../curriculum/schema';
import type {Choice, Question, StudyState} from './content';
export type UpdateStudy = (fn: (previous: StudyState) => StudyState) => void;
export function ChoiceQuestion({item,study,update,returnTo}: {item: Choice; study: StudyState; update: UpdateStudy; returnTo?: () => void}) {
  const fieldset=useRef<HTMLFieldSetElement>(null);
  const groupId=useId();
  const selected=study.answers[item.id];
  const [draft,setDraft]=useState<string|undefined>(()=>selected);
  const answer=item.options.find(o=>o.id===selected);
  const outcome=answer?(answer.correct?'correct':'retry'):undefined;
  const result=answer?(answer.correct?'Correct':'Incorrect'):undefined;

  function clearAnswer(){
    update(s=>{
      const answers={...s.answers};
      delete answers[item.id];
      return {...s,answers};
    });
  }

  function checkAnswer(){
    if(!draft)return;
    fieldset.current?.querySelector<HTMLInputElement>('input:checked')?.focus({preventScroll:true});
    update(s=>({...s,answers:{...s.answers,[item.id]:draft}}));
  }

  function retry(){
    clearAnswer();
    setDraft(undefined);
    fieldset.current?.querySelector<HTMLInputElement>('input')?.focus();
  }

  return <fieldset ref={fieldset} className="bio-check" data-question-id={item.id}>
    <legend>{item.prompt}</legend>
    <p className="bio-check-instruction">Choose an answer, then check your reasoning.</p>
    <div className="bio-options">
      {item.options.map((option,index)=>{
        const checkedResult=option.id===answer?.id?outcome:undefined;
        const ResultIcon=checkedResult==='correct'?Check:X;
        return <label key={option.id} data-outcome={checkedResult}>
          <input type="radio" name={groupId} value={option.id} checked={draft===option.id} onChange={()=>{
            setDraft(option.id);
            if(selected)clearAnswer();
          }}/>
          <span className="bio-option-content">
            <span><b>{String.fromCharCode(65+index)}.</b> {option.text}</span>
            {checkedResult&&<span className="bio-option-result"><ResultIcon size={16} aria-hidden="true"/> {result}</span>}
          </span>
        </label>;
      })}
    </div>
    <div className="bio-sr-only" role="status" aria-atomic="true">{answer&&`${result}. ${answer.feedback}`}</div>
    {!answer&&<div className="bio-answer-controls"><button type="button" className="bio-btn-primary" disabled={!draft} onClick={checkAnswer}>Check my answer</button></div>}
    {answer&&<div className="bio-feedback" data-outcome={outcome}>
      <strong>{result}.</strong>{answer.feedback}
      <details><summary>Explain every choice</summary>{item.options.map((o,i)=><p key={o.id}><b>{String.fromCharCode(65+i)}. {o.correct ? 'Correct' : 'Incorrect'}:</b> {o.feedback}</p>)}</details>
      <div className="bio-actions">
        <button type="button" className="bio-btn-quiet" onClick={retry}>Try again</button>
        {returnTo&&<button type="button" className="bio-btn-quiet" onClick={returnTo}>Revisit explanation</button>}
      </div>
    </div>}
  </fieldset>;
}
export function RecallQuestion({item,study,update}: {item: {id:string;prompt:string;answer:string;enrichment?:boolean};study:StudyState;update:UpdateStudy}) {
  const shown=!!study.revealed[item.id];
  return <div className="bio-recall"><h4>{item.enrichment&&<span>Enrichment · </span>}{item.prompt}</h4><button type="button" aria-expanded={shown} aria-controls={`answer-${item.id}`} onClick={()=>update(s=>({...s,revealed:{...s.revealed,[item.id]:!shown}}))}>{shown?'Hide answer':'Reveal answer'}</button>{shown&&<p id={`answer-${item.id}`} role="status">{item.answer}</p>}</div>;
}
export function WrittenQuestion({item,study,update,topic}: {item:Question;study:StudyState;update:UpdateStudy;topic:Topic}) {
  if(!('markingPoints' in item)||!item.markingPoints)return null;
  const shown=!!study.revealed[item.id];
  const modelAnswer = item.answer === item.markingPoints.join(' ') ? undefined : item.answer;
  return <article className="bio-written" data-question-id={item.id}><span className="bio-eyebrow">PAPER {item.paper} STYLE · {item.marks} SUGGESTED MARKS</span><p className="bio-question-syllabus">Syllabus: <UnderstandingLabel topic={topic} ids={item.understandingIds}/></p><h3>{item.prompt}</h3>
    {'data' in item&&item.data&&<div className="bio-table-scroll" tabIndex={0} role="region" aria-label="Practice data"><table><caption>{item.data.caption}</caption><thead><tr>{item.data.headers.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{item.data.rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}
    <label className="bio-response-label" htmlFor={`response-${item.id}`}>Your response (kept in this tab until refresh)</label><textarea id={`response-${item.id}`} value={study.drafts[item.id]||''} onChange={e=>{const value=e.target.value;update(s=>({...s,drafts:{...s.drafts,[item.id]:value}}))}} rows={4}/>
    <button type="button" aria-expanded={shown} aria-controls={`answer-${item.id}`} onClick={()=>update(s=>({...s,revealed:{...s.revealed,[item.id]:!shown}}))}>{shown?'Hide marking guidance':'Compare with marking guidance'}</button>
    {shown&&<div className="bio-feedback" id={`answer-${item.id}`}><h4>Mark scheme</h4>{modelAnswer&&<p>{modelAnswer}</p>}<ul>{item.markingPoints.map(point=><li key={point}>{point}</li>)}</ul></div>}
  </article>;
}
