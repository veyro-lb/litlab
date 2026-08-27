const SVG_NS='http://www.w3.org/2000/svg';

export function createLitLabMark(className='litlab-ll-mark',labelled=false){
  const svg=document.createElementNS(SVG_NS,'svg');
  svg.setAttribute('viewBox','0 0 64 64');
  svg.setAttribute('class',className);
  svg.setAttribute('focusable','false');
  if(labelled){
    svg.setAttribute('role','img');
    svg.setAttribute('aria-label','LitLab');
  }else{
    svg.setAttribute('aria-hidden','true');
  }
  svg.innerHTML=`
    <g class="ll-purple">
      <path d="M28 13.5h10.5c3.8 0 6.5 2.8 6.5 6.5v28.2h10.2c4.7 0 7.8 3.1 7.8 7.4V61H35.2C30.9 61 28 58 28 53.7V13.5Z"/>
      <path class="ll-page-line" d="M32.2 17.8h8.3v30.6"/>
    </g>
    <g class="ll-ink">
      <path d="M4 7.2C4 3.5 6.8 1 10.6 1h10.1c4 0 6.8 2.7 6.8 6.7v31.8h9.7c4.8 0 8 3.2 8 7.6v7H11.3C6.8 54.1 4 51 4 46.8V7.2Z"/>
      <path class="ll-page-cut" d="M8.4 41.7c1 5.5 4.4 8 10.3 8h18.7"/>
    </g>
  `;
  return svg;
}
