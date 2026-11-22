import type {Asset, AuthenticMicrograph, LearningVisual as Visual} from '../lesson-contract';
import LearningVisual from '../LearningVisual';
import ScientificFigure from '../ScientificFigure';

type EnergyData = Extract<Visual, {kind: 'bars' | 'pyramid'}>;

export function DrawingEnergyTask({data}: {data: EnergyData}) {
  return <section className="bio-drawing-reference">
    <h3>Draw a pyramid using Silver Springs data</h3>
    <p>Put producers at the base. Centre the bars and use one linear scale for all four widths. Label every level and include the energy units.</p>
    <div className="bio-table-scroll" tabIndex={0} role="region" aria-label="Silver Springs energy data">
      <table>
        <caption>Historical energy flow · {data.unit}</caption>
        <thead><tr><th scope="col">Trophic level</th><th scope="col">Energy flow</th></tr></thead>
        <tbody>{data.values.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value.toLocaleString('en-GB')}</td></tr>)}</tbody>
      </table>
    </div>
    <p>{data.note}</p>
    <p>Calculate the transfer efficiency from producers to primary consumers and from secondary to tertiary consumers. Explain one way energy becomes unavailable to the next trophic level.</p>
    <details>
      <summary>Compare with the measured model and calculations</summary>
      <LearningVisual visual={{...data, title: 'Energy pyramid · Silver Springs', kind: 'pyramid'}}/>
      <p>Divide the receiving level’s energy by the previous level’s energy and multiply by 100. The first transfer was about 16.2%. The secondary-to-tertiary transfer was about 5.5%. Respiration dissipates some energy as heat. Some material is uneaten or passes to decomposers.</p>
    </details>
  </section>;
}

export default function DrawingEvidence({source}: {source: AuthenticMicrograph}) {
  const asset: Asset = {
    id: 'observation-' + source.id,
    src: source.imageUrl,
    kind: 'photograph',
    captionTitle: source.title,
    alt: 'Source micrograph of ' + source.specimen + '. ' + source.scaleNote,
    attribution: source.author,
    license: source.license,
    sourceUrl: source.sourceUrl,
    termsUrl: source.licenseUrl,
    permissionEvidence: source.sourceUrl,
    referenceIds: [source.referenceId],
    level: 'shared',
    review: 'source-mapped',
  };
  return <article className="bio-microscopy-case">
    <h4>{source.title}</h4>
    <p>{source.observationPrompt}</p>
    <ScientificFigure asset={asset}/>
    <p className="bio-muted">{source.scaleNote} {source.limitation}</p>
    <p className="bio-muted">Source: <a href={source.sourceUrl} target="_blank" rel="noreferrer">{source.author}</a> · <a href={source.licenseUrl} target="_blank" rel="noreferrer">{source.license}</a></p>
    <details>
      <summary>Reveal labels and annotation guidance</summary>
      <p>{source.expectedEvidence}</p>
    </details>
  </article>;
}
