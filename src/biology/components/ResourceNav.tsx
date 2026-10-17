export type ResourceMode='learn'|'practice'|'revision'|'flashcards'|'sources';
export const resources:{id:ResourceMode;label:string}[]=[{id:'learn',label:'Lessons'},{id:'practice',label:'Practice'},{id:'revision',label:'Revision'},{id:'flashcards',label:'Flashcards'},{id:'sources',label:'Sources'}];
export function resourceFromHash(hash:string):ResourceMode{const value=new URLSearchParams(hash.split('?')[1]??'').get('resource');return resources.some(r=>r.id===value)?value as ResourceMode:'learn'}
export default function ResourceNav({active,topicId,reading=false,understandingId}:{active:ResourceMode;topicId?:string;reading?:boolean;understandingId?:string}){
 return <nav className="bio-resource-nav bio-mode-nav" aria-label="Biology resources">{resources.map(r=><a key={r.id} href={topicId?(reading?`#biology/topic/${topicId}/${r.id}${understandingId?'?understanding='+understandingId:''}`:`#biology/topic/${topicId}${r.id==='learn'?'':'?resource='+r.id}`):`#biology${r.id==='learn'?'':'?resource='+r.id}`} aria-current={active===r.id?'page':undefined}>{r.label}</a>)}</nav>;
}
