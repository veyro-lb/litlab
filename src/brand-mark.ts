export function createLitLabMark(className='litlab-ll-mark',labelled=false){
  const image=document.createElement('img');
  image.className=className;
  image.src='/ibdplabs-mark.png?v=2';
  image.alt=labelled?'ibdplabs':'';
  image.decoding='async';
  image.draggable=false;
  if(!labelled)image.setAttribute('aria-hidden','true');
  return image;
}

export function createLitLabLogo(className='litlab-brand-horizontal',labelled=true){
  const image=document.createElement('img');
  image.className=className;
  image.src='/ibdplabs-logo.avif?v=2';
  image.alt=labelled?'ibdplabs':'';
  image.decoding='async';
  image.draggable=false;
  if(!labelled)image.setAttribute('aria-hidden','true');
  return image;
}

export function createLitLabStackedLogo(className='litlab-brand-stacked',labelled=true){
  return createLitLabLogo(className,labelled);
}
