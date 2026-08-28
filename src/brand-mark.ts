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
    const ns='http://www.w3.org/2000/svg';

    // Remove the old oversized bulb baked into the source asset.
    root.querySelectorAll('style').forEach(node=>node.remove());
    root.querySelectorAll('.litlab-bulb-glow,.litlab-bulb,.litlab-i-dot,.litlab-live-bulb').forEach(node=>node.remove());

    // Rebuild a fuller, proportional i-dot above the stem. The animated bulb
    // lands directly on the top of this dot so the dot is also its base.
    const dot=documentSvg.createElementNS(ns,'circle');
    dot.setAttribute('class','litlab-i-dot');
    dot.setAttribute('cx','938');
    dot.setAttribute('cy','155');
    dot.setAttribute('r','22');
    dot.setAttribute('fill','#141a23');
    root.appendChild(dot);

    const style=documentSvg.createElementNS(ns,'style');
    style.textContent=`
      .litlab-live-bulb{transform-box:fill-box;transform-origin:center;animation:litlabLiveBulbFlicker 4.2s linear infinite}
      .litlab-live-glow{transform-box:fill-box;transform-origin:center;animation:litlabLiveBulbGlow 4.2s ease-in-out infinite}
      .litlab-live-rays{animation:litlabLiveBulbRays 4.2s linear infinite}
      @keyframes litlabLiveBulbFlicker{
        0%,13%,17.2%,22%,62%,67.2%,72%,100%{opacity:1}
        14.5%,15.8%,64%,65.6%{opacity:.56}
        15.1%,16.5%,64.7%,66.3%{opacity:.86}
      }
      @keyframes litlabLiveBulbGlow{
        0%,100%{opacity:.085;transform:scale(.96)}
        36%,50%,84%{opacity:.2;transform:scale(1.06)}
        14.5%,15.8%,64%,65.6%{opacity:.025;transform:scale(.92)}
      }
      @keyframes litlabLiveBulbRays{
        0%,13%,17.2%,22%,62%,67.2%,72%,100%{opacity:.9}
        14.5%,15.8%,64%,65.6%{opacity:.14}
        36%,50%,84%{opacity:1}
      }
      @media(prefers-reduced-motion:reduce){
        .litlab-live-bulb,.litlab-live-glow,.litlab-live-rays{animation:none!important}
      }
    `;
    root.appendChild(style);

    const bulb=documentSvg.createElementNS(ns,'g');
    bulb.setAttribute('class','litlab-live-bulb');
    bulb.setAttribute('aria-hidden','true');
    bulb.innerHTML=`
      <circle class="litlab-live-glow" cx="938" cy="86" r="61" fill="#facc15" opacity=".095"/>
      <g class="litlab-live-rays" fill="none" stroke="#f6c537" stroke-width="8.5" stroke-linecap="round">
        <path d="M938 29V11"/>
        <path d="M894 46l-14-14"/>
        <path d="M982 46l14-14"/>
      </g>
      <path d="M938 39c-28 0-47 20-47 46 0 17 9 31 23 40 5 4 8 9 8 15h32c0-6 3-11 8-15 14-9 23-23 23-40 0-26-19-46-47-46Z" fill="#fff8ca" stroke="#f1bf2d" stroke-width="7.8" stroke-linejoin="round"/>
      <path d="M921 80l17 17 17-17M938 97v32" fill="none" stroke="#dfa719" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M938 121v12" fill="none" stroke="#dfa719" stroke-width="11" stroke-linecap="round"/>
    `;
    root.appendChild(bulb);

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
  return createBrandImage({src:'./litlab-logo.svg?v=19',darkInk:['#141a23'],prepare:'horizontal'},className,labelled);
}

export function createLitLabStackedLogo(className='litlab-brand-stacked',labelled=true){
  return createBrandImage({src:'./litlab-stacked.svg',darkInk:['#101822']},className,labelled);
}
