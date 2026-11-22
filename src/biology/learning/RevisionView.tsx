import {useLayoutEffect, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, Bookmark, Check, Eye} from 'lucide-react';
import {themes} from '../curriculum/manifest';
import type {Level, Topic} from '../curriculum/schema';
import ResourceNav from '../components/ResourceNav';
import type {Section} from './content';
import {understandingTitle} from './UnderstandingLabel';
import {revisionComparisons} from './revision-comparisons';
import {readRevisionRatings, saveRevisionRating} from './revision-progress';

type RevisionProps = {
  title: string;
  topic: Topic;
  sections: Section[];
  level: Level;
  hash: string;
  requestedId: string | null;
};

export default function RevisionView({title, topic, sections, level, hash, requestedId}: RevisionProps) {
  const base = `#biology/topic/${topic.id}`;
  const params = new URLSearchParams(hash.split('?')[1]);
  const sheet = params.get('view') === 'sheet';
  const [ratings, setRatings] = useState(readRevisionRatings);
  const [onlyFlagged, setOnlyFlagged] = useState(params.get('filter') === 'review');
  const [selected, setSelected] = useState(() => sections.find(section => section.understandingIds.includes(requestedId ?? ''))?.id);
  const [shown, setShown] = useState(false);
  const prompt = useRef<HTMLHeadingElement>(null);
  const filter = useRef<HTMLButtonElement>(null);
  const focusNextPrompt = useRef(false);

  const flagged = sections.filter(section => ratings[section.understandingIds[0]] === 'again');
  const known = sections.filter(section => ratings[section.understandingIds[0]] === 'known').length;
  const queue = onlyFlagged ? flagged : sections;
  const section = queue.find(item => item.id === selected) ?? queue[0];
  const index = queue.indexOf(section);
  const id = section?.understandingIds[0];
  const currentId = id ?? requestedId ?? undefined;
  const recall = section?.recall.filter(item => !item.enrichment) ?? [];
  const multiplePrompts = recall.length > 1;
  const suffix = currentId ? `?understanding=${currentId}` : '';

  useLayoutEffect(() => {
    if (!focusNextPrompt.current) return;
    focusNextPrompt.current = false;
    prompt.current?.focus({preventScroll: true});
    prompt.current?.scrollIntoView({block: 'nearest'});
  }, [id]);

  function choose(next: Section) {
    focusNextPrompt.current = true;
    setSelected(next.id);
    setShown(false);
  }

  return <article className="bio-revision" data-mode="revision">
    <ResourceNav active="revision" topicId={topic.id} understandingId={sheet ? requestedId ?? undefined : currentId}/>
    <a className="bio-rev-back" href="#biology?resource=revision"><ArrowLeft size={16} aria-hidden="true"/> All revision topics</a>
    <header className="bio-rev-header">
      <p className="bio-rev-topic-code">{topic.id} · {themes[topic.theme].title} · {level}</p>
      <h1>{title}</h1>
    </header>
    <nav className="bio-rev-switch" aria-label="Revision format">
      <a href={`${base}/revision${suffix}`} aria-current={!sheet ? 'page' : undefined}>Active recall</a>
      <a href={`${base}/revision?view=sheet${currentId ? '&understanding='+currentId : ''}`} aria-current={sheet ? 'page' : undefined}>Cheat sheet</a>
    </nav>
    {sheet ? <CheatSheet sections={sections} topic={topic} base={base}/> : <>
      <div className="bio-rev-toolbar">
        <div className="bio-rev-field">
          <label htmlFor="bio-revision-understanding">Jump to a syllabus point</label>
          <select id="bio-revision-understanding" value={section?.id ?? ''} disabled={!section} onChange={event => {
            const next = queue.find(item => item.id === event.target.value);
            if (next) {
              setSelected(next.id);
              setShown(false);
            }
          }}>
            {!section && <option>No points to review</option>}
            {queue.map(item => <option key={item.id} value={item.id}>{item.understandingIds[0]} · {understandingTitle(topic, item.understandingIds[0])}</option>)}
          </select>
        </div>
        <button type="button" className="bio-rev-filter" ref={filter} aria-pressed={onlyFlagged} onClick={() => {
          setOnlyFlagged(value => !value);
          setShown(false);
        }}><Bookmark size={16} aria-hidden="true"/> Needs review ({flagged.length})</button>
      </div>
      <p className="bio-rev-results" role="status">{known} of {sections.length} marked “Got it” · {flagged.length} to review</p>
      {section && id ? <>
        <section className="bio-rev-card" aria-labelledby="bio-rev-prompt">
          <div className="bio-rev-card-meta">
            <span>{id}{section.level === 'HL' && ' · HL'}</span>
            <span>{index + 1} / {queue.length}</span>
          </div>
          {!multiplePrompts && <p className="bio-rev-concept">{understandingTitle(topic, id)}</p>}
          <h2 id="bio-rev-prompt" ref={prompt} tabIndex={-1}>
            {multiplePrompts ? understandingTitle(topic, id) : recall[0]?.prompt ?? section.guidingQuestion}
          </h2>
          {multiplePrompts && <ol className="bio-rev-prompts">{recall.map(item => <li key={item.id}>{item.prompt}</li>)}</ol>}
          <p className="bio-rev-instruction">Say or write your {multiplePrompts ? 'answers before revealing them' : 'answer before revealing it'}.</p>
          <button type="button" className="bio-primary bio-rev-reveal" aria-expanded={shown} aria-controls="bio-rev-answer" onClick={() => setShown(value => !value)}>
            <Eye size={17} aria-hidden="true"/> {shown ? 'Hide' : 'Show'} {multiplePrompts ? 'answers' : 'answer'}
          </button>
          <div id="bio-rev-answer" className="bio-rev-answer" hidden={!shown}>
            {multiplePrompts
              ? <ol>{recall.map(item => <li key={item.id}>{item.answer}</li>)}</ol>
              : <p>{recall[0]?.answer ?? section.revisionSummary}</p>}
            <div className="bio-rev-ratings" role="group" aria-label="How well did you remember?">
              <button type="button" aria-pressed={ratings[id] === 'again'} onClick={() => setRatings(saveRevisionRating(id, 'again'))}>
                <Bookmark size={16} aria-hidden="true"/> Review again
              </button>
              <button type="button" aria-pressed={ratings[id] === 'known'} onClick={() => {
                setRatings(saveRevisionRating(id, 'known'));
                if (onlyFlagged) {
                  const next = queue[index + 1] ?? queue[index - 1];
                  if (next) choose(next);
                  else {
                    setShown(false);
                    filter.current?.focus();
                  }
                }
              }}><Check size={16} aria-hidden="true"/> Got it</button>
            </div>
          </div>
        </section>
        <div className="bio-rev-pager">
          <button type="button" disabled={index === 0} onClick={() => choose(queue[index - 1])}><ArrowLeft size={16} aria-hidden="true"/> Previous</button>
          <button type="button" disabled={index === queue.length - 1} onClick={() => choose(queue[index + 1])}>Next <ArrowRight size={16} aria-hidden="true"/></button>
        </div>
        <div className="bio-rev-related">
          <a href={`${base}/learn?understanding=${id}`}>Read the explanation</a>
          <a href={`${base}/practice?understanding=${id}`}>Try exam-style questions</a>
        </div>
      </> : <p className="bio-rev-empty">Nothing flagged in this topic. Select “Needs review” again to see all prompts.</p>}
    </>}
  </article>;
}

