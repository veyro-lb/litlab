import {useRef,useState} from 'react';
import type {Asset} from './content';
export default function ScientificFigure({asset,hideLabels=false}: {asset:Asset;hideLabels?:boolean}) {
  const [failed,setFailed]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const src=hideLabels&&asset.recallSrc?asset.recallSrc:asset.src;
  const alt=hideLabels?'Unlabelled scientific schematic for recall. Reconstruct the labels and connections, then reveal to compare.':asset.alt;
  return <figure className="bio-figure" data-asset-id={asset.id}>
    {failed?<div className="bio-image-fallback" role="status">Figure unavailable. Use the complete written description below.</div>:<picture>{asset.mobileSrc&&<source media="(max-width: 560px)" srcSet={hideLabels&&asset.recallMobileSrc?asset.recallMobileSrc:asset.mobileSrc}/>}<img src={src} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/></picture>}
    <figcaption><strong>{asset.captionTitle}</strong><p>{hideLabels?'Reconstruct the missing labels and explain the mechanism. Reveal figure labels to compare with the written description.':asset.alt}</p><div className="bio-actions"><button type="button" className="bio-figure-enlarge" onClick={()=>dialog.current?.showModal()}>Enlarge figure</button><a className="bio-figure-open" href={src} target="_blank" rel="noreferrer">Open full-size figure ↗</a></div><small>{asset.attribution} · Source-checked draft; qualified review pending.</small></figcaption>
    <dialog ref={dialog} className="bio-figure-dialog" aria-label={asset.captionTitle}>
      <div className="bio-figure-dialog-head"><strong>{asset.captionTitle}</strong><button type="button" autoFocus onClick={()=>dialog.current?.close()}>Close figure</button></div>
      <p>Scroll across the enlarged figure to inspect small labels. Press Escape to close.</p>
      <div className="bio-figure-zoom" tabIndex={0} role="region" aria-label="Enlarged figure; scroll horizontally and vertically"><img src={src} alt={alt}/></div>
      <p>{alt}</p>
    </dialog>
  </figure>;
}
