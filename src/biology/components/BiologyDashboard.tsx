import type {Level} from '../curriculum/schema';
import {topics} from '../curriculum/manifest';
import CurriculumOverview from './CurriculumOverview';
import ResourceNav,{resourceFromHash} from './ResourceNav';
export default function BiologyDashboard({level,hash}:{level:Level;hash:string}){
 const resource=resourceFromHash(hash);
 const drafted=topics.filter(t=>Boolean(t.lessonId)).length;
 return <><header className="bio-course-header"><span className="bio-eyebrow">IB DIPLOMA · FIRST ASSESSMENT 2025</span><h1>Biology</h1><p>Explore the science, one connection at a time.</p><small>{drafted} teaching drafts · {topics.length-drafted} topics planned · Scientific review pending</small></header><ResourceNav active={resource}/>
 {resource==='sources'&&<section className="bio-course-bibliography"><h2>Our teaching references</h2><p><strong>Main coursebook:</strong> Clegg, Davis &amp; Talbot, <em>Biology for the IB Diploma Programme</em>, Third Edition (Hodder Education, 2023).</p><p><strong>Syllabus:</strong> IB Biology Guide, first assessment 2025. Open an available topic for its scientific references, figure provenance and review record.</p></section>}
 {resource==='flashcards'&&<p className="bio-resource-context">Authored recall prompts and diagram recall are available inside the {drafted} teaching drafts. Card position is not a mastery score.</p>}
 {resource==='practice'&&<p className="bio-resource-context">Original syllabus-mapped practice with explanatory feedback and written self-review. These are draft teaching questions, not official IB exam items.</p>}
 <CurriculumOverview level={level} resource={resource}/></>;
}
