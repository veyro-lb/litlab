import {educationalSources} from './source-policy';

export default function SourcesPanel() {
  return <section className="bio-sources" aria-labelledby="bio-sources-heading">
    <h1 id="bio-sources-heading">Course sources</h1>
    <ul className="bio-educational-sources" role="list">
      {educationalSources.map(source => <li key={source.id} data-source-id={source.id}>
        <p className="bio-reference">
          {source.authors} ({source.year}). <cite>{source.title}</cite>
          {'edition' in source ? <> ({source.edition}). {source.publisher}.</> : '.'}
        </p>
        <a className="bio-reference-link" href={source.url} target="_blank" rel="noopener noreferrer">
          {source.linkLabel}<span aria-hidden="true"> ↗</span><span className="bio-sr-only"> (opens in a new tab)</span>
        </a>
      </li>)}
    </ul>
  </section>;
}
