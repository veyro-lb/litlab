type BrandAsset={src:string;darkInk:string[]};

const themedBrandImages=new Set<HTMLImageElement>();
const darkAssetCache=new Map<string,Promise<string>>();
let themeObserverStarted=false;

function isDarkMode(){
  return document.documentElement.dataset.theme==='dark';
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
  const src=image.dataset.litlabLightSrc;
  const darkInk=(image.dataset.litlabDarkInk||'').split(',').filter(Boolean);
  if(!src)return;

  if(!isDarkMode()){
    image.src=src;
    return;
  }

  void makeDarkAsset({src,darkInk}).then(darkSrc=>{
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

  themedBrandImages.add(image);
  ensureThemeObserver();
  syncBrandImage(image);
  return image;
}

export function createLitLabMark(className='litlab-ll-mark',labelled=false){
  return createBrandImage({src:'./litlab-mark.svg',darkInk:['#141b27']},className,labelled);
}

export function createLitLabLogo(className='litlab-brand-horizontal',labelled=true){
  return createBrandImage({src:'./litlab-logo.svg',darkInk:['#141a23']},className,labelled);
}

export function createLitLabStackedLogo(className='litlab-brand-stacked',labelled=true){
  return createBrandImage({src:'./litlab-stacked.svg',darkInk:['#101822']},className,labelled);
}
