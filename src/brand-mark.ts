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
      .litlab-live-bulb{
        transform-box:view-box;
        transform-origin:938px 133px;
        animation:litlabLiveBulbPulse 5.6s cubic-bezier(.4,0,.2,1) infinite,litlabLiveBulbFlicker 4.6s linear infinite;
      }
      .litlab-live-glow{
        transform-box:fill-box;
        transform-origin:center;
        animation:litlabLiveBulbGlow 4.6s linear infinite;
      }
      .litlab-live-rays{animation:litlabLiveBulbRays 4.6s linear infinite}
      @keyframes litlabLiveBulbPulse{
        0%,100%{transform:scale(1)}
        46%{transform:scale(1.008)}
        58%{transform:scale(1.018)}
        72%{transform:scale(1.006)}
      }
      @keyframes litlabLiveBulbFlicker{
        0%,8%,15.2%,34%,40.5%,58%,65.5%,82%,88.5%,100%{opacity:1}
        9%{opacity:.68}
        9.8%{opacity:.96}
        10.6%{opacity:.42}
        11.4%{opacity:.88}
        12.2%{opacity:.58}
        13%{opacity:1}
        35%{opacity:.78}
        35.8%{opacity:.48}
        36.6%{opacity:.93}
        37.4%{opacity:.66}
        38.2%{opacity:1}
        59%{opacity:.62}
        59.8%{opacity:.34}
        60.6%{opacity:.9}
        61.4%{opacity:.5}
        62.2%{opacity:.97}
        63%{opacity:1}
        83%{opacity:.76}
        83.8%{opacity:.46}
        84.6%{opacity:.92}
        85.4%{opacity:.6}
        86.2%{opacity:1}
      }
      @keyframes litlabLiveBulbGlow{
        0%,8%,15.2%,34%,40.5%,58%,65.5%,82%,88.5%,100%{opacity:.14;transform:scale(1)}
        9%{opacity:.07;transform:scale(.96)}
        10.6%{opacity:.025;transform:scale(.91)}
        11.4%{opacity:.11;transform:scale(.98)}
        12.2%{opacity:.045;transform:scale(.94)}
        13%{opacity:.16;transform:scale(1.025)}
        35.8%{opacity:.035;transform:scale(.92)}
        36.6%{opacity:.13;transform:scale(1)}
        38.2%{opacity:.18;transform:scale(1.04)}
        59.8%{opacity:.018;transform:scale(.9)}
        60.6%{opacity:.12;transform:scale(.99)}
        61.4%{opacity:.04;transform:scale(.93)}
        63%{opacity:.2;transform:scale(1.055)}
        83.8%{opacity:.035;transform:scale(.92)}
        84.6%{opacity:.13;transform:scale(1)}
        86.2%{opacity:.17;transform:scale(1.035)}
      }
      @keyframes litlabLiveBulbRays{
        0%,8%,15.2%,34%,40.5%,58%,65.5%,82%,88.5%,100%{opacity:.9}
        9%{opacity:.5}
        10.6%{opacity:.08}
        11.4%{opacity:.7}
        12.2%{opacity:.25}
        13%{opacity:1}
        35.8%{opacity:.14}
        36.6%{opacity:.78}
        38.2%{opacity:1}
        59.8%{opacity:.05}
        60.6%{opacity:.72}
        61.4%{opacity:.18}
        63%{opacity:1}
        83.8%{opacity:.13}
        84.6%{opacity:.76}
        86.2%{opacity:1}
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
      <circle class="litlab-live-glow" cx="938" cy="83" r="66" fill="#facc15" opacity=".10"/>
      <g class="litlab-live-rays" fill="none" stroke="#f6c537" stroke-width="9" stroke-linecap="round">
        <path d="M938 21V2"/>
        <path d="M890 42l-15-15"/>
        <path d="M986 42l15-15"/>
      </g>
      <path d="M938 31c-31 0-52 22-52 51 0 19 10 34 25 44 6 4 9 10 9 16h36c0-6 3-12 9-16 15-10 25-25 25-44 0-29-21-51-52-51Z" fill="#fff8ca" stroke="#f1bf2d" stroke-width="8.4" stroke-linejoin="round"/>
      <path d="M919 76l19 19 19-19M938 95v34" fill="none" stroke="#dfa719" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M938 120v13" fill="none" stroke="#dfa719" stroke-width="12" stroke-linecap="round"/>
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
  return createBrandImage({src:'./litlab-logo.svg?v=22',darkInk:['#141a23'],prepare:'horizontal'},className,labelled);
}

export function createLitLabStackedLogo(className='litlab-brand-stacked',labelled=true){
  return createBrandImage({src:'./litlab-stacked.svg',darkInk:['#101822']},className,labelled);
}
