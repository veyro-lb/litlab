import {ArrowLeft} from 'lucide-react';
import type {Level,Topic} from '../curriculum/schema';
import {themes} from '../curriculum/manifest';
import UnderstandingRows from './UnderstandingRows';
import ResourceNav,{resourceFromHash} from './ResourceNav';
export default function TopicOverview({topic,level,hash=''}:{topic:Topic;level:Level;hash?:string}){
 const resource=resourceFromHash(hash),hlOnly=topic.level==='HL'&&level==='SL';
 return <article className="bio-topic-overview"><a className="bio-back" href="#biology"><ArrowLeft size={16} aria-hidden="true"/>Course library</a><header className="bio-course-header"><span className="bio-eyebrow">{themes[topic.theme].title} · {topic.level==='HL'?'HL only':'SL + HL'}</span><h1>{topic.id} {topic.title}</h1><p>{topic.lessonId?'Choose an understanding to begin reading.':'This topic is planned.'}</p></header>
 {hlOnly?<section className="bio-empty"><h2>This topic is HL only</h2><p>Select HL above to include it in your scope.</p></section>:<>{topic.lessonId&&<ResourceNav active={resource} topicId={topic.id}/>}<section className="bio-topic-understandings"><h2>{topic.lessonId?'Choose an understanding':'Availability'}</h2><UnderstandingRows topic={topic} level={level} resource={resource}/></section>{topic.lessonId&&<p className="bio-draft-note">Teaching draft · scientific review pending. <a href={`#biology/topic/${topic.id}/sources`}>Sources and review</a></p>}</>}
 </article>;
}
