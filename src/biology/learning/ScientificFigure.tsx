import {useRef,useState} from 'react';
import type {Asset} from './content';
export default function ScientificFigure({asset,hideLabels=false}: {asset:Asset;hideLabels?:boolean}) {
  const [failed,setFailed]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const opener=useRef<HTMLButtonElement>(null);
  if(asset.withheldReason)return <figure className="bio-figure bio-withheld-figure" data-asset-id={asset.id}><figcaption><strong>{asset.captionTitle}</strong><p>{asset.alt}</p><small>Figure withheld for revision: {asset.withheldReason}</small></figcaption></figure>;
  const src=hideLabels&&asset.recallSrc?asset.recallSrc:asset.src;
  const alt=hideLabels?'Unlabelled scientific schematic for recall. Reconstruct the labels and connections, then reveal to compare.':asset.alt;
  return <figure className="bio-figure" data-asset-id={asset.id}>
    {failed?<div className="bio-image-fallback" role="status">Figure unavailable. Use the complete written description below.</div>:<picture>{asset.mobileSrc&&<source media="(max-width: 560px)" srcSet={hideLabels&&asset.recallMobileSrc?asset.recallMobileSrc:asset.mobileSrc}/>}<img src={src} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/></picture>}
    <figcaption><strong>{asset.captionTitle}</strong><p>{hideLabels?'Reconstruct the missing labels and explain the mechanism. Reveal figure labels to compare with the written description.':asset.alt}</p>{asset.interpretation&&<p className="bio-figure-interpretation"><strong>Read the figure:</strong> {asset.interpretation}</p>}<div className="bio-actions"><button type="button" ref={opener} className="bio-figure-enlarge" onClick={()=>{dialog.current?.showModal();if(dialog.current)dialog.current.scrollTop=0}}>Enlarge figure</button><a className="bio-figure-open" href={src} target="_blank" rel="noreferrer">Open full-size figure ↗</a></div><small>{asset.attribution}</small></figcaption>
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
      <p>Scroll across the enlarged figure to inspect small labels. Press Escape to close.</p>
      <div className="bio-figure-zoom" tabIndex={0} role="region" aria-label="Enlarged figure; scroll horizontally and vertically"><img src={src} alt={alt}/></div>
      <p>{alt}</p>
    </dialog>
  </figure>;
}
