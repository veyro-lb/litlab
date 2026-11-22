import {useRef, useState} from 'react';
import {ArrowRight, Search, X} from 'lucide-react';
import type {Level, ThemeId} from '../../curriculum/schema';
import {themes} from '../../curriculum/manifest';
import {drawingRequirements, requirementLabel} from './requirements.mjs';
import type {DrawingRequirement} from './requirements.mjs';

const themeIds: ThemeId[] = ['A', 'B', 'C', 'D'];
const kinds: DrawingRequirement['kind'][] = ['required', 'skill', 'practice'];

export default function DrawingCatalogue({level, theme}: {level: Level; theme?: ThemeId}) {
  const [query, setQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | ''>('');
  const [kind, setKind] = useState<DrawingRequirement['kind'] | ''>('');
  const search = useRef<HTMLInputElement>(null);
  const activeTheme = theme ?? selectedTheme;
  const keyword = query.trim().toLowerCase();
  const list = drawingRequirements.filter(diagram =>
    (level === 'HL' || diagram.level !== 'HL') &&
    (!activeTheme || diagram.topicId.startsWith(activeTheme)) &&
    (!kind || diagram.kind === kind) &&
    `${diagram.title} ${diagram.understandingId}`.toLowerCase().includes(keyword)
  );
  const resetFilters = () => {
    setQuery('');
    setSelectedTheme('');
    setKind('');
    search.current?.focus();
  };

  return <section className="bio-drawing bio-drawing-catalogue" id="bio-topic-browser" aria-labelledby="bio-diagram-heading">
    <header className="bio-drawing-intro">
      <h2 id="bio-diagram-heading">Diagram practice</h2>
      <p>Find what you need to draw, then use a reference and checklist to practise on paper.</p>
      {theme && <a href="#biology?resource=drawing">Browse diagrams from all themes <ArrowRight size={16} aria-hidden="true"/></a>}
    </header>
    <div className="bio-diagram-filters">
      <div>
        <label htmlFor="bio-topic-search">Find a diagram by name or syllabus code</label>
        <div className="bio-library-search bio-search-enhanced">
          <Search size={20} aria-hidden="true"/>
          <input ref={search} id="bio-topic-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try membrane or C4.2" autoComplete="off"/>
          {query && <button type="button" onClick={() => {setQuery('');search.current?.focus()}} aria-label="Clear diagram search"><X size={17} aria-hidden="true"/></button>}
        </div>
      </div>
      {!theme && <div>
        <label htmlFor="bio-diagram-theme">Theme</label>
        <select id="bio-diagram-theme" value={selectedTheme} onChange={event => setSelectedTheme(event.target.value as ThemeId | '')}>
          <option value="">All themes</option>
          {themeIds.map(id => <option key={id} value={id}>{id} · {themes[id].title}</option>)}
        </select>
      </div>}
      <div>
        <label htmlFor="bio-diagram-kind">Activity type</label>
        <select id="bio-diagram-kind" value={kind} onChange={event => setKind(event.target.value as DrawingRequirement['kind'] | '')}>
          <option value="">All activities</option>
          {kinds.map(value => <option key={value} value={value}>{requirementLabel(value)}</option>)}
        </select>
      </div>
    </div>
    <div className="bio-diagram-results">
      <p role="status">{list.length} {list.length === 1 ? 'activity' : 'activities'} · {level}</p>
      {(keyword || selectedTheme || kind) && <button type="button" className="bio-btn-quiet" onClick={resetFilters}>Clear filters</button>}
    </div>
    {list.length === 0 ? <div className="bio-search-empty"><h3>No matching diagrams</h3><p>Try a shorter search or change the filters.</p></div> :
      themeIds.map(id => {
        const diagrams = list.filter(diagram => diagram.topicId.startsWith(id));
        if (diagrams.length === 0) return null;
        return <section className="bio-diagram-theme" key={id}>
          <h3>Theme {id} · {themes[id].title}</h3>
          <div className="bio-diagram-grid">{diagrams.map(diagram => <a className="bio-diagram-card" key={diagram.id} href={`#biology/topic/${diagram.topicId}/drawing?diagram=${diagram.id}`}>
            <div>
              <small data-kind={diagram.kind}>{requirementLabel(diagram.kind)}</small>
              <h4>{diagram.title}</h4>
              <p>{diagram.understandingId} · {diagram.level === 'HL' ? 'HL only' : 'SL & HL'}</p>
            </div>
            <ArrowRight size={18} aria-hidden="true"/>
          </a>)}</div>
        </section>;
      })}
    <details className="bio-diagram-guide">
      <summary>What do the activity types mean?</summary>
      <dl>
        <dt>IB drawing requirement</dt><dd>The guide asks you to draw, sketch or construct something.</dd>
        <dt>IB diagram skill</dt><dd>The guide specifies a skill such as using a chart or grid.</dd>
        <dt>Useful practice</dt><dd>Suggested drawing to help you understand the topic.</dd>
      </dl>
    </details>
  </section>;
}
