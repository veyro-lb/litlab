import type {Topic} from '../curriculum/schema';
// Registry IDs are immutable; descriptive student titles live only in that registry.
export function understandingTitle(topic:Topic,id:string){return topic.understandings.find(u=>u.id===id)?.studentTitle??'Syllabus understanding'}
export default function UnderstandingLabel({topic,ids}:{topic:Topic;ids:string[]}) {
 return <span className="bio-understanding-label">{ids.map(id=><span key={id} data-syllabus-id={id}><b>{id}</b><span aria-hidden="true"> — </span><span>{understandingTitle(topic,id)}</span></span>)}</span>;
}
