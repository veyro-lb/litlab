import {useEffect, useRef} from 'react';
import {ArrowLeft, ArrowRight, Lightbulb} from 'lucide-react';
import {themes} from '../curriculum/manifest';
import type {Level, Topic} from '../curriculum/schema';
import ResourceNav from '../components/ResourceNav';
import type {Lesson, Section} from './content';
import ScientificFigure from './ScientificFigure';
import {sheetChecks, sheetIllustrations} from './cheat-sheet-extras';
import {understandingTitle} from './UnderstandingLabel';
import {cheatSheetComparisons} from './cheat-sheet-comparisons';
import {cheatSheets} from './cheat-sheet-content';

export default function CheatSheetView({lesson, topic, sections, level, requestedId}: {
  lesson: Lesson;
  topic: Topic;
  sections: Section[];
  level: Level;
  requestedId: string | null;
}) {
  const base = `#biology/topic/${topic.id}`;
  const sheet = cheatSheets[topic.id];
  const check = sheetChecks[topic.id];
  const targeted = useRef<HTMLElement>(null);
  const shared = sections.filter(section => section.level === 'shared');
  const higher = sections.filter(section => section.level === 'HL');
  const comparisons = sections.flatMap(section => (section.visuals ?? []).flatMap(visual =>
    visual.kind === 'comparison' && cheatSheetComparisons.has(visual.title) ? [visual] : []
  ));
  const groups = [
    {label: 'Core concepts', sections: shared, higher: false},
    {label: topic.level === 'HL' ? 'HL concepts' : 'Additional HL', sections: higher, higher: true},
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
      <h1>{lesson.title}</h1>
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
        <section className="bio-sheets-exam-tip"><h2><Lightbulb size={17} aria-hidden="true"/> Exam tip</h2><p>{sheet.exam}</p></section>
      </div>
    </>}
    {comparisons.length > 0 && <section aria-labelledby="bio-sheets-compare" className="bio-sheets-section">
      <h2 id="bio-sheets-compare">Compare</h2>
      <div className="bio-sheets-comparisons">
        {comparisons.map(visual => <section className="bio-sheets-comparison" key={visual.title}>
          <h3>{visual.title}</h3>
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
              <h4>{row[0]}</h4>
              <dl>{row.slice(1).map((cell, column) => <div key={column}>
                <dt>{visual.headers[column + 1]}</dt><dd>{cell}</dd>
              </div>)}</dl>
            </div>)}
          </div>
          {visual.note && <p>{visual.note}</p>}
        </section>)}
      </div>
    </section>}
    {groups.map(group => <section className="bio-sheets-group bio-sheets-section" key={group.label}
      aria-label={group.label} data-higher={group.higher}>
      <h2>{group.label}</h2>
      <div className="bio-sheets-panels">
        {group.sections.map(section => {
          const id = section.understandingIds[0];
          const highlighted = section.understandingIds.includes(requestedId ?? '');
          const figure = lesson.assets.find(asset => section.assets.includes(asset.id) && sheetIllustrations.has(asset.id)
            && asset.publicReproductionRights === 'cleared' && !asset.withheldReason);
          const mistake = section.misconceptions[0];
          return <section className="bio-sheets-point" key={section.id} data-understanding-id={id}
            data-highlighted={highlighted || undefined} ref={highlighted ? targeted : undefined}>
            <h3><span>{id}</span> {understandingTitle(topic, id)}</h3>
            <div className="bio-sheets-point-body">
              <p>{section.revisionSummary}</p>
              {figure && <ScientificFigure asset={figure} references={lesson.references}/>}
              {mistake && <div className="bio-sheets-note">
                <p><strong>Common mistake</strong> {mistake.misconception}</p>
                <p><strong>Correction</strong> {mistake.correction}</p>
              </div>}
              <a className="bio-sheets-explain" href={`${base}/learn?understanding=${id}`}>Full explanation <ArrowRight size={14} aria-hidden="true"/></a>
            </div>
          </section>;
        })}
      </div>
    </section>)}
    {check && <section className="bio-sheets-self-check" aria-labelledby="bio-sheets-self-check">
      <h2 id="bio-sheets-self-check">Worked question</h2>
      <p className="bio-sheets-question">{check[0]}</p>
      <p className="bio-sheets-answer"><strong>Answer</strong> {check[1]}</p>
      <a href={`${base}/practice`}>Practise this topic <ArrowRight size={15} aria-hidden="true"/></a>
    </section>}
  </article>;
}
