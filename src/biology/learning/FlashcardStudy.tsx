import {useEffect, useId, useRef, useState} from 'react';
import type {PointerEvent} from 'react';
import {ArrowLeft, ArrowRight, RotateCcw} from 'lucide-react';
import type {Topic} from '../curriculum/schema';
import type {Lesson, Section, StudyState} from './content';
import type {UpdateStudy} from './StudyQuestion';
import ScientificFigure from './ScientificFigure';
import keyFacts from './flashcard-key-facts.json';

const facts: Record<string, string[][]> = keyFacts;
const swipeDistance = 56;
const interactive = 'a[href], button, input, select, textarea, summary, dialog, [contenteditable], [role="button"], [role="textbox"]';

function buildDeck(sections: Section[], understanding: string) {
  return sections
    .filter(section => !understanding || section.understandingIds.includes(understanding))
    .flatMap(section => {
      const authored = section.recall.map(card => ({
        ...card,
        prompt: card.prompt.replace(/^(?:Without (?:looking|notes)|Retrieve without notes):\s*/i, ''),
        section,
      }));
      const essentials = section.understandingIds.flatMap(id => (facts[id] ?? []).map(([prompt, answer], index) => ({
        id: `key:${id}:${index}`,
        prompt,
        answer,
        understandingIds: [id],
        section,
      })));
      return [...essentials, ...authored];
    });
}

