import type {Level,Topic} from '../curriculum/schema';
import {visibleUnderstandings} from '../curriculum/manifest';
import type {ResourceMode} from './ResourceNav';
export default function UnderstandingRows({topic,level,resource='learn'}:{topic:Topic;level:Level;resource?:ResourceMode}){
 const list=visibleUnderstandings(topic,level),hidden=topic.understandings.length-list.length;
 if(!topic.lessonId)return <div className="bio-planned-topic"><strong>Teaching planned</strong><p>{topic.id==='A2.2'?'Cell structure is withheld while required microscopy material and its review remain incomplete.':'This topic is mapped in the curriculum. A teaching lesson is not available yet.'}</p><small>{list.length} syllabus understandings in your {level} scope · no lesson links</small></div>;
 return <><ol className="bio-understanding-rows">{list.map(u=><li key={u.id} data-syllabus-id={u.id}><a href={`#biology/topic/${topic.id}/${resource}?understanding=${u.id}`}><b>{u.id}</b><span>{u.studentTitle}</span><small>{u.level==='HL'?'HL':'SL + HL'}</small><span aria-hidden="true">↗</span></a></li>)}</ol>{hidden>0&&<p className="bio-scope-note">{hidden} additional HL understandings are hidden in SL. Choose HL above to see all {topic.understandings.length}.</p>}</>;
}
