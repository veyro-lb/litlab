import type {Asset} from './lesson-contract';
export type FigureSize='compact'|'standard'|'detailed'|'wide';
/** Shared editorial defaults; explicit asset displaySize overrides heuristics. */
export function getFigurePresentation(asset:Asset):{size:FigureSize;raster:boolean;rightsWithheld:boolean}{
 const description=(asset.id+' '+asset.captionTitle).toLowerCase();
 const src=asset.src.toLowerCase();
 const raster=/\.(png|jpe?g|webp)([?#]|$)/i.test(src);
 const rightsWithheld=src.includes('/source-pdf-figures/')&&asset.publicReproductionRights!=='cleared';
 let size:FigureSize='standard';
 if(asset.displaySize)size=asset.displaySize;
 else if(/graph|trace|spectra|spectrum|chart|comparison|compare|versus|keeling|plot/.test(description))size='wide';
 else if(/krebs|calvin|photosystem|chemiosmosis|electron.transport|meiosis|mitosis|replication|ribosome|translation|cycle|pathway|sequence|network|synaps|transcription|circuits/.test(description))size='detailed';
 else if(asset.kind==='molecular-model'||/amino.acid|nucleotide|pentose|sugars|hydration|single.molecule|bonding/.test(description))size='compact';
 return {size,raster,rightsWithheld};
}
