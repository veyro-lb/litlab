import {ArrowLeft, ArrowRight, BookOpen} from 'lucide-react';
import type {Level,Topic} from '../curriculum/schema';
import {organizations, themes, visibleUnderstandings} from '../curriculum/manifest';
import UnderstandingRows from './UnderstandingRows';
import ResourceNav,{resourceFromHash} from './ResourceNav';

export default function TopicOverview({topic,level,hash=''}:{topic:Topic;level:Level;hash?:string}) {
 const resource=resourceFromHash(hash),hlOnly=topic.level==='HL'&&level==='SL';
 const first=visibleUnderstandings(topic,level)[0];
 return <article className="bio-topic-overview">
  <a className="bio-back" href={'#biology/theme/'+topic.theme}><ArrowLeft size={16} aria-hidden="true"/>Theme {topic.theme} · {themes[topic.theme].title}</a>
  <header className="bio-topic-premium-head">
   <span className="bio-kicker">{topic.id} · {organizations[topic.organization-1]} · {topic.level==='HL'?'HL ONLY':'SL + HL'}</span>
   <h1>{topic.title}</h1>
   <p>{topic.lessonId?'Work through this topic one understanding at a time, then practise or review what you have learned.':'The syllabus scope is mapped, but this lesson is not yet available.'}</p>
   {topic.lessonId&&!hlOnly&&first&&<a className="bio-primary bio-topic-start" href={'#biology/topic/'+topic.id+'/learn?understanding='+first.id}><BookOpen size={17} aria-hidden="true"/> Start lesson <ArrowRight size={17} aria-hidden="true"/></a>}
  </header>
  {hlOnly?<section className="bio-empty"><h2>Higher Level topic</h2><p>Switch to HL above to see its learning content.</p></section>:<>
   {topic.lessonId&&<ResourceNav active={resource} topicId={topic.id}/>}
   <section className="bio-topic-understandings"><div className="bio-discovery-heading"><div><span className="bio-eyebrow">TOPIC CONTENT</span><h2>{topic.lessonId?'Choose an understanding':'Topic availability'}</h2><p>{topic.lessonId?'Each part follows a numbered syllabus understanding.':'This topic will open when its lesson is ready.'}</p></div></div><UnderstandingRows topic={topic} level={level} resource={resource}/></section>
   {topic.lessonId&&<p className="bio-draft-note">Teaching draft · scientific review pending. <a href={'#biology/topic/'+topic.id+'/sources'}>Sources and review <ArrowRight size={12} aria-hidden="true"/></a></p>}
  </>}
 </article>;
}
