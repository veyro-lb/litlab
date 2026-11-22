import type {ThemeId} from '../curriculum/schema';
import {BookOpen, ClipboardList, Layers3, FileText, Library, PencilLine} from 'lucide-react';
import type {LessonMode} from '../routes';
export type ResourceMode = LessonMode | 'sources';
export const resources:{id:ResourceMode;label:string}[]=[{id:'learn',label:'Lessons'},{id:'practice',label:'Practice'},{id:'cheat-sheets',label:'Cheat Sheets'},{id:'flashcards',label:'Flashcards'},{id:'drawing',label:'Diagrams'},{id:'sources',label:'Sources'}];
const icons={learn:BookOpen,practice:ClipboardList,'cheat-sheets':FileText,flashcards:Layers3,sources:Library,drawing:PencilLine};
export function resourceFromHash(hash:string):LessonMode {
  const value = new URLSearchParams(hash.split('?')[1]).get('resource');
  if (value === 'revision') return 'cheat-sheets';
  const mode = resources.find(resource => resource.id === value)?.id;
  return mode && mode !== 'sources' ? mode : 'learn';
}
export default function ResourceNav({active,topicId,theme,understandingId}:{active:ResourceMode;topicId?:string;theme?:ThemeId;understandingId?:string}){
 return <nav className="bio-resource-nav bio-mode-nav" aria-label="Biology study modes">{resources.map(r=>{
  const Icon=icons[r.id];
  const targetUnderstanding = r.id === 'drawing' ? undefined : understandingId;
  const href = r.id === 'sources' ? '#biology/sources'
    : topicId ? `#biology/topic/${topicId}/${r.id}${targetUnderstanding ? '?understanding='+targetUnderstanding : ''}`
    : `${theme ? '#biology/theme/'+theme : '#biology'}${r.id === 'learn' ? '' : '?resource='+r.id}`;
  return <a key={r.id} data-resource={r.id} href={href} aria-current={active===r.id?'page':undefined}><Icon size={16} aria-hidden="true"/><span>{r.label}</span></a>;
 })}</nav>;
}
