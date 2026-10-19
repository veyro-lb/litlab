import type {LearningVisual as Visual} from './lesson-contract';

/** Authored, source-scoped visuals: never infer a chart from arbitrary lesson text. */
export default function LearningVisual({visual}:{visual:Visual}) {
  if(visual.kind==='comparison')return <section className="bio-learning-visual" aria-label={visual.title}>
    <h4>{visual.title}</h4>{visual.note&&<p className="bio-visual-note">{visual.note}</p>}
    <div className="bio-table-scroll" tabIndex={0} role="region" aria-label={visual.title}>
      <table><thead><tr>{visual.headers.map((heading,i)=><th scope="col" key={i}>{heading}</th>)}</tr></thead>
        <tbody>{visual.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th scope="row" key={j}>{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table>
    </div>
  </section>;
  if(visual.kind==='sequence')return <section className="bio-learning-visual" aria-label={visual.title}>
    <h4>{visual.title}</h4>{visual.note&&<p className="bio-visual-note">{visual.note}</p>}
    <ol className="bio-visual-sequence">{visual.steps.map((step,i)=><li key={i}><strong>{step.title}</strong><span>{step.description}</span></li>)}</ol>
  </section>;
  const max=Math.max(1,...visual.values.map(d=>d.value));
  return <section className="bio-learning-visual" aria-label={visual.title}>
    <h4>{visual.title}</h4>{visual.note&&<p className="bio-visual-note">{visual.note}</p>}
    <div className="bio-visual-bars" role="img" aria-label={visual.title+': '+visual.values.map(v=>v.label+' '+v.value+' '+visual.unit).join('; ')}>
      {visual.values.map(v=><div className="bio-visual-bar-row" key={v.label}>
        <span className="bio-visual-bar-label">{v.label}</span>
        <div className="bio-visual-bar-track" aria-hidden="true"><div style={{width:(v.value/max*100)+'%'}}/></div>
        <strong>{v.value.toLocaleString('en-GB')}</strong>
      </div>)}
      <span className="bio-visual-axis">Linear scale from zero · {visual.unit}</span>
    </div>
  </section>;
}
