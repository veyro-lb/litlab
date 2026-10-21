import DrawingCatalogue from '../learning/drawing-practice/DrawingCatalogue';
import {ArrowRight, BookOpen, FlaskConical, Layers3, RotateCcw, Search} from 'lucide-react';
import type {Level} from '../curriculum/schema';
import {topics, visibleTopics, visibleUnderstandings} from '../curriculum/manifest';
import CurriculumOverview from './CurriculumOverview';
import ResourceNav, {resourceFromHash} from './ResourceNav';

export default function BiologyDashboard({level,hash}:{level:Level;hash:string}) {
  const resource = resourceFromHash(hash);
  const available = visibleTopics(level).filter(topic => Boolean(topic.lessonId));
  const starter = available.find(topic => visibleUnderstandings(topic,level).length > 0);
  const drafted = topics.filter(topic => Boolean(topic.lessonId)).length;
  const focusSearch = () => document.querySelector('[data-biology-host]')?.shadowRoot?.querySelector<HTMLInputElement>('#bio-topic-search')?.focus();
  const openTopics = () => document.querySelector('[data-biology-host]')?.shadowRoot?.querySelector('#bio-topic-browser')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  return <>
    <header className="bio-welcome" aria-labelledby="bio-welcome-title">
      <div className="bio-welcome-copy">
        <span className="bio-kicker"><FlaskConical size={15} aria-hidden="true"/> DP BIOLOGY · FIRST ASSESSMENT 2025</span>
        <h1 id="bio-welcome-title">Biology, made <em>clearer.</em></h1>
        <p>Explore life from molecules to ecosystems. Learn the ideas, connect the concepts, and practise what you understand — at your own pace.</p>
        <div className="bio-welcome-actions">
          <button type="button" className="bio-primary" onClick={openTopics}>Explore lessons <ArrowRight size={17} aria-hidden="true"/></button>
          <a className="bio-secondary" href="#biology?resource=practice">Practice questions <ArrowRight size={16} aria-hidden="true"/></a>
        </div>
      </div>
      <div className="bio-welcome-art" aria-label="Four levels of organization: molecules, cells, organisms, ecosystems">
        <span className="bio-art-caption">FROM THE SMALLEST SCALE TO THE BIG PICTURE</span>
        <svg viewBox="0 0 320 160" role="img" aria-label="Connected circles representing increasing biological organization">
          <path d="M26 111 C70 111 60 46 114 46 S166 126 216 102 S263 40 295 56" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 7" opacity=".45"/>
          <circle cx="29" cy="109" r="17" fill="#8ad9bf"/><circle cx="114" cy="46" r="24" fill="#60b5a6"/><circle cx="214" cy="103" r="31" fill="#388d86"/><circle cx="290" cy="56" r="21" fill="#1d746f"/>
          <circle cx="24" cy="104" r="4" fill="#fff" opacity=".85"/><circle cx="35" cy="116" r="4" fill="#fff" opacity=".85"/>
          <circle cx="104" cy="39" r="5" fill="#fff" opacity=".8"/><circle cx="122" cy="51" r="7" fill="#fff" opacity=".5"/>
          <path d="M202 86q18 6 13 27m-18-5q22-19 37-4" stroke="#fff" strokeWidth="2" fill="none" opacity=".7"/>
          <path d="M281 50l10-7 7 11-11 8z" stroke="#fff" strokeWidth="2" fill="none" opacity=".7"/>
        </svg>
        <div className="bio-art-scales"><span>Molecules</span><span>Cells</span><span>Organisms</span><span>Ecosystems</span></div>
        <div className="bio-art-bottom"><span>ONE CONNECTED SCIENCE</span><span className="bio-art-dots" aria-hidden="true">● ● ● ●</span></div>
      </div>
    </header>
    <ResourceNav active={resource}/>
    <section className="bio-quick-panel" aria-label="Quick study actions">
      {starter&&<a href={'#biology/topic/'+starter.id+'/learn?understanding='+visibleUnderstandings(starter,level)[0].id} className="bio-quick-item"><span className="bio-quick-icon"><BookOpen size={20} aria-hidden="true"/></span><span><strong>Begin a lesson</strong><small>{starter.id} · {starter.title}</small></span><ArrowRight size={16} aria-hidden="true"/></a>}
      <button type="button" className="bio-quick-item" onClick={focusSearch}><span className="bio-quick-icon"><Search size={20} aria-hidden="true"/></span><span><strong>Find a topic</strong><small>Search by name or syllabus code</small></span><ArrowRight size={16} aria-hidden="true"/></button>
      <a className="bio-quick-item" href="#biology?resource=revision"><span className="bio-quick-icon"><RotateCcw size={20} aria-hidden="true"/></span><span><strong>Review concepts</strong><small>Revisit the key explanations</small></span><ArrowRight size={16} aria-hidden="true"/></a>
    </section>
    {resource==='sources'&&<section className="bio-course-bibliography"><h2>Sources and scientific review</h2><p><strong>Curriculum:</strong> IB Biology Guide, first assessment 2025. <strong>Primary coursebook:</strong> Clegg, Davis &amp; Talbot, <em>Biology for the IB Diploma Programme</em>, Third Edition (Hodder Education, 2023). Open a topic's Sources view for detailed provenance and its review record.</p></section>}
    {resource==='practice'&&<p className="bio-resource-context">Practise with original, syllabus-mapped draft questions and explanatory feedback. These are not official IB examination questions.</p>}
    {resource==='revision'&&<p className="bio-resource-context">Revisit concise explanations, figures and recall prompts in each available lesson.</p>}

    {resource==='flashcards'&&<p className="bio-resource-context">Recall cards are available within teaching drafts. Opening or flipping a card does not indicate mastery.</p>}
    {resource==='drawing'?<DrawingCatalogue level={level}/>:<CurriculumOverview level={level} resource={resource}/>}
    <details className="bio-course-info"><summary><Layers3 size={16} aria-hidden="true"/> About this course and its review status</summary><p>{drafted} teaching drafts are catalogued, and {topics.length-drafted} topics are currently planned. Scientific review is pending; the materials are independent student resources, not certified content or IB-endorsed teaching material.</p></details>
  </>;
}
