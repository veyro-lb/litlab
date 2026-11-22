import {useState} from 'react';
import type {Asset, Lesson, StudyState} from '../content';
import type {UpdateStudy} from '../StudyQuestion';
import type {Level} from '../../curriculum/schema';
import ScientificFigure from '../ScientificFigure';
import DrawingEvidence, {DrawingEnergyTask} from './DrawingEvidence';
import {drawingRequirements, requirementLabel} from './requirements.mjs';
import type {DrawingRequirement} from './requirements.mjs';
import {readDrawingNote, saveDrawingNote} from './notes';

interface Props {
  lesson: Lesson;
  level: Level;
  study: StudyState;
  update: UpdateStudy;
  requestedId: string | null;
  requestedDiagram: string | null;
}

export default function PaperDrawingPractice({lesson, level, study, update, requestedId, requestedDiagram}: Props) {
  const eligible = drawingRequirements.filter(e => e.topicId === lesson.topicId && (level === 'HL' || e.level !== 'HL'));
  const scoped = requestedId ? eligible.filter(e => e.understandingId === requestedId) : eligible;
  const [selection, setSelection] = useState(requestedDiagram ?? '');
  const exercise = scoped.find(e => e.id === selection) ?? scoped[0];
  if (!exercise) return <section className="bio-drawing bio-drawing-empty">
    <h2>No separate drawing requirement in this selection</h2>
    <p>Use this topic’s lesson figures for interpretation and visual recall.</p>
    <a href="#biology?resource=drawing">View drawings for all themes →</a>
    {requestedId && eligible.length > 0 && <p><a href={`#biology/topic/${lesson.topicId}/drawing`}>View this topic’s drawing activities →</a></p>}
  </section>;

  return <section className="bio-drawing" aria-labelledby="bio-drawing-title" data-exercise={exercise.id}>
    <a href={`#biology/theme/${lesson.topicId[0]}?resource=drawing`}>← Theme {lesson.topicId[0]} drawing checklist</a>
    <div className="bio-drawing-intro">
      <span className="bio-eyebrow">{requirementLabel(exercise.kind)} · {exercise.understandingId} · {level}</span>
      <h2 id="bio-drawing-title">{exercise.title}</h2>
      <small>IB Biology Guide, first assessment 2025, p. {exercise.guidePage}.</small>
    </div>
    {scoped.length > 1 && <div className="bio-drawing-picker">
      <label htmlFor="bio-drawing-structure">Choose a diagram</label>
      <select id="bio-drawing-structure" value={exercise.id} onChange={event => setSelection(event.target.value)}>
        {scoped.map(e => <option key={e.id} value={e.id}>{e.title} · {e.understandingId}</option>)}
      </select>
    </div>}
    <DrawingAttempt key={exercise.id} exercise={exercise} lesson={lesson} study={study} update={update}/>
  </section>;
}

