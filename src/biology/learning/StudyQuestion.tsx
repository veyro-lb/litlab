import UnderstandingLabel from './UnderstandingLabel';
import type {Topic} from '../curriculum/schema';
import type {Choice, Question, StudyState} from './content';
export type UpdateStudy = (fn: (previous: StudyState) => StudyState) => void;
export function ChoiceQuestion({item,study,update,returnTo}: {item: Choice; study: StudyState; update: UpdateStudy; returnTo?: () => void}) {
  const selected=study.answers[item.id];
  const answer=item.options.find(o=>o.id===selected);
  return <fieldset className="bio-check" data-question-id={item.id}><legend>{item.prompt}</legend>
    <div className="bio-options">{item.options.map(o=><label key={o.id}><input type="radio" name={item.id} value={o.id} checked={selected===o.id} onChange={()=>update(s=>({...s,answers:{...s.answers,[item.id]:o.id}}))}/><span><b>{o.id.toUpperCase()}.</b> {o.text}</span></label>)}</div>
    {answer && <div className="bio-feedback" role="status"><strong>{answer.correct ? 'Correct. ' : 'Reconsider. '}</strong>{answer.feedback}
      <details><summary>Explain every choice</summary>{item.options.map(o=><p key={o.id}><b>{o.id.toUpperCase()}. {o.correct ? 'Correct' : 'Incorrect'}:</b> {o.feedback}</p>)}</details>
      <div className="bio-actions"><button type="button" onClick={()=>update(s=>{const a={...s.answers};delete a[item.id];return {...s,answers:a}})}>Try again</button>{returnTo && <button type="button" onClick={returnTo}>Revisit explanation</button>}</div></div>}
  </fieldset>;
}
export function RecallQuestion({item,study,update}: {item: {id:string;prompt:string;answer:string;enrichment?:boolean};study:StudyState;update:UpdateStudy}) {
  const shown=!!study.revealed[item.id];
  return <div className="bio-recall"><h4>{item.enrichment&&<span>Enrichment · </span>}{item.prompt}</h4><button type="button" aria-expanded={shown} aria-controls={`answer-${item.id}`} onClick={()=>update(s=>({...s,revealed:{...s.revealed,[item.id]:!shown}}))}>{shown?'Hide answer':'Reveal answer'}</button>{shown&&<p id={`answer-${item.id}`} role="status">{item.answer}</p>}</div>;
}
export function WrittenQuestion({item,study,update,topic}: {item:Question;study:StudyState;update:UpdateStudy;topic:Topic}) {
  if(!('markingPoints' in item)||!item.markingPoints)return null;
  const shown=!!study.revealed[item.id];
  return <article className="bio-written" data-question-id={item.id}><span className="bio-eyebrow">PAPER {item.paper} STYLE · {item.marks} SUGGESTED MARKS</span><p className="bio-question-syllabus">Syllabus: <UnderstandingLabel topic={topic} ids={item.understandingIds}/></p><h3>{item.prompt}</h3>
    {'data' in item&&item.data&&<div className="bio-table-scroll" tabIndex={0} role="region" aria-label="Practice data"><table><caption>{item.data.caption}</caption><thead><tr>{item.data.headers.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{item.data.rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}
    <label className="bio-response-label" htmlFor={`response-${item.id}`}>Your response (kept in this tab until refresh)</label><textarea id={`response-${item.id}`} value={study.drafts[item.id]||''} onChange={e=>{const value=e.target.value;update(s=>({...s,drafts:{...s.drafts,[item.id]:value}}))}} rows={4}/>
    <button type="button" aria-expanded={shown} aria-controls={`answer-${item.id}`} onClick={()=>update(s=>({...s,revealed:{...s.revealed,[item.id]:!shown}}))}>{shown?'Hide marking guidance':'Compare with marking guidance'}</button>
    {shown&&<div className="bio-feedback" id={`answer-${item.id}`}><p>{item.answer}</p><ul>{item.markingPoints.map(p=><li key={p}>{p}</li>)}</ul><small>Self-review guidance only. No automatic written-response mark is awarded; teacher review is needed.</small></div>}<p className="bio-muted">{item.understandingIds.join(' · ')} · Original draft practice · Awaiting assessment review</p>
  </article>;
}
