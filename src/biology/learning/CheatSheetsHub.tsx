import {useState} from 'react';
import {ArrowRight, Search} from 'lucide-react';
import {findTopics, themes} from '../curriculum/manifest';
import type {Level, ThemeId} from '../curriculum/schema';

const themeIds = Object.keys(themes) as ThemeId[];

export default function CheatSheetsHub({level, theme}: {level: Level; theme?: ThemeId}) {
  const [query, setQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | ''>(theme ?? '');
  const matches = findTopics(query, level, selectedTheme || undefined).filter(topic => topic.lessonId);

  return <section className="bio-sheets" aria-labelledby="bio-sheets-title">
    <header className="bio-sheets-header">
      <h1 id="bio-sheets-title">Cheat Sheets</h1>
      <p>Key concepts, formulas and exam tips for each IB Biology topic.</p>
    </header>
    <div className="bio-sheets-filters">
      <div className="bio-sheets-field">
        <label htmlFor="bio-topic-search">Find a topic</label>
        <span className="bio-sheets-search"><Search size={17} aria-hidden="true"/>
          <input id="bio-topic-search" type="search" value={query} placeholder="e.g. A1.1 or water" onChange={event => setQuery(event.target.value)}/>
        </span>
      </div>
      <div className="bio-sheets-field">
        <label htmlFor="bio-sheets-theme">Theme</label>
        <select id="bio-sheets-theme" value={selectedTheme} onChange={event => setSelectedTheme(event.target.value as ThemeId | '')}>
          <option value="">All themes</option>
          {themeIds.map(id => <option key={id} value={id}>{id} · {themes[id].title}</option>)}
        </select>
      </div>
    </div>
    <p className="bio-sheets-results" role="status">{matches.length} {matches.length === 1 ? 'cheat sheet' : 'cheat sheets'} · {level}</p>
    {matches.length === 0 && <p>Try a topic name, syllabus code or different theme.</p>}
    <div className="bio-sheets-library">
      {matches.map(topic => <a className="bio-sheets-tile" key={topic.id} href={`#biology/topic/${topic.id}/cheat-sheets`}>
        <span>{topic.id}{topic.level === 'HL' && ' · HL only'}</span>
        <strong>{topic.title}</strong>
        <ArrowRight size={18} aria-hidden="true"/>
      </a>)}
    </div>
  </section>;
}
