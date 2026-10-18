import {useState} from 'react';
import {ArrowRight, Atom, Dna, Network, RefreshCw, Search, X} from 'lucide-react';
import {findTopics, organizations, themes, visibleTopics} from '../curriculum/manifest';
import type {Level, ThemeId, Topic} from '../curriculum/schema';
import type {ResourceMode} from './ResourceNav';

const icons = {A:Dna,B:Atom,C:Network,D:RefreshCw};
const ids: ThemeId[] = ['A','B','C','D'];

function TopicTile({topic,resource,level}:{topic:Topic;resource:ResourceMode;level:Level}) {
  const destination=topic.lessonId&&resource!=='learn' ? '#biology/topic/'+topic.id+'/'+resource : '#biology/topic/'+topic.id;
  const action=!topic.lessonId?'View topic scope':resource==='learn'?'Open topic':resource==='practice'?'Open practice':resource==='revision'?'Open revision':resource==='flashcards'?'Open flashcards':resource==='drawing'?'Practise diagrams':'View sources';
  return <a className="bio-discovery-topic" href={destination} data-topic-id={topic.id}>
    <div className="bio-discovery-topic-top"><span className="bio-topic-code">{topic.id}</span>{topic.level==='HL'&&<span className="bio-hl-mark">HL ONLY</span>}</div>
    <h3>{topic.title}</h3>
    <p>{organizations[topic.organization-1]} <span aria-hidden="true">·</span> {topic.lessonId?'Lesson available':'Lesson planned'}</p>
    <span className="bio-discovery-topic-link">{action}<ArrowRight size={15} aria-hidden="true"/></span>
  </a>;
}

export default function CurriculumOverview({level,theme,resource='learn'}:{level:Level;theme?:ThemeId;resource?:ResourceMode}) {
  const [query,setQuery]=useState('');
  const list=findTopics(query,level,theme);
  const all=visibleTopics(level);
  const hasQuery=query.trim().length>0;
  return <section className="bio-course-library bio-discovery" id="bio-topic-browser" aria-labelledby="bio-discovery-heading">
    <div className="bio-discovery-heading"><div><span className="bio-eyebrow">{theme?'THEME '+theme:'YOUR COURSE LIBRARY'}</span><h2 id="bio-discovery-heading">{theme?'Explore the topics':'Find your next topic'}</h2><p>{theme?'Select a topic to explore its understandings and learning resources.':'Choose a theme, or search the full curriculum by name or official code.'}</p></div></div>
    <label className="bio-library-search bio-search-enhanced"><Search size={20} aria-hidden="true"/><span className="bio-sr-only">Search topics by syllabus code, name, theme or level of biological organization</span><input id="bio-topic-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={theme?'Search topics in this theme':'Search topics, e.g. A1.1 or photosynthesis'} autoComplete="off"/>{query?<button type="button" onClick={()=>setQuery('')} aria-label="Clear topic search"><X size={17} aria-hidden="true"/></button>:<kbd aria-hidden="true">⌘ K</kbd>}</label>
    <p className="bio-library-meta" role="status">{hasQuery?list.length+' matching '+(list.length===1?'topic':'topics')+' in '+level:theme?list.length+' topics in '+level+' scope':'Showing '+all.length+' topics in '+level+' scope across four themes'}</p>
    {!theme&&!hasQuery&&<div className="bio-discovery-themes" aria-label="Choose a biology theme">{ids.map(id=>{
      const Icon=icons[id];const count=all.filter(topic=>topic.theme===id).length;
      return <a key={id} className={'bio-discovery-theme bio-discovery-theme-'+id} href={'#biology/theme/'+id+(resource==='learn'?'':'?resource='+resource)}>
        <div className="bio-theme-top"><span className="bio-theme-monogram">{id}</span><Icon size={22} strokeWidth={1.7} aria-hidden="true"/></div>
        <h3>{themes[id].title}</h3><p>{themes[id].description}</p>
        <span className="bio-theme-footer"><span>{count} {count===1?'topic':'topics'} · {level}</span><span>Explore <ArrowRight size={16} aria-hidden="true"/></span></span>
      </a>;
    })}</div>}
    {(theme||hasQuery)&&<>{list.length?<div className="bio-results-group">{ids.filter(id=>list.some(topic=>topic.theme===id)).map(id=><section key={id} className="bio-topic-result-section" aria-label={'Theme '+id+': '+themes[id].title}>
      <div className="bio-result-section-head"><div><span className="bio-result-letter">{id}</span><h3>{themes[id].title}</h3></div>{!theme&&<a href={'#biology/theme/'+id+(resource==='learn'?'':'?resource='+resource)}>View theme <ArrowRight size={14} aria-hidden="true"/></a>}</div>
      <div className="bio-discovery-grid">{list.filter(topic=>topic.theme===id).map(topic=><TopicTile key={topic.id} topic={topic} resource={resource} level={level}/>)}</div>
    </section>)}</div>:<div className="bio-search-empty" role="status"><Search size={26} aria-hidden="true"/><h3>No matching topics</h3><p>Try a shorter keyword, syllabus code, or another course level.</p><button type="button" onClick={()=>setQuery('')}>Clear search</button></div>}</>}
    {!theme&&!hasQuery&&<p className="bio-discovery-hint">Looking for something specific? Search above to open a matching topic directly. HL-only topics appear when Higher Level is selected.</p>}
  </section>;
}
