import type {Lesson,Section,StudyState} from './content';
import type {UpdateStudy} from './StudyQuestion';
import {ChoiceQuestion,RecallQuestion} from './StudyQuestion';
import ScientificFigure from './ScientificFigure';
import MechanismSequence from './MechanismSequence';
import MolecularViewerActivity from './MolecularViewerActivity';
import OrganelleInvestigation from './OrganelleInvestigation';
import ExplanationHelp from './ExplanationHelp';
import WaterHeatInvestigation from './WaterHeatInvestigation';
import LearningVisual from './LearningVisual';
import AuthenticMicroscopy from './AuthenticMicroscopy';

export default function ReadingUnderstanding({lesson,section,study,update}:{lesson:Lesson;section:Section;study:StudyState;update:UpdateStudy}){
 const blocks=section.teachingBlocks??section.explanation.split('\n\n').map((explanation,i)=>({title:section.terms[i]?.split(':')[0]??'Biological connection',explanation,referenceIds:section.referenceIds}));
 const placements=section.figurePlacements??section.assets.map((assetId,i)=>({assetId,afterBlock:Math.min(i+1,blocks.length-1)}));
 const figure=(id:string)=>{const asset=lesson.assets.find(a=>a.id===id);return asset?<ScientificFigure key={id} asset={asset} hideLabels={!study.labels&&asset.kind!=='photograph'}/>:null};
 return <div className="bio-reading" data-reading-id={section.understandingIds[0]}>
  {blocks.map((b,i)=><div className="bio-reading-passage" key={b.title}><section aria-labelledby={section.id+'-heading-'+i}><h3 id={section.id+'-heading-'+i}>{b.title}</h3>{b.explanation.split('\n\n').map(p=><p key={p}>{p}</p>)}</section>{placements.filter(p=>p.afterBlock===i).map(p=>figure(p.assetId))}{section.visuals?.filter(v=>v.afterBlock===i).map((v,j)=><LearningVisual key={v.title+j} visual={v}/>)}</div>)}
  {section.authenticMicrographs?.length>0&&<AuthenticMicroscopy cases={section.authenticMicrographs} study={study} update={update}/>}
  {section.enrichment&&<section className="bio-reading-extension"><h3>{section.enrichment.title}</h3><p>{section.enrichment.text}</p><span className="bio-muted">Extension beyond the core understanding</span></section>}
  <aside className="bio-worked-example"><span className="bio-eyebrow">IN A LIVING SYSTEM</span><h3>{section.exampleTitle??'Connect the explanation to an example'}</h3><p>{section.workedExample}</p></aside>
  {(section.molecularViewer||section.graphTables?.length)&&<section className="bio-reading-data"><h3>Look at the evidence</h3>{section.molecularViewer&&<MolecularViewerActivity activity={section.molecularViewer}/>} {section.graphTables?.map((g,i)=><div className="bio-table-scroll" key={i} tabIndex={0} role="region" aria-label={g.caption}><table><caption>{g.caption}</caption><thead><tr>{g.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{g.rows.map((r,j)=><tr key={j}>{r.map((v,k)=><td key={k}>{v}</td>)}</tr>)}</tbody></table></div>)}</section>}
  <ExplanationHelp key={section.id} section={section}/>
  <section className="bio-optional-investigation"><div className="bio-activity-heading"><span className="bio-eyebrow">OPTIONAL · THINK WITH THE BIOLOGY</span><h3>{section.activityTitle??'Test your explanation'}</h3><p>The full explanation is above. Use these activities to test a prediction and inspect the reasoning.</p></div>{section.understandingIds.includes('A1.1.6')&&<WaterHeatInvestigation study={study} update={update}/>} {section.prediction&&<ChoiceQuestion item={section.prediction.question} study={study} update={update}/>} {lesson.topicId==='B2.2'?<OrganelleInvestigation key={section.id} number={Number(section.understandingIds[0].split('.')[2])} study={study} update={update}/>:section.mechanismChallenge?<MechanismSequence key={section.id} challenge={section.mechanismChallenge}/>:null}
  {section.interactions.map(q=><ChoiceQuestion key={q.id} item={q} study={study} update={update}/>)}</section>
  <section className="bio-retrieval"><h3>Make the idea stick</h3><div className="bio-recall-group">{section.recall.map(q=><RecallQuestion key={q.id} item={q} study={study} update={update}/>)}</div><div className="bio-misconception"><h4>Repair a misconception</h4>{section.misconceptions.map((m,i)=><div key={m.misconception}><p><strong>Someone claims:</strong> “{m.misconception}”</p><label className="bio-response-label" htmlFor={section.id+'-repair-'+i}>Rewrite the claim so it is biologically accurate.</label><textarea id={section.id+'-repair-'+i} rows={2} value={study.drafts[section.id+':repair:'+i]??''} onChange={e=>{const value=e.target.value;update(s=>({...s,drafts:{...s.drafts,[section.id+':repair:'+i]:value}}))}}/><RecallQuestion item={{id:section.id+':repair-feedback:'+i,prompt:'Compare your repair',answer:m.correction}} study={study} update={update}/></div>)}</div></section>
  <div className="bio-takeaway"><strong>Keep this connection</strong><p>{section.revisionSummary}</p></div>
 </div>;
}
