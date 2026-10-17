import {useState} from 'react';
import {Search} from 'lucide-react';
import {findTopics,themes} from '../curriculum/manifest';
import type {Level,ThemeId} from '../curriculum/schema';
import UnderstandingRows from './UnderstandingRows';
import type {ResourceMode} from './ResourceNav';
export default function CurriculumOverview({level,theme,resource='learn'}:{level:Level;theme?:ThemeId;resource?:ResourceMode}){
 const [query,setQuery]=useState('');const list=findTopics(query,level,theme);
 return <section className="bio-course-library" aria-label="Biology course library">
 <label className="bio-library-search"><Search size={18} aria-hidden="true"/><span className="bio-sr-only">Search curriculum by code, topic, theme or organization</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a topic or code"/>{query&&<button type="button" onClick={()=>setQuery('')}>Clear</button>}</label>
 <p className="bio-library-meta" role="status">{list.length} topics in your {level} curriculum · Expand a topic to choose an understanding.</p>
 {list.length===0?<p>No topics match “{query}”. Try a topic name or official code.</p>:(Object.keys(themes) as ThemeId[]).filter(id=>list.some(t=>t.theme===id)).map(id=><details className={'bio-library-theme bio-library-theme-'+id} key={id} open={query.length>0||id==='A'||!!theme}>
 <summary><span className="bio-library-letter">{id}</span><h2>{themes[id].title}</h2><span className="bio-library-count">{list.filter(t=>t.theme===id).length} topics</span></summary>
 <div className="bio-library-topics">{list.filter(t=>t.theme===id).map(t=><details className="bio-library-topic" key={t.id} data-topic-id={t.id} open={query.length>0}>
 <summary><b>{t.id}</b><span>{t.title}{t.level==='HL'&&<em>HL only</em>}</span><small>{t.lessonId?'Draft available':'Planned'}</small></summary>
 <div className="bio-library-topic-content"><UnderstandingRows topic={t} level={level} resource={resource}/>{t.lessonId&&<a className="bio-topic-resource-link" href={`#biology/topic/${t.id}${resource==='learn'?'':'?resource='+resource}`}>Open {t.id} resource overview →</a>}</div>
 </details>)}</div>
 </details>)}
 </section>;
}