function CheatSheet({sections, topic, base}: {sections: Section[]; topic: Topic; base: string}) {
  const comparisons = sections.flatMap(section => (section.visuals ?? []).flatMap(visual =>
    visual.kind === 'comparison' && revisionComparisons.has(visual.title) ? [visual] : []
  ));

  return <div className="bio-rev-sheet">
    {comparisons.length > 0 && <section aria-labelledby="bio-rev-comparisons">
      <h2 id="bio-rev-comparisons">Key comparisons</h2>
      <div className="bio-rev-comparisons">
        {comparisons.map(visual => <details key={visual.title}>
          <summary>{visual.title}</summary>
          <div className="bio-rev-table">
            <table aria-label={visual.title}>
              <thead><tr>{visual.headers.map((header, index) => <th key={index} scope="col">{header}</th>)}</tr></thead>
              <tbody>{visual.rows.map((row, index) => <tr key={index}>{row.map((cell, column) =>
                column === 0 ? <th key={column} scope="row">{cell}</th> : <td key={column}>{cell}</td>
              )}</tr>)}</tbody>
            </table>
          </div>
          <div className="bio-rev-table-mobile">
            {visual.rows.map((row, index) => <div key={index}>
              <h3>{row[0]}</h3>
              <dl>{row.slice(1).map((cell, column) => <div key={column}>
                <dt>{visual.headers[column + 1]}</dt><dd>{cell}</dd>
              </div>)}</dl>
            </div>)}
          </div>
          {visual.note && <p>{visual.note}</p>}
        </details>)}
      </div>
    </section>}
    <section aria-labelledby="bio-rev-key-points">
      <h2 id="bio-rev-key-points">Key points</h2>
      <div className="bio-rev-notes">
        {sections.map(section => {
          const id = section.understandingIds[0];
          return <article className="bio-rev-note" key={section.id}>
            <p className="bio-rev-note-code">{id}{section.level === 'HL' && ' · HL'}</p>
            <h3>{understandingTitle(topic, id)}</h3>
            <p>{section.revisionSummary}</p>
            {section.misconceptions.length > 0 && <details>
              <summary>Common {section.misconceptions.length === 1 ? 'mistake' : 'mistakes'}</summary>
              <dl>{section.misconceptions.map((item, index) => <div key={index}><dt>{item.misconception}</dt><dd>{item.correction}</dd></div>)}</dl>
            </details>}
            <a href={`${base}/revision?understanding=${id}`} aria-label={`Recall ${id} · ${understandingTitle(topic, id)}`}>Test yourself <ArrowRight size={14} aria-hidden="true"/></a>
          </article>;
        })}
      </div>
    </section>
  </div>;
}