export default function FlashcardStudy({lesson, topic, sections, requestedId, study, update}: {
  lesson: Lesson;
  topic: Topic;
  sections: Section[];
  requestedId: string | null;
  study: StudyState;
  update: UpdateStudy;
}) {
  const [filter,setFilter] = useState(requestedId ?? '');
  const [revealedCard,setRevealedCard] = useState<string>();
  const [direction,setDirection] = useState<'next' | 'previous'>();
  const deck = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const pointer = useRef<{id: number; x: number; y: number} | undefined>(undefined);
  const suppressClick = useRef(false);
  const uid = useId();
  const understanding = sections.some(section => section.understandingIds.includes(filter)) ? filter : '';
  const visibleUnderstandings = topic.understandings.filter(item => sections.some(section => section.understandingIds.includes(item.id)));
  const cards = buildDeck(sections, understanding);
  const positionKey = `flashcard:${understanding || 'all'}`;
  const savedPosition = study.drafts[positionKey];
  const savedCardIndex = cards.findIndex(card => card.id === savedPosition);
  const legacyCard = /^\d+$/.test(savedPosition ?? '')
    ? cards.filter(card => !card.id.startsWith('key:'))[Number(savedPosition)]
    : undefined;
  const index = savedCardIndex >= 0 ? savedCardIndex : Math.max(0,cards.findIndex(card => card.id === legacyCard?.id));
  const card = cards[index];
  const reveal = !!card && revealedCard === card.id;
  const sectionId = card?.understandingIds.find(id => id === understanding) ?? card?.understandingIds[0] ?? card?.section.understandingIds[0];
  const sectionTitle = topic.understandings.find(item => item.id === sectionId)?.studentTitle;
  const asset = lesson.assets.find(item => card?.section.assets.includes(item.id) && item.recallSrc && !item.withheldReason);

  function move(target: number) {
    const next = cards[target];
    if (!next || target === index) return;
    setDirection(target > index ? 'next' : 'previous');
    setRevealedCard(undefined);
    update(previous => ({...previous,drafts:{...previous.drafts,[positionKey]:next.id}}));
  }

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (!card || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const path = event.composedPath();
      const origin = path[0];
      const inDeck = deck.current !== null && path.includes(deck.current);
      if (!(origin instanceof Element) || path.some(element => element instanceof HTMLDialogElement)) return;
      if (event.code === 'Space') {
        if (origin.closest(interactive)) return;
        event.preventDefault();
        if (event.repeat) return;
        button.current?.focus();
        button.current?.click();
      }
      if (!inDeck || origin.closest('input, select, textarea, [contenteditable]')) return;
      const offset = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
      if (!offset) return;
      event.preventDefault();
      button.current?.focus({preventScroll:true});
      move(index + offset);
    }

    document.addEventListener('keydown',keydown);
    return () => document.removeEventListener('keydown',keydown);
  });

  function startSwipe(event: PointerEvent<HTMLButtonElement>) {
    suppressClick.current = false;
    if (event.pointerType === 'mouse' || !event.isPrimary) return;
    pointer.current = {id:event.pointerId,x:event.clientX,y:event.clientY};
  }

  function trackSwipe(event: PointerEvent<HTMLButtonElement>) {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
    const x = event.clientX - start.x;
    if (Math.abs(x) <= Math.max(10, Math.abs(event.clientY - start.y))) return;
    event.currentTarget.style.setProperty('--bio-card-drag',`${Math.min(40, Math.max(-40, x * .28))}px`);
  }

  function endSwipe(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = undefined;
    event.currentTarget.style.removeProperty('--bio-card-drag');
    if (cancelled) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.abs(x) < Math.max(16, Math.abs(y))) return;
    suppressClick.current = true;
    if (Math.abs(x) >= Math.max(swipeDistance, Math.abs(y) * 1.3)) move(index + (x < 0 ? 1 : -1));
  }

  return <section className="bio-flashcards" ref={deck} aria-labelledby={`${uid}-title`}>
    <div className="bio-deck-heading">
      <div>
        <span className="bio-eyebrow">{topic.id} · {topic.title}</span>
        <h2 id={`${uid}-title`}>Flashcards</h2>
      </div>
      <a className="bio-deck-link" href="#biology?resource=flashcards">Browse topics</a>
    </div>
    <label className="bio-deck-filter">
      Review
      <select value={understanding} onChange={event => {
        setFilter(event.target.value);
        setRevealedCard(undefined);
        setDirection(undefined);
      }}>
        <option value="">Entire topic</option>
        {visibleUnderstandings.map(item => <option key={item.id} value={item.id}>{item.id}{item.studentTitle ? ` · ${item.studentTitle}` : ''}</option>)}
      </select>
    </label>
    {card ? <>
      <div className="bio-deck-progress" role="status" aria-atomic="true">
        <span>{sectionId}{sectionTitle && ` · ${sectionTitle}`}{card.section.level === 'HL' && ' · HL'}</span>
        <strong>Card {index + 1} of {cards.length}</strong>
      </div>
      <progress className="bio-deck-meter" aria-label="Position in deck" value={index + 1} max={cards.length}/>
      <div className="bio-flashcard">
        <button
          ref={button}
          className="bio-card-button"
          type="button"
          aria-expanded={reveal}
          aria-controls={`${uid}-answer`}
          aria-label={reveal ? 'Hide answer' : 'Reveal answer'}
          aria-describedby={reveal ? `${uid}-question ${uid}-answer` : `${uid}-question`}
          aria-keyshortcuts="Space ArrowLeft ArrowRight"
          onClick={event => {
            if (suppressClick.current && event.detail !== 0) {
              suppressClick.current = false;
              return;
            }
            setRevealedCard(reveal ? undefined : card.id);
          }}
          onPointerDown={startSwipe}
          onPointerMove={trackSwipe}
          onPointerUp={endSwipe}
          onPointerCancel={event => endSwipe(event,true)}
        >
          <span key={card.id} className="bio-card-face" data-direction={direction}>
            <span className="bio-card-label">Question</span>
            <span className="bio-card-question" id={`${uid}-question`}>{card.prompt}</span>
            <span className="bio-flashcard-answer" id={`${uid}-answer`} hidden={!reveal}>
              <span className="bio-card-label">Answer</span>
              <span>{card.answer}</span>
            </span>
            <span className="bio-card-action"><RotateCcw size={16} aria-hidden="true"/>{reveal ? 'Hide answer' : 'Reveal answer'}</span>
          </span>
        </button>
        <p className="bio-sr-only" role="status" aria-atomic="true">{reveal ? `Answer. ${card.answer}` : ''}</p>
      </div>
      <p className="bio-deck-hint"><span>Tap to reveal or swipe to change cards.</span><span>Press <kbd>Space</kbd> to reveal or <kbd>←</kbd> <kbd>→</kbd> to change cards.</span></p>
      <div className="bio-deck-nav" aria-label="Card navigation" role="group">
        <button type="button" className="bio-btn-quiet" disabled={index === 0} onClick={() => move(index - 1)}><ArrowLeft size={17} aria-hidden="true"/> Previous card</button>
        <a className="bio-deck-link" href={`#biology/topic/${lesson.topicId}/learn?understanding=${sectionId}`}>Read the lesson</a>
        {index === cards.length - 1 && cards.length > 1
          ? <button type="button" className="bio-btn-quiet" onClick={() => {button.current?.focus({preventScroll:true});move(0)}}><RotateCcw size={16} aria-hidden="true"/> Restart deck</button>
          : <button type="button" className="bio-btn-primary" disabled={cards.length < 2} onClick={() => move(index + 1)}>Next card <ArrowRight size={17} aria-hidden="true"/></button>}
      </div>
      {asset && <details className="bio-flashcard-figure" key={asset.id}>
        <summary>Diagram for this understanding</summary>
        <p>Try naming the missing labels before revealing the answer.</p>
        <ScientificFigure asset={asset} hideLabels={!reveal}/>
      </details>}
    </> : <p>No cards in this understanding.</p>}
  </section>;
}
