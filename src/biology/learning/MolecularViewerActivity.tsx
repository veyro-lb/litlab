import type {Section} from './lesson-contract';
/** External structure viewer is opt-in: no dependency or remote asset is loaded with this page. */
export default function MolecularViewerActivity({activity}:{activity:NonNullable<Section['molecularViewer']>}){
 return <section className="bio-explorer" aria-label={activity.title}>
  <h3>{activity.title}</h3>
  <p><strong>Hands-on software task — internet required.</strong> The experimental structure opens on RCSB only after you activate its link. No external viewer runs automatically inside LitLab.</p>
  <p>{activity.prompt}</p>
  <p><a href={activity.url} target="_blank" rel="noopener noreferrer">Open RCSB 3D molecular viewer for {activity.structureId} ↗</a></p>
  <p>Rotate the structure with pointer drag or touch, use the site's zoom controls, identify the DNA and histone core, then explain what is absent. If this external software is inaccessible, ask your teacher for an accessible molecular viewer.</p>
  <details><summary>Written alternative and accessibility notes</summary><p>{activity.fallback}</p><p>Reading the alternative alone does not count as the IB's required hands-on molecular visualization activity.</p></details>
 </section>;
}