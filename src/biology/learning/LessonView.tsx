import {useEffect,useState,useRef} from 'react';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import UnderstandingLabel from './UnderstandingLabel';
import {themes,organizations} from '../curriculum/manifest';
import type {Level,Topic} from '../curriculum/schema';
import {inScope,readStudy,saveStudy} from './content';
import type {Lesson,StudyState} from './content';
import type {UpdateStudy} from './StudyQuestion';
import ReadingUnderstanding from './ReadingUnderstanding';
import ResourceNav from '../components/ResourceNav';
import FlashcardStudy from './FlashcardStudy';
import DrawingPractice from './drawing-practice/DrawingPractice';
import type {LessonMode} from '../routes';
import TopicPractice from './TopicPractice';
import CheatSheetView from './CheatSheetView';

export default function LessonView({lesson,topic,level,mode,hash}: {lesson:Lesson;topic:Topic;level:Level;mode:LessonMode;hash:string}) {
  const requestedCandidate=new URLSearchParams(hash.split('?')[1]??'').get('understanding');
  // Discard unknown or out-of-scope deep links before selecting a section or practice target.
  const requestedId=topic.understandings.some(u=>u.id===requestedCandidate&&(level==='HL'||u.level==='shared'))?requestedCandidate:null;
  const [study,setStudy]=useState<StudyState>(()=>{const saved=readStudy(lesson.id);return {...saved,sectionId:lesson.sections.find(s=>s.understandingIds.includes(requestedId??''))?.id??saved.sectionId}});
  useEffect(()=>{if(mode==='cheat-sheets')return;const target=lesson.sections.find(s=>s.understandingIds.includes(requestedId??''));if(target){setStudy(s=>{const next={...s,sectionId:target.id};saveStudy(lesson.id,next);return next});requestAnimationFrame(()=>{const root=document.querySelector('[data-biology-host]')?.shadowRoot;const el=root?.querySelector<HTMLElement>('.bio-lesson-content');const focused=root?.activeElement; // Do not steal focus from controls while the section settles after navigation.
    if(focused?.closest('button,a[href],input,select,textarea,[role="button"],[role="link"],[contenteditable="true"]'))return;
    el?.focus({preventScroll:true});el?.scrollIntoView({block:'start',behavior:'instant' as ScrollBehavior})})}},[requestedId,lesson,mode]);
  const base=`#biology/topic/${lesson.topicId}`;
  const toc=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{const media=window.matchMedia('(min-width: 761px)');const sync=()=>{if(toc.current)toc.current.open=media.matches};sync();media.addEventListener('change',sync);return ()=>media.removeEventListener('change',sync)},[mode]);
  const update:UpdateStudy=fn=>setStudy(s=>{const next=fn(s);saveStudy(lesson.id,next);return next});
  const sections=lesson.sections.filter(s=>inScope(s,level));
  if(!sections.length)return <section className="bio-empty"><h1>This topic is HL only</h1><p>Select HL to open this lesson.</p></section>;
  if(mode==='cheat-sheets')return <CheatSheetView key={hash+level} title={lesson.title} topic={topic} sections={sections} level={level} requestedId={requestedId}/>;
  const section=sections.find(s=>s.id===study.sectionId)??sections[0];
  const index=sections.indexOf(section);
  function chooseSection(id:string){if(window.matchMedia('(max-width: 760px)').matches&&toc.current)toc.current.open=false;const target=lesson.sections.find(s=>s.id===id);if(target)location.hash=`${base}/${mode}?understanding=${target.understandingIds[0]}`;update(s=>({...s,sectionId:id}));requestAnimationFrame(()=>{const el=document.querySelector('[data-biology-host]')?.shadowRoot?.querySelector<HTMLElement>('.bio-lesson-content');el?.focus({preventScroll:true});el?.scrollIntoView({block:'start',behavior:'instant' as ScrollBehavior})})}
  function revisit(id:string){update(s=>({...s,sectionId:id}));location.hash=`${base}/learn?understanding=${lesson.sections.find(s=>s.id===id)?.understandingIds[0]??''}`}
  return <article className="bio-lesson" data-lesson-id={lesson.id} data-mode={mode}>
    {mode!=='flashcards'&&<>
      <a className="bio-back" href={base}><ArrowLeft size={16} aria-hidden="true"/>Back to understandings</a>
      <header className="bio-lesson-hero"><div><span className="bio-eyebrow">{topic.id} / {themes[topic.theme].title.toUpperCase()} / {organizations[topic.organization-1].toUpperCase()}</span><h1>{lesson.title}</h1><p>{lesson.introduction}</p><div className="bio-lesson-meta"><span>{level} · {sections.length} sections</span><span>First assessment 2025</span></div></div></header>
    </>}
    <ResourceNav active={mode} topicId={topic.id} understandingId={requestedId??undefined}/>
    {mode==='learn'&&<div className="bio-lesson-layout"><aside className="bio-lesson-nav"><span className="bio-eyebrow">YOUR PATH / {level}</span><details className="bio-toc" ref={toc} open><summary>Understandings <span>{section.understandingIds[0]} · {index+1} of {sections.length}</span></summary><ol>{sections.map((s)=><li key={s.id}><button type="button" aria-current={s.id===section.id?'step':undefined} onClick={()=>chooseSection(s.id)}><UnderstandingLabel topic={topic} ids={s.understandingIds}/>{s.level==='HL'&&<small>HL</small>}</button></li>)}</ol></details><p>Read at your own pace. Activities are optional.</p><small>Answers stay in this tab across routes. Refresh starts a new session. No mastery or completion is recorded.</small></aside>
    <section className="bio-lesson-content" tabIndex={-1} data-understanding-id={section.understandingIds[0]} data-level={section.level}><span className="bio-eyebrow">{section.understandingIds[0]} · {section.level==='HL'?'ADDITIONAL HL':'SL + HL'} · UNDERSTANDING {index+1} OF {sections.length}</span><h2><UnderstandingLabel topic={topic} ids={section.understandingIds}/></h2><p className="bio-guiding-question">{section.guidingQuestion}</p>
      <ReadingUnderstanding lesson={lesson} section={section} study={study} update={update}/>
      <div className="bio-actions bio-related-study"><a href={`${base}/cheat-sheets?understanding=${section.understandingIds[0]}`}>Cheat sheet · {section.understandingIds[0]}</a><a href={`${base}/practice?understanding=${section.understandingIds[0]}`}>Practise {section.understandingIds[0]}</a></div><div className="bio-section-controls"><button type="button" disabled={index===0} onClick={()=>chooseSection(sections[index-1].id)}><ArrowLeft size={16} aria-hidden="true"/>Previous understanding</button><span>{index+1} / {sections.length}</span>{index<sections.length-1?<button type="button" onClick={()=>chooseSection(sections[index+1].id)}><span className="bio-next-label">Next: {topic.understandings.find(u=>u.id===sections[index+1].understandingIds[0])?.studentTitle??sections[index+1].understandingIds[0]}</span><ArrowRight size={16} aria-hidden="true"/></button>:<a className="bio-primary" href={`${base}/practice`}>Apply it in practice<ArrowRight size={16} aria-hidden="true"/></a>}</div>
    </section></div>}
    {mode==='practice'&&<TopicPractice key={hash+level} lesson={lesson} topic={topic} level={level} hash={hash} requestedId={requestedId} study={study} update={update} revisit={revisit}/>}
    {mode==='drawing'&&<DrawingPractice key={hash} lesson={lesson} sections={sections} level={level} study={study} update={update} requestedId={requestedId} requestedDiagram={new URLSearchParams(hash.split('?')[1]??'').get('diagram')}/>}
    {mode==='flashcards'&&<FlashcardStudy key={requestedId??'all'} lesson={lesson} topic={topic} sections={sections} requestedId={requestedId} study={study} update={update}/>}
  </article>;
}
