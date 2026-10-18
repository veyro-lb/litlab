import {useEffect,useRef,useState} from 'react';
import type {Asset} from './content';
import {getFigurePresentation} from './figure-presentation';
const clampZoom=(z:number)=>Math.max(1,Math.min(4,z));
/** Native dialog supplies Escape and focus semantics; scrollable zoom preserves full diagrams. */
export default function ScientificFigure({asset,hideLabels=false}:{asset:Asset;hideLabels?:boolean}){
 const [failed,setFailed]=useState(false);
 const [zoom,setZoom]=useState(1);
 const dialog=useRef<HTMLDialogElement>(null);
 const opener=useRef<HTMLButtonElement>(null);
 const viewport=useRef<HTMLDivElement>(null);
 const presentation=getFigurePresentation(asset);
 const src=hideLabels&&asset.recallSrc?asset.recallSrc:asset.src;
 const alt=hideLabels?'Unlabelled scientific schematic for recall. Reconstruct labels and connections, then reveal to compare.':asset.alt;
 useEffect(()=>{setFailed(false);setZoom(1)},[src]);
 const reason=asset.withheldReason||(presentation.rightsWithheld?'Documented public reproduction rights are required for this PDF-derived figure.':null);
 if(reason)return <figure className="bio-figure bio-withheld-figure" data-asset-id={asset.id}><figcaption><strong>{asset.captionTitle}</strong><p>{asset.alt}</p><small>Figure withheld pending review: {reason}</small></figcaption></figure>;
 return <figure className="bio-figure bio-figure-clean" data-asset-id={asset.id} data-size={presentation.size} data-raster={presentation.raster}>
  {failed?<div className="bio-image-fallback" role="status">Figure unavailable. {asset.alt}</div>:
  <button className="bio-figure-image" type="button" ref={opener} aria-label={'Enlarge diagram: '+asset.captionTitle} aria-haspopup="dialog" onClick={()=>{setZoom(1);dialog.current?.showModal()}}>
   <picture>{asset.mobileSrc&&<source media="(max-width: 560px)" srcSet={hideLabels&&asset.recallMobileSrc?asset.recallMobileSrc:asset.mobileSrc}/>}<img src={src} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/></picture>
  </button>}
  <figcaption className="bio-sr-only">{asset.captionTitle}. {asset.alt}{asset.interpretation?' '+asset.interpretation:''}</figcaption>
  {!failed&&<dialog ref={dialog} className="bio-figure-dialog" aria-label={asset.captionTitle} onClose={()=>opener.current?.focus()} onKeyDown={event=>{
    if(event.key==='+'||event.key==='='){event.preventDefault();setZoom(z=>clampZoom(z+.5))}
    else if(event.key==='-'&&event.target===viewport.current){event.preventDefault();setZoom(z=>clampZoom(z-.5))}
    else if(event.key==='0'&&event.target===viewport.current){event.preventDefault();setZoom(1)}
  }}>
   <div className="bio-figure-dialog-head"><strong>{asset.captionTitle}</strong><button type="button" autoFocus onClick={()=>dialog.current?.close()}>Close figure</button></div>
   <div className="bio-figure-dialog-controls" role="group" aria-label="Diagram zoom controls">
    <button type="button" aria-label="Zoom out" disabled={zoom===1} onClick={()=>setZoom(z=>clampZoom(z-.5))}>−</button>
    <output aria-live="polite">{Math.round(zoom*100)}%</output>
    <button type="button" aria-label="Zoom in" disabled={zoom===4} onClick={()=>setZoom(z=>clampZoom(z+.5))}>+</button>
    <button type="button" disabled={zoom===1} onClick={()=>{setZoom(1);viewport.current?.scrollTo(0,0)}}>Reset</button>
   </div>
   <div ref={viewport} className="bio-figure-zoom" tabIndex={0} role="region" aria-label="Enlarged diagram; scroll or use arrow keys to pan"><img src={src} alt={alt} style={{width:(zoom*100)+'%'}}/></div>
   <p className="bio-figure-dialog-hint">Zoom in to inspect labels; scroll to pan. Press Escape to return to the lesson.</p>
  </dialog>}
 </figure>;
}
