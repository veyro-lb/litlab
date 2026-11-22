import {useState} from 'react';
import ScientificFigure from '../ScientificFigure';
import type {Asset} from '../content';
import {practiceSets, type PracticeSet} from './data';

const onion: Asset = {
  id: 'skills-onion-root',
  kind: 'photograph',
  src: '/biology/authentic/onion-root-mitosis.webp',
  alt: 'Stained onion-root cells. Chromosomes are distributed differently in adjacent cells.',
  captionTitle: 'Mitosis in onion root cells',
  attribution: 'Roval312. Complete frame resized and WebP-encoded.',
  license: 'CC BY-SA 4.0',
  permissionEvidence: 'Individual source file licence.',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mitosis_in_onion_cells.jpg',
  termsUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  referenceIds: [],
  level: 'shared',
  review: 'source-mapped',
};

const commandTerms = [
  ['State', 'Give the requested name, value or fact.'],
  ['Describe', 'Report the pattern or features. For a graph, support the description with values and units.'],
  ['Explain', 'Give the biological reason for the pattern. Connect the mechanism to the observation.'],
  ['Evaluate', 'Weigh what the evidence supports, identify a specific limitation and reach a justified judgement.'],
];

export default function ExamSkills() {
  return <article className="bio-exam-skills">
    <header className="bio-topic-premium-head">
      <h1>Exam skills</h1>
      <p>Practise reading evidence, answering command terms, and planning your scientific investigation.</p>
      <a className="bio-primary" href="#biology?resource=practice">Browse topic practice</a>
    </header>
    <section className="bio-course-bibliography" aria-labelledby="exam-evidence-heading">
      <h2 id="exam-evidence-heading">Read the evidence first</h2>
      <ol>
        <li><strong>Check what was measured.</strong> Read the axes, units, and scales. For a micrograph, use its own scale bar.</li>
        <li><strong>Make a specific comparison.</strong> Use comparable conditions, quote relevant values, and show calculation steps with units.</li>
        <li><strong>Check precision and scope.</strong> Separate measurement uncertainty from spread across repeats. A trend in one dataset gives evidence about those conditions.</li>
      </ol>
      <h3>What the command term asks you to do</h3>
      <dl className="bio-exam-terms">{commandTerms.map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl>
      <p>Use the suggested marks to estimate how many distinct points to make. For comparisons, give the relationship between the groups, using evidence where requested.</p>
    </section>
    <section className="bio-course-bibliography" aria-labelledby="exam-practice-heading">
      <h2 id="exam-practice-heading">Paper 1B-style practice</h2>
      <p>These original sets use a shared figure or dataset across several questions. Write your reasoning before opening the marking guidance.</p>
      {practiceSets.map(set => <details key={set.id} className="bio-exam-set" data-practice-set={set.id}>
        <summary>{set.title}</summary>
        <PracticeCase set={set}/>
      </details>)}
    </section>
    <section className="bio-course-bibliography" aria-labelledby="exam-investigation-heading">
      <h2 id="exam-investigation-heading">Scientific investigation</h2>
      <p>The Biology internal assessment is a scientific investigation. It contributes 20% of the final assessment at SL and HL. The written report has a 3,000-word maximum, with the exclusions listed in the IB guide.</p>
      <p><strong>Example research question</strong> How does sodium chloride concentration affect the percentage change in mass of equal-sized potato cylinders after 30 minutes?</p>
      <dl className="bio-exam-terms">
        <div><dt>Research design</dt><dd>Define the range of sodium chloride concentrations and the percentage mass change you will measure. Keep cylinder size, immersion time, solution volume and temperature consistent. Explain how you will replicate the measurements.</dd></div>
        <div><dt>Data analysis</dt><dd>Record masses with the balance resolution. Calculate the percentage change for each sample. Plot concentration against mean percentage mass change with the measured spread identified in the legend.</dd></div>
        <div><dt>Conclusion</dt><dd>Use the direction and size of the change to answer the question. Explain the result using osmosis and compare it with your accepted scientific context.</dd></div>
        <div><dt>Evaluation</dt><dd>Explain how inconsistent blotting could leave extra solution and bias final masses. Propose a repeatable blotting technique and state which part of the measurement it improves.</dd></div>
      </dl>
      <p className="bio-muted">Source: IB Biology Guide, first assessment 2025, Skills in the study of biology, Assessment, and Glossary of command terms. <a href="https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/biology/" target="_blank" rel="noreferrer">IB Biology course overview ↗</a></p>
    </section>
  </article>;
}

function PracticeCase({set}: {set: PracticeSet}) {
  const [responses, setResponses] = useState<Record<number, string>>({});
  return <div className="bio-exam-case">
    <p>{set.context}</p>
    {set.id === 'microscopy' && <><ScientificFigure asset={onion}/><p className="bio-muted">Source: <a href={onion.sourceUrl} target="_blank" rel="noreferrer">Roval312, Wikimedia Commons</a> · CC BY-SA 4.0.</p></>}
    {set.id === 'light' && <figure className="bio-exam-chart">
      <svg viewBox="0 0 460 245" role="img" aria-label="Model net oxygen production rises sharply, then levels off. Exact values follow in the table.">
        <g fill="none" stroke="currentColor" strokeWidth="2"><path d="M68 18V180H426"/><path d="M68 100h-5m5 40h-5m5-80h-5m5-40h-5m5 160v5m90-5v5m90-5v5m90-5v5m90-5v5"/></g>
        <g fontSize="14" fill="currentColor" textAnchor="end"><text x="58" y="184">0</text><text x="58" y="144">0.5</text><text x="58" y="104">1.0</text><text x="58" y="64">1.5</text><text x="58" y="24">2.0</text></g>
        <g fontSize="14" fill="currentColor" textAnchor="middle"><text x="68" y="203">0</text><text x="158" y="203">100</text><text x="248" y="203">200</text><text x="338" y="203">300</text><text x="428" y="203">400</text><text x="248" y="230">Light intensity (μmol photons m⁻² s⁻¹)</text><text x="20" y="100" transform="rotate(-90 20 100)">Net O₂ (μmol min⁻¹)</text></g>
        <path d="M113 140L158 108 248 60 428 52" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <g fill="currentColor"><circle cx="113" cy="140" r="4"/><circle cx="158" cy="108" r="4"/><circle cx="248" cy="60" r="4"/><circle cx="428" cy="52" r="4"/></g>
      </svg>
    </figure>}
    <div className="bio-table-scroll" tabIndex={0} role="region" aria-label={set.caption}><table>
      <caption>{set.caption}</caption>
      <thead><tr>{set.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead>
      <tbody>{set.rows.map(row => <tr key={row[0]}><th scope="row">{row[0]}</th>{row.slice(1).map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody>
    </table></div>
    <ol className="bio-exam-parts">{set.parts.map((part, index) => <li key={part.prompt}>
      <label htmlFor={`exam-${set.id}-${index}`}>{part.prompt} <small>({part.points.length} marks)</small></label>
      <textarea id={`exam-${set.id}-${index}`} rows={3} value={responses[index] ?? ''} onChange={event => setResponses({...responses, [index]: event.target.value})}/>
      <details><summary>Show marking guidance</summary><ul>{part.points.map(point => <li key={point}>{point}</li>)}</ul></details>
    </li>)}</ol>
    <p className="bio-exam-links">{set.links.map(([code, title]) => <a key={code} href={`#biology/topic/${code.slice(0, code.lastIndexOf('.'))}/learn?understanding=${code}`}>{code} · {title}</a>)}</p>
  </div>;
}
