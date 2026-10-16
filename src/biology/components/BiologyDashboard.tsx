import {ArrowRight, BookOpen, Layers3, Compass} from 'lucide-react';
import {themes, visibleTopics} from '../curriculum/manifest';
import type {Level, ThemeId} from '../curriculum/schema';
import CurriculumOverview from './CurriculumOverview';
export default function BiologyDashboard({level}: {level: Level}) {
  return <>
    <section className="bio-hero"><div><span className="bio-eyebrow">IB DIPLOMA · FIRST ASSESSMENT 2025</span><h1>Life is connected.<br/><em>Start seeing how.</em></h1><p>A clear map from molecules to ecosystems. Find your place in the biology syllabus, explore the scope, and see what’s coming next.</p><a className="bio-primary" href="#biology/topic/A1.1">Explore A1.1 Water <ArrowRight size={18} aria-hidden="true"/></a><span className="bio-hero-note">8 interactive topic drafts available · Scientific and teacher review ongoing</span></div>
    <aside className="bio-orientation"><span className="bio-eyebrow">START WITH THE BIG PICTURE</span><h2>Four themes.<br/> Every scale of life.</h2><p>Each theme connects molecules, cells, organisms and ecosystems.</p><div className="bio-scale-list">{['Molecules','Cells','Organisms','Ecosystems'].map((x,i) => <span key={x}><b>0{i+1}</b>{x}</span>)}</div><div className="bio-orientation-foot"><BookOpen size={18} aria-hidden="true"/><span>{visibleTopics(level).length} topics in your {level} curriculum</span></div></aside></section>
    <section className="bio-themes" aria-label="Explore the four themes">{(Object.entries(themes) as [ThemeId, typeof themes.A][]).map(([id,t]) => <a className={`bio-theme-link bio-theme-${id}`} href={`#biology/theme/${id}`} key={id}><span className="bio-theme-letter">{id}</span><h2>{t.title}</h2><p>{t.description}</p><span>Explore theme <ArrowRight size={16} aria-hidden="true"/></span></a>)}</section>
    <div className="bio-status-strip"><Compass size={21} aria-hidden="true"/><p><strong>Your map is ready. Start exploring Water.</strong> All 40 topics are mapped. A1.1 Water has an interactive draft awaiting qualified scientific review; the other 39 lessons remain planned.</p></div>
    <CurriculumOverview level={level}/>
    <section className="bio-future"><div><Layers3 size={22} aria-hidden="true"/><h2>Built for understanding that lasts</h2><p>These study tools are planned alongside reviewed lessons.</p></div><ul>{['My Progress','Flashcards','Practice Questions','Spaced Revision','Bookmarks','Exam Preparation'].map(x => <li key={x}><span>{x}</span><small>Planned</small></li>)}</ul></section>
  </>;
}
