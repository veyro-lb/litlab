function createBrandImage(src:string,className:string,labelled:boolean){
  const image=document.createElement('img');
  image.src=src;
  image.className=className;
  image.decoding='async';
  image.draggable=false;
  if(labelled){
    image.alt='LitLab';
  }else{
    image.alt='';
    image.setAttribute('aria-hidden','true');
  }
  return image;
}

export function createLitLabMark(className='litlab-ll-mark',labelled=false){
  return createBrandImage('./litlab-mark.svg',className,labelled);
}

export function createLitLabLogo(className='litlab-brand-horizontal',labelled=true){
  return createBrandImage('./litlab-logo.svg',className,labelled);
}

export function createLitLabStackedLogo(className='litlab-brand-stacked',labelled=true){
  return createBrandImage('./litlab-stacked.svg',className,labelled);
}
