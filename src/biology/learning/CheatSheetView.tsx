import {useEffect, useRef} from 'react';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import {themes} from '../curriculum/manifest';
import type {Level, Topic} from '../curriculum/schema';
import ResourceNav from '../components/ResourceNav';
import type {Section} from './content';
import {understandingTitle} from './UnderstandingLabel';
import {cheatSheetComparisons} from './cheat-sheet-comparisons';
import {cheatSheets} from './cheat-sheet-content';

export default function CheatSheetView({title, topic, sections, level, requestedId}: {
  title: string;
  topic: Topic;
  sections: Section[];
  level: Level;
  requestedId: string | null;
}) {
  const base = `#biology/topic/${topic.id}`;
  const sheet = cheatSheets[topic.id];
  const targeted = useRef<HTMLDetailsElement>(null);
  const shared = sections.filter(section => section.level === 'shared');
  const higher = sections.filter(section => section.level === 'HL');
  const comparisons = sections.flatMap(section => (section.visuals ?? []).flatMap(visual =>
    visual.kind === 'comparison' && cheatSheetComparisons.has(visual.title) ? [visual] : []
  ));
  const groups = [
    {label: topic.level === 'HL' ? 'HL syllabus points' : 'SL & HL syllabus points', sections: shared},
    {label: topic.level === 'HL' ? 'HL syllabus points' : 'Additional HL syllabus points', sections: higher},
  ].filter(group => group.sections.length > 0);

  useEffect(() => {
    if (!requestedId) return;
    const frame = requestAnimationFrame(() => targeted.current?.scrollIntoView({block: 'start'}));
    return () => cancelAnimationFrame(frame);
  }, [requestedId]);

  return <article className="bio-sheets" data-mode="cheat-sheets">
    <ResourceNav active="cheat-sheets" topicId={topic.id} understandingId={requestedId ?? undefined}/>
    <a className="bio-sheets-back" href="#biology?resource=cheat-sheets"><ArrowLeft size={16} aria-hidden="true"/> All cheat sheets</a>
    <header className="bio-sheets-header">
      <p className="bio-sheets-code">{topic.id} · {themes[topic.theme].title} · {level}</p>
      <h1>{title}</h1>
    </header>
    {sheet && <>
      <section aria-labelledby="bio-sheets-essentials" className="bio-sheets-section">
        <h2 id="bio-sheets-essentials">At a glance</h2>
        <dl className="bio-sheets-essentials">{sheet.essentials.map(([label, value]) => <div key={label}>
          <dt>{label}</dt><dd>{value}</dd>
        </div>)}</dl>
        {level === 'HL' && sheet.hl && <dl className="bio-sheets-extension">
          <dt>HL · {sheet.hl[0]}</dt><dd>{sheet.hl[1]}</dd>
        </dl>}
      </section>
      <div className="bio-sheets-checks">
        {sheet.formula && <section><h2>{sheet.formula[0]}</h2><p>{sheet.formula[1]}</p></section>}
        <section><h2>Exam tip</h2><p>{sheet.exam}</p></section>
      </div>
    </>}
    {comparisons.length > 0 && <section aria-labelledby="bio-sheets-compare" className="bio-sheets-section">
      <h2 id="bio-sheets-compare">Compare</h2>
      <div className="bio-sheets-comparisons">
        {comparisons.map(visual => <details key={visual.title}>
          <summary>{visual.title}</summary>
          <div className="bio-sheets-table">
            <table aria-label={visual.title}>
              <thead><tr>{visual.headers.map((header, index) => <th key={index} scope="col">{header}</th>)}</tr></thead>
              <tbody>{visual.rows.map((row, index) => <tr key={index}>{row.map((cell, column) =>
                column === 0 ? <th key={column} scope="row">{cell}</th> : <td key={column}>{cell}</td>
              )}</tr>)}</tbody>
            </table>
          </div>
          <div className="bio-sheets-table-mobile">
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
    <section aria-labelledby="bio-sheets-checklist" className="bio-sheets-section">
      <h2 id="bio-sheets-checklist">Syllabus checklist</h2>
      {groups.map(group => <div className="bio-sheets-group" key={group.label}>
        <h3>{group.label}</h3>
        {group.sections.map(section => {
          const id = section.understandingIds[0];
          const highlighted = section.understandingIds.includes(requestedId ?? '');
          return <details className="bio-sheets-point" key={section.id} data-understanding-id={id}
            open={highlighted || undefined} ref={highlighted ? targeted : undefined}>
            <summary><span>{id}</span> {understandingTitle(topic, id)}</summary>
            <div className="bio-sheets-point-body">
              <p>{section.revisionSummary}</p>
              {section.misconceptions.map(({correction}, index) => <p key={index}><strong>Watch for</strong> {correction}</p>)}
              <a href={`${base}/learn?understanding=${id}`}>Full explanation <ArrowRight size={14} aria-hidden="true"/></a>
            </div>
          </details>;
        })}
      </div>)}
    </section>
  </article>;
}