function DrawingAttempt({exercise, lesson, study, update}: Pick<Props, 'lesson' | 'study' | 'update'> & {exercise: DrawingRequirement}) {
  const section = lesson.sections.find(s => s.understandingIds.includes(exercise.understandingId));
  const evidence = section?.authenticMicrographs ?? [];
  const energyModel = exercise.id === 'energy-pyramid' ? section?.visuals?.find(v => v.kind === 'bars') : undefined;
  const energyData = energyModel?.kind === 'bars' ? energyModel : undefined;
  const [specimen, setSpecimen] = useState(evidence[0]?.id);
  const [drawing, setDrawing] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [storedNote, setStoredNote] = useState(() => readDrawingNote(exercise.id));
  const [saved, setSaved] = useState<boolean | null>(null);
  const sourceAsset = lesson.assets.find(a => a.src === exercise.reference);
  const source = exercise.sourceCredit ?? (exercise.handoutPage
    ? `IB Biology Drawings (Noteworthy Science / Marier), supplied handout, page ${exercise.handoutPage}.`
    : sourceAsset?.attribution ?? 'Reference in the topic lesson.');
  const asset: Asset | null = exercise.reference ? {
    id: 'drawing-' + exercise.id,
    kind: 'diagram',
    src: exercise.reference,
    alt: exercise.title + '. ' + exercise.checks.join(' '),
    captionTitle: exercise.title,
    attribution: source,
    license: sourceAsset?.license ?? 'User-supplied reference; project owner confirmed permission for public use.',
    permissionEvidence: 'Owner permission confirmed for supplied educational figures.',
    referenceIds: [],
    level: exercise.level,
    review: 'source-mapped',
    publicReproductionRights: 'cleared',
  } : null;
  const noteKey = 'drawing-notes:' + exercise.id;
  const criteria = [...exercise.checks, 'Use clear, continuous lines and straight label lines that do not cross.', 'Write full structure names and include functions when the task asks for annotations.'];
  const useEvidence = exercise.id === 'organelles' || exercise.id === 'stem' || exercise.id === 'root';
  const activeEvidence = exercise.id === 'organelles' ? evidence.filter(item => item.id === specimen) : evidence;
  const model = asset && <><ScientificFigure asset={asset}/><p className="bio-drawing-note">Source: {source} Select the image to enlarge it.</p></>;

  return <>
    <div className="bio-drawing-reference"><h3>Your drawing task</h3><ul>{exercise.checks.map(c => <li key={c}>{c}</li>)}</ul></div>
    {useEvidence ? <section className="bio-drawing-evidence" aria-label="Specimens to draw from">
      <h3>Draw from the source image</h3>
      {exercise.id === 'organelles' && evidence.length > 1 && <div className="bio-drawing-picker">
        <label htmlFor="bio-drawing-specimen">Choose a specimen</label>
        <select id="bio-drawing-specimen" value={specimen} onChange={event => setSpecimen(event.target.value)}>
          {evidence.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </div>}
      {activeEvidence.map(item => <DrawingEvidence key={item.id} source={item}/>)}
      {model && <details className="bio-drawing-reference"><summary>Compare with the reference drawing</summary>{model}</details>}
    </section> : energyData ? <>
      <DrawingEnergyTask data={energyData}/>
      {model && <details className="bio-drawing-reference"><summary>See the textbook illustration</summary>{model}</details>}
    </> : <>
      <p>Study the reference, then hide it while you draw on paper.</p>
      <div className="bio-drawing-actions">
        <button className="bio-drawing-primary" type="button" aria-pressed={drawing} onClick={() => setDrawing(value => !value)}>
          {drawing ? 'Reveal reference & compare' : 'Hide reference & draw'}
        </button>
      </div>
      {drawing ? <div className="bio-drawing-hidden" role="status"><strong>Reference hidden</strong><span>Draw on paper, then reveal the reference to compare.</span></div> : model}
    </>}
    <fieldset className="bio-drawing-checklist">
      <legend>Compare your drawing</legend>
      {criteria.map(criterion => <label key={criterion}>
        <input type="checkbox" checked={!!checks[criterion]} onChange={event => {
          setChecks({...checks, [criterion]: event.target.checked});
          setFinished(false);
        }}/>
        <span>{criterion}</span>
      </label>)}
    </fieldset>
    <label className="bio-drawing-notes" htmlFor="bio-drawing-notes">What will you improve next time?</label>
    <textarea id="bio-drawing-notes" value={study.drafts[noteKey] ?? storedNote} maxLength={2000}
      aria-describedby="bio-drawing-note-status" placeholder="Record a missing label or correction…"
      onChange={event => {
        const value = event.target.value;
        setSaved(saveDrawingNote(exercise.id, value));
        setStoredNote(value);
        update(state => ({...state, drafts: {...state.drafts, [noteKey]: value}}));
      }}/>
    <p id="bio-drawing-note-status" className="bio-drawing-note">
      {saved === false ? 'Browser storage is unavailable. Your note will last until refresh.' : 'Drawing notes stay in this browser. Clearing site data removes them.'}
    </p>
    <div className="bio-drawing-actions">
      <button className="bio-drawing-primary" type="button" onClick={() => setFinished(true)}>Finish self-check</button>
      <button type="button" onClick={() => {setDrawing(false); setChecks({}); setFinished(false)}}>Start again</button>
    </div>
    {finished && <p role="status">Self-check complete. {Object.values(checks).filter(Boolean).length} of {criteria.length} criteria checked.</p>}
  </>;
}
