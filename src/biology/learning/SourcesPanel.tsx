import type {Level} from '../curriculum/schema';
import type {Lesson} from './content';
import {getStudentEducationalSources, getStudentMediaCredits} from './source-policy';

export default function SourcesPanel({lesson,level}: {lesson:Lesson;level:Level}) {
  const educationalSources = getStudentEducationalSources();
  const mediaCredits = getStudentMediaCredits(lesson, level);
  return <section className="bio-sources" aria-labelledby="bio-sources-heading">
    <span className="bio-eyebrow">BIOLOGY / SOURCES</span>
    <h2 id="bio-sources-heading">Sources for this topic</h2>
    <p className="bio-sources-intro">BioLab uses the official IB Biology guide for syllabus requirements and the IB-reviewed Hodder coursebook for teaching support. The Hodder book is independently published, not an official IB publication.</p>
    <h3>Principal educational sources</h3>
    <ol className="bio-educational-sources">
      {educationalSources.map(source => <li key={source.id} data-source-id={source.id}>
        <h4>{source.title}</h4><p>{source.description}</p>
        <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={source.linkDescription + ' (opens in a new tab)'}>{source.linkDescription} ↗</a>
      </li>)}
    </ol>
    <h3>Figure, observation and data credits</h3>
    {mediaCredits.length > 0 ? <details className="bio-media-credits">
      <summary>View {mediaCredits.length} credited {mediaCredits.length === 1 ? 'item' : 'items'}</summary>
      <ul>{mediaCredits.map(credit => <li key={credit.id}>
        <strong>{credit.title}</strong><span className="bio-credit-kind">{credit.kind === 'data' ? 'Data attribution' : credit.kind === 'observation' ? 'Original observation / micrograph' : 'Media licence'}</span>
        <p>{credit.attribution}</p><p>Reuse: {credit.license}</p>
        {(credit.sourceUrl || credit.termsUrl) && <p className="bio-credit-links">
          {credit.sourceUrl && <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">Original source ↗</a>}
          {credit.termsUrl && <a href={credit.termsUrl} target="_blank" rel="noopener noreferrer">Licence or terms ↗</a>}
        </p>}
      </li>)}</ul>
    </details> : <p className="bio-sources-muted">No separately licensed external media or measured dataset is listed for this scope. Original BioLab illustrations are credited at the figure.</p>}
    <p className="bio-sources-disclaimer">Media provenance and independent scientific evidence do not imply IB approval. BioLab is an independent learning project; these draft lessons and practice questions have not been certified by the IB or a qualified scientific reviewer.</p>
  </section>;
}
