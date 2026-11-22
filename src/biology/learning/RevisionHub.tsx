import {useState} from 'react';
import {ArrowRight, Bookmark, Search} from 'lucide-react';
import {findTopics, themes, visibleUnderstandings} from '../curriculum/manifest';
import type {Level, ThemeId} from '../curriculum/schema';
import {readRevisionRatings} from './revision-progress';

const themeIds = Object.keys(themes) as ThemeId[];

export default function RevisionHub({level, theme}: {level: Level; theme?: ThemeId}) {
  const [query, setQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | ''>(theme ?? '');
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [ratings] = useState(readRevisionRatings);
  const matches = findTopics(query, level, selectedTheme || undefined)
    .filter(topic => topic.lessonId)
    .map(topic => {
      const flagged = visibleUnderstandings(topic, level).filter(item => ratings[item.id] === 'again').length;
      return {topic, flagged};
    })
    .filter(({flagged}) => !onlyFlagged || flagged > 0);

  return <section className="bio-revision" aria-labelledby="bio-revision-title">
    <header className="bio-rev-header">
      <h1 id="bio-revision-title">Revision</h1>
      <p>Test what you remember, keep a list of what needs work, and skim key points before an exam.</p>
    </header>
    <div className="bio-rev-filters">
      <div className="bio-rev-field">
        <label htmlFor="bio-topic-search">Find a topic</label>
        <span className="bio-rev-search"><Search size={17} aria-hidden="true"/>
          <input id="bio-topic-search" type="search" value={query} placeholder="e.g. A1.1 or water" onChange={event => setQuery(event.target.value)}/>
        </span>
      </div>
      <div className="bio-rev-field">
        <label htmlFor="bio-revision-theme">Theme</label>
        <select id="bio-revision-theme" value={selectedTheme} onChange={event => setSelectedTheme(event.target.value as ThemeId | '')}>
          <option value="">All themes</option>
          {themeIds.map(id => <option key={id} value={id}>{id} · {themes[id].title}</option>)}
        </select>
      </div>
      <button type="button" className="bio-rev-filter" aria-pressed={onlyFlagged} onClick={() => setOnlyFlagged(value => !value)}>
        <Bookmark size={16} aria-hidden="true"/> Needs review
      </button>
    </div>
    <p className="bio-rev-results" role="status">{matches.length} {matches.length === 1 ? 'topic' : 'topics'} · {level}</p>
    {matches.length === 0 && <p className="bio-rev-empty">
      {onlyFlagged ? 'No flagged material matches your filters. Choose “Review again” on a recall card to save it here.' : 'No topics match your search. Try a topic name or syllabus code.'}
    </p>}
    <div className="bio-rev-library">
      {matches.map(({topic, flagged}) => {
        const href = `#biology/topic/${topic.id}/revision`;
        const recallHref = onlyFlagged ? `${href}?filter=review` : href;
        return <article className="bio-rev-tile" key={topic.id}>
          <div className="bio-rev-tile-meta"><span>{topic.id}{topic.level === 'HL' && ' · HL only'}</span>
            {flagged > 0 && <a href={`${href}?filter=review`} aria-label={`Review ${flagged} flagged in ${topic.title}`}><Bookmark size={14} aria-hidden="true"/> {flagged} to review</a>}
          </div>
          <h2><a href={recallHref}>{topic.title}</a></h2>
          <div className="bio-rev-tile-links">
            <a href={recallHref} aria-label={`Start recall for ${topic.title}`}>Start recall <ArrowRight size={15} aria-hidden="true"/></a>
            <a href={`${href}?view=sheet`} aria-label={`Cheat sheet for ${topic.title}`}>Cheat sheet</a>
          </div>
        </article>;
      })}
    </div>
  </section>;
}
