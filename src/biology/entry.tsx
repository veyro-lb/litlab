import {useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import BiologyApp from './BiologyApp';
import styles from './biology.css?inline';
import premiumStyles from './premium-student-interface.css?inline';
import drawingStyles from './learning/drawing-practice/drawing-practice.css?inline';
// The Biology portal is an isolated student interface: global site CSS cannot
// unexpectedly override the reader or navigation presentation.
export default function BiologyEntry({hash}: {hash: string}) {
  const host=useRef<HTMLDivElement>(null);
  const [shadow,setShadow]=useState<ShadowRoot | null>(null);
  useLayoutEffect(() => {
    if(host.current) setShadow(host.current.shadowRoot || host.current.attachShadow({mode:'open'}));
  },[]);
  return <div data-biology-host ref={host}>{shadow && createPortal(<><style>{styles+'\n'+premiumStyles+'\n'+drawingStyles}</style><BiologyApp hash={hash}/></>,shadow)}</div>;
}
