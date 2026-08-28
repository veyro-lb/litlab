type BrandAsset={src:string;darkInk:string[];prepare?:'horizontal'};

const themedBrandImages=new Set<HTMLImageElement>();
const brandAssets=new WeakMap<HTMLImageElement,BrandAsset>();
const darkAssetCache=new Map<string,Promise<string>>();
const preparedAssetCache=new Map<string,Promise<string>>();
let themeObserverStarted=false;

function isDarkMode(){
  return document.documentElement.dataset.theme==='dark';
}

function prepareHorizontalLogo(svg:string){
  try{
    const documentSvg=new DOMParser().parseFromString(svg,'image/svg+xml');
    const root=documentSvg.documentElement;

    // Remove the old oversized bulb that is baked into the source asset.
    root.querySelector('style')?.remove();
    root.querySelectorAll('.litlab-bulb-glow,.litlab-bulb').forEach(node=>node.remove());

    // Rebuild the i-dot as a compact brand-ink circle above the i stem.
    // This dot is also the physical base/socket for the animated bulb overlay.
    root.querySelectorAll('.litlab-i-dot').forEach(node=>node.remove());
    const dot=documentSvg.createElementNS('http://www.w3.org/2000/svg','circle');
    dot.setAttribute('class','litlab-i-dot');
    dot.setAttribute('cx','938');
    dot.setAttribute('cy','161');
    dot.setAttribute('r','19');
    dot.setAttribute('fill','#141a23');
    root.appendChild(dot);

    return new XMLSerializer().serializeToString(root);
  }catch{
    return svg;
  }
}

function makePreparedAsset(asset:BrandAsset,dark:boolean){
  const key=`${asset.src}|${asset.prepare||''}|${dark?'dark':'light'}|${asset.darkInk.join(',')}`;
  const cached=preparedAssetCache.get(key);
  if(cached)return cached;

  const promise=fetch(asset.src,{cache:'no-store'})
    .then(response=>{
      if(!response.ok)throw new Error(`Unable to load ${asset.src}`);
      return response.text();
    })
    .then(svg=>{
      let prepared=asset.prepare==='horizontal'?prepareHorizontalLogo(svg):svg;
      if(dark){
        asset.darkInk.forEach(ink=>{
          prepared=prepared.replace(new RegExp(ink.replace('#','\\#'),'gi'),'#ffffff');
        });
      }
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(prepared)}`;
    })
    .catch(()=>asset.src);

  preparedAssetCache.set(key,promise);
  return promise;
}

function makeDarkAsset(asset:BrandAsset){
  const key=`${asset.src}|${asset.darkInk.join(',')}`;
  const cached=darkAssetCache.get(key);
  if(cached)return cached;

  const promise=fetch(asset.src)
    .then(response=>{
      if(!response.ok)throw new Error(`Unable to load ${asset.src}`);
      return response.text();
    })
    .then(svg=>{
      let themed=svg;
      asset.darkInk.forEach(ink=>{
        themed=themed.replace(new RegExp(ink.replace('#','\\#'),'gi'),'#ffffff');
      });
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(themed)}`;
    })
    .catch(()=>asset.src);

  darkAssetCache.set(key,promise);
  return promise;
}

function syncBrandImage(image:HTMLImageElement){
  const asset=brandAssets.get(image);
  if(!asset)return;

  if(asset.prepare){
    const dark=isDarkMode();
    if(!image.src)image.style.visibility='hidden';
    void makePreparedAsset(asset,dark).then(src=>{
      if(!image.isConnected||isDarkMode()!==dark)return;
      image.src=src;
      image.style.visibility='';
    });
    return;
  }

  if(!isDarkMode()){
    image.src=asset.src;
    return;
  }

  void makeDarkAsset(asset).then(darkSrc=>{
    if(image.isConnected&&isDarkMode())image.src=darkSrc;
  });
}

function syncAllBrandImages(){
  themedBrandImages.forEach(image=>{
    if(image.isConnected)syncBrandImage(image);
    else themedBrandImages.delete(image);
  });
}

function ensureThemeObserver(){
  if(themeObserverStarted)return;
  themeObserverStarted=true;
  new MutationObserver(syncAllBrandImages).observe(document.documentElement,{
    attributes:true,
    attributeFilter:['data-theme']
  });
}

function createBrandImage(asset:BrandAsset,className:string,labelled:boolean){
  const image=document.createElement('img');
  image.className=className;
  image.decoding='async';
  image.draggable=false;
  image.dataset.litlabLightSrc=asset.src;
  image.dataset.litlabDarkInk=asset.darkInk.join(',');
  if(labelled){
    image.alt='LitLab';
  }else{
    image.alt='';
    image.setAttribute('aria-hidden','true');
  }

  brandAssets.set(image,asset);
  themedBrandImages.add(image);
  ensureThemeObserver();
  syncBrandImage(image);
  return image;
}

export function createLitLabMark(className='litlab-ll-mark',labelled=false){
  return createBrandImage({src:'./litlab-mark.svg',darkInk:['#141b27']},className,labelled);
}

export function createLitLabLogo(className='litlab-brand-horizontal',labelled=true){
  return createBrandImage({src:'./litlab-logo.svg?v=15',darkInk:['#141a23'],prepare:'horizontal'},className,labelled);
}

export function createLitLabStackedLogo(className='litlab-brand-stacked',labelled=true){
  return createBrandImage({src:'./litlab-stacked.svg',darkInk:['#101822']},className,labelled);
}
