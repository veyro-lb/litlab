import {useEffect, useRef, useState} from 'react';
import {ArrowLeft, FlaskConical} from 'lucide-react';
import BiologyDashboard from './components/BiologyDashboard';
import CurriculumOverview from './components/CurriculumOverview';
import {resourceFromHash} from './components/ResourceNav';
import LessonLoader from './learning/LessonLoader';
import TopicOverview from './components/TopicOverview';
import {topics, themes} from './curriculum/manifest';
import type {Level} from './curriculum/schema';
import {parseBiologyRoute} from './routes';
import {readLevel, saveLevel} from './progress/contract';

export default function BiologyApp({hash}:{hash:string}) {
  const [level,setLevel]=useState<Level>(readLevel);
  const focusRef=useRef<HTMLDivElement>(null);
  const previousHash=useRef(hash);
  const route=parseBiologyRoute(hash);
  const topic=route.kind==='topic'?topics.find(t=>t.id===route.id):undefined;
  useEffect(()=>{
    const title=route.kind==='topic'&&topic?topic.id+' '+topic.title:route.kind==='theme'?themes[route.id].title:'Curriculum';
    document.title='BioLab — '+title+' | LitLab';
    if(previousHash.current!==hash){focusRef.current?.focus({preventScroll:true});previousHash.current=hash;}
  },[hash,topic,route.kind]);
  const missing=route.kind==='not-found'||(route.kind==='topic'&&!topic);
  return <div className="bio-app" ref={focusRef} tabIndex={-1}>
    <div className="bio-toolbar">
      <nav aria-label="Biology breadcrumb"><a href="#biology"><FlaskConical size={17} aria-hidden="true"/> BioLab</a>{route.kind!=='dashboard'&&<><span aria-hidden="true">/</span>{route.kind==='theme'?<span>Theme {route.id}</span>:topic?<><a href={'#biology/theme/'+topic.theme}>Theme {topic.theme}</a><span aria-hidden="true">/</span><span>{topic.id} · {topic.title}</span></>:<span>Page not found</span>}</>}</nav>
      <fieldset className="bio-level"><legend className="bio-sr-only">Course level</legend>{(['SL','HL'] as Level[]).map(l=><label key={l} title={l==='SL'?'Standard Level':'Higher Level'}><input type="radio" name="biology-level" value={l} checked={level===l} onChange={()=>{setLevel(l);saveLevel(l)}}/><span>{l}<span className="bio-level-long"> · {l==='SL'?'Standard':'Higher'}</span></span></label>)}</fieldset>
    </div>
    {missing?<section className="bio-empty"><span className="bio-eyebrow">PAGE NOT FOUND</span><h1>That topic isn’t on this map.</h1><p>Check the topic code or return to the curriculum.</p><a className="bio-primary" href="#biology"><ArrowLeft size={18} aria-hidden="true"/>All themes</a></section>
    :route.kind==='topic'&&topic?route.mode&&topic.lessonId?<LessonLoader topic={topic} level={level} mode={route.mode} hash={hash}/>:<TopicOverview topic={topic} level={level} hash={hash}/>
    :route.kind==='theme'?<><a className="bio-back" href="#biology"><ArrowLeft size={16} aria-hidden="true"/>All themes</a><header className={'bio-theme-intro bio-theme-intro-'+route.id}><span className="bio-kicker">THEME {route.id} · IB BIOLOGY</span><h1>{themes[route.id].title}</h1><p>{themes[route.id].description}</p></header><CurriculumOverview key={route.id} theme={route.id} level={level} resource={resourceFromHash(hash)}/></>
    :<BiologyDashboard level={level} hash={hash}/>}
    <div className="bio-disclaimer">BioLab is an independent student-made educational resource by LitLab. It is not affiliated with or endorsed by the International Baccalaureate Organization.</div>
  </div>;
}
