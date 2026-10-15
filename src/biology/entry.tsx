import {useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import BiologyApp from './BiologyApp';
import styles from './biology.css?inline';
// A React portal owns the entire shadow tree. Legacy document selectors and mutation
// observers cannot traverse this boundary; inherited design tokens still work.
export default function BiologyEntry({hash}: {hash: string}) {
  const host=useRef<HTMLDivElement>(null);
  const [shadow,setShadow]=useState<ShadowRoot | null>(null);
  useLayoutEffect(() => {
    if(host.current) setShadow(host.current.shadowRoot || host.current.attachShadow({mode:'open'}));
  },[]);
  return <div data-biology-host ref={host}>{shadow && createPortal(<><style>{styles}</style><BiologyApp hash={hash}/></>,shadow)}</div>;
}
