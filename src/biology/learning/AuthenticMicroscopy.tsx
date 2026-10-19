import {useState} from 'react';
import type {AuthenticMicrograph} from './lesson-contract';
import type {StudyState} from './content';
import type {UpdateStudy} from './StudyQuestion';

/** Deliberately user-initiated network loading: the original remains on Wikimedia Commons.
 * Attribution and specimen limitations always remain visible, including offline.
 */
export default function AuthenticMicroscopy({cases,study,update}:{cases:AuthenticMicrograph[];study:StudyState;update:UpdateStudy}){
 const [opened,setOpened]=useState<Record<string,boolean>>({});
 const [failed,setFailed]=useState<Record<string,boolean>>({});
 return <section className="bio-authentic-microscopy" aria-label="Authentic microscopy investigations">
   <h3>Inspect a real microscope image</h3>
   <p>These images are authentic, credited source photographs, not textbook-style reconstructions. Load an image to observe it, then justify your interpretation using only features it actually resolves.</p>
   {cases.map(c=>{
    const key='source-micrograph:'+c.id;
    return <article key={c.id} className="bio-microscopy-case" data-micrograph-id={c.id}>
     <h4>{c.title} <small>{c.modality==='TEM'?'Transmission electron microscopy':'Light microscopy'}</small></h4>
     <p><strong>Specimen:</strong> {c.specimen}</p>
     <p><strong>Source and rights:</strong> {c.author} · {c.license} · <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">Original image and source details ↗</a> · <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer">Reuse terms ↗</a></p>
     {!opened[c.id]?<button type="button" onClick={()=>setOpened(o=>({...o,[c.id]:true}))}>Load this sourced micrograph</button>:<>
       {failed[c.id]?<p role="status">The image host is unavailable or blocked. <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">Open the licensed original to inspect it ↗</a></p>:<figure className="bio-microscopy-photo"><img loading="lazy" decoding="async" referrerPolicy="no-referrer" src={c.imageUrl} alt={`${c.modality==='TEM'?'Electron':'Light'} micrograph of ${c.specimen}. Observe the source image before assigning biological labels.`} onError={()=>setFailed(p=>({...p,[c.id]:true}))}/></figure>}
       <button type="button" onClick={()=>setOpened(o=>({...o,[c.id]:false}))}>Close source image</button>
     </>}
     <p><strong>Observation task:</strong> {c.observationPrompt}</p>
     <p><strong>Scale:</strong> {c.scaleNote}</p>
     <label className="bio-response-label" htmlFor={key}>Record observable evidence and a justified identification</label>
     <textarea id={key} rows={3} value={study.drafts[key]??''} onChange={e=>{const value=e.target.value;update(s=>({...s,drafts:{...s.drafts,[key]:value}}))}}/>
     <details><summary>Compare with evidence-based interpretation</summary><p>{c.expectedEvidence}</p></details>
     <p className="bio-muted"><strong>Do not overinterpret:</strong> {c.limitation}</p>
    </article>;
   })}
  </section>;
}
