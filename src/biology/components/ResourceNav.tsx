import type {ThemeId} from '../curriculum/schema';
import {BookOpen, ClipboardList, Layers3, RotateCcw, Library, PencilLine} from 'lucide-react';
export type ResourceMode='learn'|'practice'|'revision'|'flashcards'|'sources'|'drawing';
export const resources:{id:ResourceMode;label:string}[]=[{id:'learn',label:'Lessons'},{id:'practice',label:'Practice'},{id:'revision',label:'Revision'},{id:'flashcards',label:'Flashcards'},{id:'drawing',label:'Diagrams'},{id:'sources',label:'Sources'}];
const icons={learn:BookOpen,practice:ClipboardList,revision:RotateCcw,flashcards:Layers3,sources:Library,drawing:PencilLine};
export function resourceFromHash(hash:string):ResourceMode{const value=new URLSearchParams(hash.split('?')[1]??'').get('resource');return resources.some(r=>r.id===value)?value as ResourceMode:'learn'}
export default function ResourceNav({active,topicId,theme,understandingId}:{active:ResourceMode;topicId?:string;theme?:ThemeId;understandingId?:string}){
 return <nav className="bio-resource-nav bio-mode-nav" aria-label="Biology study modes">{resources.map(r=>{
  const Icon=icons[r.id];
  const targetUnderstanding = r.id === 'drawing' || r.id === 'sources' ? undefined : understandingId;
  const href = topicId
    ? `#biology/topic/${topicId}/${r.id}${targetUnderstanding ? '?understanding='+targetUnderstanding : ''}`
    : `${theme ? '#biology/theme/'+theme : '#biology'}${r.id === 'learn' ? '' : '?resource='+r.id}`;
  return <a key={r.id} href={href} aria-current={active===r.id?'page':undefined}><Icon size={16} aria-hidden="true"/><span>{r.label}</span></a>;
 })}</nav>;
}
