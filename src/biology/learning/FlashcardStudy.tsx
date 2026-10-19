import type {Lesson,Section,StudyState} from './content';
import type {UpdateStudy} from './StudyQuestion';
import ScientificFigure from './ScientificFigure';
export default function FlashcardStudy({lesson,sections,requestedId,study,update}:{lesson:Lesson;sections:Section[];requestedId:string|null;study:StudyState;update:UpdateStudy}){
 const scoped=requestedId?sections.filter(s=>s.understandingIds.includes(requestedId)):sections;
 const cards=scoped.flatMap(section=>section.recall.map(card=>({card,section})));const key='flashcard:'+ (requestedId??'all');
 const index=Math.max(0,Number(study.drafts[key])||0)%Math.max(1,cards.length);const entry=cards[index];if(!entry)return <p>No authored recall cards in this scope.</p>;
 const {card,section}=entry,reveal=!!study.revealed['flash:'+card.id];const asset=lesson.assets.find(a=>section.assets.includes(a.id)&&a.recallSrc&&!a.withheldReason);
 const move=(delta:number)=>update(s=>({...s,drafts:{...s.drafts,[key]:String((index+delta+cards.length)%cards.length)}}));
 return <section className="bio-flashcards" aria-label="Authored Biology flashcards"><span className="bio-eyebrow">RETRIEVE BEFORE REVEALING</span><h2>{section.understandingIds.join(' / ')}</h2><p>Card {index+1} of {cards.length} · authored recall, with no mastery or scheduled-review estimate.</p><div className="bio-flashcard"><h3>{card.prompt}</h3>{reveal&&<p className="bio-flashcard-answer" role="status">{card.answer}</p>}<button type="button" aria-expanded={reveal} onClick={()=>update(s=>({...s,revealed:{...s.revealed,['flash:'+card.id]:!reveal}}))}>{reveal?'Hide answer':'Reveal answer'}</button></div>
 {asset&&<div className="bio-flashcard-figure"><h3>Reconstruct the visual</h3><p>Identify the missing labels and explain their biological connections before revealing them.</p><ScientificFigure key={asset.id} asset={asset} hideLabels={!reveal}/></div>}
 <div className="bio-section-controls"><button type="button" onClick={()=>move(-1)}>← Previous card</button><a href={`#biology/topic/${lesson.topicId}/learn?understanding=${section.understandingIds[0]}`}>Read the explanation</a><button type="button" onClick={()=>move(1)}>Next card →</button></div></section>;
}
