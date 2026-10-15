import {useState} from 'react';
import type {Asset} from './content';
export default function ScientificFigure({asset,hideLabels=false}: {asset:Asset;hideLabels?:boolean}) {
  const [failed,setFailed]=useState(false);
  return <figure className="bio-figure" data-asset-id={asset.id}>
    {failed?<div className="bio-image-fallback" role="status">Figure unavailable. Use the complete written description below.</div>:<img src={hideLabels&&'recallSrc' in asset?asset.recallSrc:asset.src} alt={hideLabels?'Unlabelled scientific schematic for recall. Reconstruct the labels and connections, then reveal to compare.':asset.alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>}
    <figcaption><strong>{asset.id==='seal'?'Life between water and ice':asset.id==='europa'?'Europa: evidence needs interpretation':'Read the figure'}</strong><p>{hideLabels?'Reconstruct the missing labels and explain the mechanism. Reveal figure labels to compare with the written description.':asset.alt}</p><a className="bio-figure-open" href={hideLabels&&'recallSrc' in asset?asset.recallSrc:asset.src} target="_blank" rel="noreferrer">Open full-size figure ↗</a><small>{asset.attribution} · Source-checked draft; qualified review pending.</small></figcaption>
  </figure>;
}
