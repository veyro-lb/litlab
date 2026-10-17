import {useEffect,useState,useRef} from 'react';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import UnderstandingLabel from './UnderstandingLabel';
import {themes,organizations} from '../curriculum/manifest';
import type {Level,Topic} from '../curriculum/schema';
import {inScope,readStudy,saveStudy} from './content';
import type {Lesson,StudyState} from './content';
import {ChoiceQuestion,RecallQuestion,WrittenQuestion} from './StudyQuestion';
import type {UpdateStudy} from './StudyQuestion';
import ScientificFigure from './ScientificFigure';
import ReadingUnderstanding from './ReadingUnderstanding';
import ResourceNav from '../components/ResourceNav';
import FlashcardStudy from './FlashcardStudy';
export type LessonMode = 'learn'|'revision'|'practice'|'sources'|'flashcards';
export default function LessonView({lesson,topic,level,mode,hash}: {lesson:Lesson;topic:Topic;level:Level;mode:LessonMode;hash:string}) {
  const requestedCandidate=new URLSearchParams(hash.split('?')[1]??'').get('understanding');
  // Discard unknown or out-of-scope deep links before selecting a section or practice target.
  const requestedId=topic.understandings.some(u=>u.id===requestedCandidate&&(level==='HL'||u.level==='shared'))?requestedCandidate:null;
  const [study,setStudy]=useState<StudyState>(()=>{const saved=readStudy(lesson.id);return {...saved,sectionId:lesson.sections.find(s=>s.understandingIds.includes(requestedId??''))?.id??saved.sectionId}});
  useEffect(()=>{const target=lesson.sections.find(s=>s.understandingIds.includes(requestedId??''));if(target){setStudy(s=>{const next={...s,sectionId:target.id};saveStudy(lesson.id,next);return next});requestAnimationFrame(()=>{const el=document.querySelector('[data-biology-host]')?.shadowRoot?.querySelector<HTMLElement>('.bio-lesson-content');el?.focus({preventScroll:true});el?.scrollIntoView({block:'start',behavior:'instant' as ScrollBehavior})})}},[requestedId,lesson]);
  const base=`#biology/topic/${lesson.topicId}`;
  const toc=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{const media=window.matchMedia('(min-width: 761px)');const sync=()=>{if(toc.current)toc.current.open=media.matches};sync();media.addEventListener('change',sync);return ()=>media.removeEventListener('change',sync)},[mode]);
  const [missedOnly,setMissedOnly]=useState(false);
  const update:UpdateStudy=fn=>setStudy(s=>{const next=fn(s);saveStudy(lesson.id,next);return next});
  const sections=lesson.sections.filter(s=>inScope(s,level));
  if(!sections.length)return <section className="bio-empty"><h1>This topic is HL only</h1><p>Select HL to open this draft.</p></section>;
  const section=sections.find(s=>s.id===study.sectionId)??sections[0];
  const index=sections.indexOf(section);
  const questions=lesson.questions.filter(q=>inScope(q,level));
  const targeted=mode==='practice'&&requestedId?questions.filter(q=>q.understandingIds.includes(requestedId)):questions;
  const choices=targeted.filter(q=>q.options);
  const attempted=choices.filter(q=>!!study.answers[q.id]);
  const correct=attempted.filter(q=>'options' in q&&q.options?.some(o=>o.id===study.answers[q.id]&&o.correct));
  const missed=attempted.filter(q=>'options' in q&&!q.options?.some(o=>o.id===study.answers[q.id]&&o.correct));
  function chooseSection(id:string){if(window.matchMedia('(max-width: 760px)').matches&&toc.current)toc.current.open=false;const target=lesson.sections.find(s=>s.id===id);if(target)location.hash=`${base}/${mode}?understanding=${target.understandingIds[0]}`;update(s=>({...s,sectionId:id}));requestAnimationFrame(()=>{const el=document.querySelector('[data-biology-host]')?.shadowRoot?.querySelector<HTMLElement>('.bio-lesson-content');el?.focus({preventScroll:true});el?.scrollIntoView({block:'start',behavior:'instant' as ScrollBehavior})})}
  function revisit(id:string){update(s=>({...s,sectionId:id}));location.hash=`${base}/learn?understanding=${lesson.sections.find(s=>s.id===id)?.understandingIds[0]??''}`}
  return <article className="bio-lesson" data-lesson-id={lesson.id} data-mode={mode}>
    <a className="bio-back" href={base}><ArrowLeft size={16} aria-hidden="true"/>Topic understandings</a>
    <header className="bio-lesson-hero"><div><span className="bio-eyebrow">{topic.id} / {themes[topic.theme].title.toUpperCase()} / {organizations[topic.organization-1].toUpperCase()}</span><h1>{lesson.title}</h1><p>{lesson.introduction}</p><div className="bio-lesson-meta"><span>{level} · {sections.length} sections</span><span>Interactive draft</span><span>First assessment 2025</span></div></div></header>
    <p className="bio-draft-note">Development draft · scientific review pending. <a href={`${base}/sources`}>Sources and review</a></p>
    <ResourceNav active={mode} topicId={topic.id} reading understandingId={requestedId??undefined}/>
    {(mode==='learn'||mode==='revision')&&<div className="bio-lesson-layout"><aside className="bio-lesson-nav"><span className="bio-eyebrow">YOUR PATH / {level}</span><details className="bio-toc" ref={toc} open><summary>Understandings <span>{section.understandingIds[0]} · {index+1} of {sections.length}</span></summary><ol>{sections.map((s)=><li key={s.id}><button type="button" aria-current={s.id===section.id?'step':undefined} onClick={()=>chooseSection(s.id)}><UnderstandingLabel topic={topic} ids={s.understandingIds}/>{s.level==='HL'&&<small>HL</small>}</button></li>)}</ol></details><p>Read at your own pace. Activities are optional.</p><small>Answers stay in this tab across routes. Refresh starts a new session. No mastery or completion is recorded.</small></aside>
    <section className="bio-lesson-content" tabIndex={-1} data-understanding-id={section.understandingIds[0]} data-level={section.level}><span className="bio-eyebrow">{section.understandingIds[0]} · {section.level==='HL'?'ADDITIONAL HL':'SL + HL'} · UNDERSTANDING {index+1} OF {sections.length}</span><h2><UnderstandingLabel topic={topic} ids={section.understandingIds}/></h2><p className="bio-guiding-question">{section.guidingQuestion}</p>
      {mode==='learn'?<ReadingUnderstanding lesson={lesson} section={section} study={study} update={update}/>:<>
      <div className="bio-takeaway"><strong>Retrieve the chain</strong><p>{section.revisionSummary}</p></div>
      {section.assets.length>0&&<>{section.assets.some(id=>lesson.assets.find(a=>a.id===id)?.recallSrc&&!lesson.assets.find(a=>a.id===id)?.withheldReason)&&<div className="bio-actions"><button type="button" aria-pressed={!study.labels} onClick={()=>update(s=>({...s,labels:!s.labels}))}>{study.labels?'Hide figure labels for recall':'Reveal figure labels'}</button></div>}{section.assets.map(id=>{const asset=lesson.assets.find(a=>a.id===id)!;return <ScientificFigure key={id} asset={asset} hideLabels={!study.labels&&asset.kind!=='photograph'}/>})}</>}
      {section.recall.map(q=><RecallQuestion key={q.id} item={q} study={study} update={update}/>)}
      <details className="bio-terms"><summary>Essential terms</summary><ul>{section.terms.map(t=><li key={t}>{t}</li>)}</ul></details>
      </>}
      <div className="bio-actions bio-related-study"><a href={`${base}/${mode==='revision'?'learn':'revision'}?understanding=${section.understandingIds[0]}`}>{mode==='revision'?'Read the full explanation':'Revise this understanding'} · {section.understandingIds[0]}</a><a href={`${base}/practice?understanding=${section.understandingIds[0]}`}>Practise {section.understandingIds[0]}</a></div><div className="bio-section-controls"><button type="button" disabled={index===0} onClick={()=>chooseSection(sections[index-1].id)}><ArrowLeft size={16} aria-hidden="true"/>Previous</button><span>{index+1} / {sections.length}</span>{index<sections.length-1?<button type="button" onClick={()=>chooseSection(sections[index+1].id)}>Next section<ArrowRight size={16} aria-hidden="true"/></button>:<a className="bio-primary" href={`${base}/practice`}>Apply it in practice<ArrowRight size={16} aria-hidden="true"/></a>}</div>
    </section></div>}
    {mode==='practice'&&<section className="bio-practice"><span className="bio-eyebrow">RETRIEVE / REASON / APPLY</span><h2>Make the explanation yours.</h2><p>Original practice inspired by the assessment formats. These are draft teaching questions, not official IB examination items. Select an answer for feedback; written responses use self-review guidance.</p>{requestedId&&<p className="bio-practice-target">Targeting {requestedId} · <a href={`${base}/practice`}>Show all practice</a></p>}<div className="bio-practice-status" role="status">{attempted.length} of {choices.length} multiple-choice questions attempted · {correct.length} currently correct · {missed.length} to revisit. This is a practice count, not a mastery estimate.</div><button type="button" aria-pressed={missedOnly} onClick={()=>setMissedOnly(!missedOnly)}>{missedOnly?'Show all practice':'Review missed questions'}</button>{missedOnly&&missed.length===0&&<p>No currently missed questions in your {level} practice. Answer a question to begin.</p>}
      {(missedOnly?missed:choices).map(q=>'options' in q&&q.options?<div className="bio-practice-choice" key={q.id}><span className="bio-eyebrow">PAPER 1A STYLE · {q.understandingIds.join(' / ')}{q.level==='HL'?' · ADDITIONAL HL':''}</span><p className="bio-question-syllabus">Syllabus: <UnderstandingLabel topic={topic} ids={q.understandingIds}/></p><ChoiceQuestion item={{...q,kind:'selection',options:q.options}} study={study} update={update} returnTo={()=>revisit(q.sectionId)}/></div>:null)}
      {!missedOnly&&targeted.filter(q=>q.markingPoints).map(q=><WrittenQuestion key={q.id} topic={topic} item={q} study={study} update={update}/>)}
    </section>}
    {mode==='flashcards'&&<FlashcardStudy lesson={lesson} sections={sections} requestedId={requestedId} study={study} update={update}/>}
    {mode==='sources'&&<section className="bio-sources"><h2>Trace the evidence.</h2><p><strong>Core syllabus:</strong> IB Biology Guide, first assessment 2025. <strong>Main teaching coursebook:</strong> Clegg, Davis &amp; Talbot, <em>Biology for the IB Diploma Programme, Third Edition</em> (Hodder Education, 2023). BioLab lessons are original teaching drafts based on these resources; scientific cross-checks and appropriately licensed imagery are recorded below. We do not reproduce the publisher’s protected figures or text.</p><h3>Review record</h3><ul>{lesson.review.notes.filter(n=>!/(?:PDF|printed|Guide) (?:p|pp)\./i.test(n)).map(n=><li key={n}>{n}</li>)}</ul><p>Source check: {lesson.review.sourceCheckedAt}. Qualified reviewer: not yet assigned. Software tests verify behavior and structure; they do not certify science.</p><h3>References in your {level} scope</h3><ol>{lesson.references.filter(r=>inScope(r,level)).map(r=><li key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title}{r.url?' ↗':''}</a><p>{r.url ? 'Independent research or figure reference' : 'Main teaching and curriculum reference'}</p></li>)}</ol><h3>Figures and reuse</h3>{lesson.assets.filter(a=>inScope(a,level)).map(a=><details className="bio-source-note" key={a.id}><summary>{a.id} · {a.kind}</summary><p>{a.attribution}</p><p>{a.license}</p><p>{a.permissionEvidence}</p>{'sourceUrl' in a&&a.sourceUrl&&<p><a href={a.sourceUrl} target="_blank" rel="noreferrer">Original source ↗</a> · <a href={a.termsUrl} target="_blank" rel="noreferrer">Reuse terms ↗</a></p>}<p>Scientific status: source-checked draft, qualified review pending.</p></details>)}<h3>Questions to carry forward</h3><p>{lesson.summary}</p></section>}
  </article>;
}
