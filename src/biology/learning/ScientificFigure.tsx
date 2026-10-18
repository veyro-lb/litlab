import {useRef,useState} from 'react';
import type {Asset} from './content';

/** Keep scientific context in the surrounding lesson, not in repeated footers.
 * Detailed description remains available to assistive technology and in Sources.
 */
export default function ScientificFigure({asset,hideLabels=false}: {asset:Asset;hideLabels?:boolean}) {
  const [failed,setFailed]=useState(false);
  const [zoom,setZoom]=useState(1);
  const dialog=useRef<HTMLDialogElement>(null);
  const opener=useRef<HTMLButtonElement>(null);
  if(asset.withheldReason)return <figure className="bio-figure bio-withheld-figure" data-asset-id={asset.id}><figcaption><strong>{asset.captionTitle}</strong><p>{asset.alt}</p><small>Figure withheld for revision: {asset.withheldReason}</small></figcaption></figure>;
  const src=hideLabels&&asset.recallSrc?asset.recallSrc:asset.src;
  const alt=hideLabels?'Unlabelled scientific schematic for recall. Reconstruct the labels and connections, then reveal to compare.':asset.alt;
  return <figure className="bio-figure bio-figure-clean" data-asset-id={asset.id}>
    {failed?<div className="bio-image-fallback" role="status">Figure unavailable. {asset.alt}</div>:
      <button className="bio-figure-image" type="button" ref={opener} aria-label={`Enlarge diagram: ${asset.captionTitle}`} onClick={()=>{setZoom(1);dialog.current?.showModal();if(dialog.current)dialog.current.scrollTop=0}}>
        <picture>{asset.mobileSrc&&<source media="(max-width: 560px)" srcSet={hideLabels&&asset.recallMobileSrc?asset.recallMobileSrc:asset.mobileSrc}/>}<img src={src} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/></picture>
      </button>}
    <figcaption className="bio-sr-only">{asset.captionTitle}. {asset.alt}{asset.interpretation?' '+asset.interpretation:''}</figcaption>
    <dialog ref={dialog} className="bio-figure-dialog" aria-label={asset.captionTitle} onClose={()=>opener.current?.focus()} onKeyDown={event=>{
      if(event.key!=='Tab')return;
      const node=dialog.current;if(!node)return;
      const stops=node.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]');
      const first=stops[0],last=stops[stops.length-1];
      const active=(node.getRootNode() as Document|ShadowRoot).activeElement;
      if(event.shiftKey&&active===first){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&active===last){event.preventDefault();first?.focus()}
    }}>
      <div className="bio-figure-dialog-head"><strong>{asset.captionTitle}</strong><button type="button" autoFocus onClick={()=>dialog.current?.close()}>Close figure</button></div>
      <div className="bio-figure-zoom-controls" role="group" aria-label="Figure zoom controls"><button type="button" aria-label="Zoom out" disabled={zoom<=1} onClick={()=>setZoom(value=>Math.max(1,+(value-0.5).toFixed(1)))}>−</button><output aria-live="polite">{Math.round(zoom*100)}%</output><button type="button" aria-label="Zoom in" disabled={zoom>=3} onClick={()=>setZoom(value=>Math.min(3,+(value+0.5).toFixed(1)))}>+</button><span>Pan to inspect labels · Escape to close</span></div>
      <div className="bio-figure-zoom" tabIndex={0} role="region" aria-label="Enlarged scientific illustration"><img src={src} alt={alt} style={{minWidth:`${zoom*100}%`}}/></div>
      <p>{asset.alt}</p>
    </dialog>
  </figure>;
}
