import {useState} from 'react';
import {Search, ArrowRight} from 'lucide-react';
import {findTopics, organizations, themes} from '../curriculum/manifest';
import type {Level, ThemeId} from '../curriculum/schema';
import TopicCard from './TopicCard';
export default function CurriculumOverview({level, theme}: {level: Level; theme?: ThemeId}) {
  const [query, setQuery] = useState('');
  const list = findTopics(query, level, theme);
  return <section className="bio-curriculum" id="bio-curriculum" aria-labelledby="bio-curriculum-title">
    <div className="bio-section-head"><div><span className="bio-eyebrow">YOUR CURRICULUM MAP</span><h2 id="bio-curriculum-title">{theme ? themes[theme].title : 'Find your next topic'}</h2></div><p>Explore the scope now. Lessons are being developed.</p></div>
    <label className="bio-search"><Search size={20} aria-hidden="true"/><span className="bio-sr-only">Search curriculum by code, topic, theme or organization</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search water, A1.1, molecules…"/>{query && <button type="button" onClick={() => setQuery('')}>Clear</button>}</label>
    <p className="bio-result-count" role="status">{list.length} topics · {level === 'SL' ? 'Shared SL/HL content; 6 HL-only topics excluded' : 'Shared content and additional HL content'}</p>
    {list.length === 0 ? <div className="bio-empty"><h3>No topics match “{query}”</h3><p>Try an official code, a topic name, or a theme.</p><button onClick={() => setQuery('')}>Show all topics</button></div> :
    (Object.keys(themes) as ThemeId[]).filter(id => list.some(t => t.theme === id)).map(id => <section key={id} className={`bio-theme-group bio-theme-${id}`}>
      <div className="bio-group-heading"><div><span className="bio-theme-letter">{id}</span><h3>{themes[id].title}</h3></div>{!theme && <a href={`#biology/theme/${id}`}>Explore theme <ArrowRight size={16} aria-hidden="true"/></a>}</div>
      {organizations.map((name, i) => {const group=list.filter(t => t.theme === id && t.organization === i+1);return group.length > 0 && <div className="bio-organization" key={name}><h4>{String(i+1).padStart(2,'0')} / {name}</h4><div className="bio-topic-grid">{group.map(topic => <TopicCard key={topic.id} topic={topic} level={level}/>)}</div></div>;})}
    </section>)}
  </section>;
}
