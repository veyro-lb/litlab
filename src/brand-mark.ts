const SVG_NS='http://www.w3.org/2000/svg';

export function createLitLabMark(className='litlab-ll-mark',labelled=false){
  const svg=document.createElementNS(SVG_NS,'svg');
  svg.setAttribute('viewBox','0 0 80 80');
  svg.setAttribute('class',className);
  svg.setAttribute('focusable','false');
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  if(labelled){
    svg.setAttribute('role','img');
    svg.setAttribute('aria-label','LitLab');
  }else{
    svg.setAttribute('aria-hidden','true');
  }
  svg.innerHTML=`
    <path class="ll-ink" d="M8 8C8 4.7 10.7 2 14 2h9c3.3 0 6 2.7 6 6v30.5c0 5.8 4.7 10.5 10.5 10.5H42c4.7 0 8.5 3.8 8.5 8.5v5.7L38.8 60c-6.2-2.1-12.4-3.8-18.8-5.1C12.9 53.4 8 47.2 8 40V8Z"/>
    <path class="ll-purple" d="M40 15c0-3.3 2.7-6 6-6h9c3.3 0 6 2.7 6 6v29.5C61 50.3 65.7 55 71.5 55H73c3.3 0 6 2.7 6 6 0 2.8-2 5.2-4.7 5.8l-13.8 3.1C52.6 71.7 45.8 74 40 78V15Z"/>
    <path class="ll-page-line" d="M7.5 58.5C18.6 63.4 29.8 64.7 39 74.2"/>
    <path class="ll-page-line" d="M8 65.5C20.3 68.2 30.5 70.2 39 77.3"/>
    <path class="ll-page-cut" d="M41.2 76.2C50.9 68.4 61.8 66.4 74.4 62.2"/>
    <path class="ll-page-line" d="M41.4 78.3C52.6 72.1 63.2 70.7 75.1 68.8"/>
  `;
  return svg;
}
