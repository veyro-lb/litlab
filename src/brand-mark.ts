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
        animation:litlabLiveBulbPulse 7.2s cubic-bezier(.4,0,.2,1) infinite;
      }
      .litlab-live-glass{animation:litlabLiveBulbGlass 8.8s steps(1,end) infinite}
      .litlab-live-filament,.litlab-live-neck{animation:litlabLiveBulbFilament 8.8s steps(1,end) infinite}
      .litlab-live-glow{
        transform-box:fill-box;
        transform-origin:center;
        animation:litlabLiveBulbGlow 8.8s linear infinite;
      }
      .litlab-live-rays{animation:litlabLiveBulbRays 8.8s steps(1,end) infinite}
      @keyframes litlabLiveBulbPulse{
        0%,100%{transform:scale(1)}
        46%{transform:scale(1.008)}
        58%{transform:scale(1.014)}
        72%{transform:scale(1.006)}
      }
      @keyframes litlabLiveBulbGlass{
        0%,19.5%,26.5%,62%,68%,100%{fill:#fff8ca;stroke:#f1bf2d}
        20.4%{fill:#f0f1f3;stroke:#b4bac3}
        21.6%{fill:#dfe2e6;stroke:#8f97a2}
        23%{fill:#fff0aa;stroke:#d8aa27}
        24.1%{fill:#e7e9ec;stroke:#9ca3ad}
        25.3%{fill:#fff8ca;stroke:#f1bf2d}
        62.8%{fill:#f1f2f4;stroke:#b8bdc6}
        64.2%{fill:#e1e4e8;stroke:#9299a4}
        65.5%{fill:#fff2af;stroke:#ddaf2a}
        66.6%{fill:#e8eaed;stroke:#a1a7b1}
        67.4%{fill:#fff8ca;stroke:#f1bf2d}
      }
      @keyframes litlabLiveBulbFilament{
        0%,19.5%,26.5%,62%,68%,100%{stroke:#dfa719}
        20.4%{stroke:#a3a9b1}
        21.6%{stroke:#808791}
        23%{stroke:#bd8d17}
        24.1%{stroke:#8f969f}
        25.3%{stroke:#dfa719}
        62.8%{stroke:#a6abb3}
        64.2%{stroke:#838a94}
        65.5%{stroke:#c49319}
        66.6%{stroke:#9299a3}
        67.4%{stroke:#dfa719}
      }
      @keyframes litlabLiveBulbGlow{
        0%,19.5%,26.5%,62%,68%,100%{opacity:.16;transform:scale(1.02)}
        20.4%{opacity:.055;transform:scale(.97)}
        21.6%{opacity:0;transform:scale(.91)}
        23%{opacity:.11;transform:scale(.99)}
        24.1%{opacity:.008;transform:scale(.92)}
        25.3%{opacity:.19;transform:scale(1.04)}
        62.8%{opacity:.05;transform:scale(.97)}
        64.2%{opacity:0;transform:scale(.91)}
        65.5%{opacity:.12;transform:scale(1)}
        66.6%{opacity:.01;transform:scale(.93)}
        67.4%{opacity:.18;transform:scale(1.035)}
      }
      @keyframes litlabLiveBulbRays{
        0%,19.5%,26.5%,62%,68%,100%{opacity:.95}
        20.4%{opacity:.24}
        21.6%{opacity:0}
        23%{opacity:.72}
        24.1%{opacity:.05}
        25.3%{opacity:1}
        62.8%{opacity:.2}
        64.2%{opacity:0}
        65.5%{opacity:.74}
        66.6%{opacity:.05}
        67.4%{opacity:1}
      }
      @media(prefers-reduced-motion:reduce){
        .litlab-live-bulb,.litlab-live-glass,.litlab-live-filament,.litlab-live-neck,.litlab-live-glow,.litlab-live-rays{animation:none!important}
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
      <path class="litlab-live-glass" d="M938 31c-31 0-52 22-52 51 0 19 10 34 25 44 6 4 9 10 9 16h36c0-6 3-12 9-16 15-10 25-25 25-44 0-29-21-51-52-51Z" fill="#fff8ca" stroke="#f1bf2d" stroke-width="8.4" stroke-linejoin="round"/>
      <path class="litlab-live-filament" d="M919 76l19 19 19-19M938 95v34" fill="none" stroke="#dfa719" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="litlab-live-neck" d="M938 120v13" fill="none" stroke="#dfa719" stroke-width="12" stroke-linecap="round"/>
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
  return createBrandImage({src:'./litlab-logo.svg?v=25',darkInk:['#141a23'],prepare:'horizontal'},className,labelled);
}

export function createLitLabStackedLogo(className='litlab-brand-stacked',labelled=true){
  return createBrandImage({src:'./litlab-stacked.svg',darkInk:['#101822']},className,labelled);
}
