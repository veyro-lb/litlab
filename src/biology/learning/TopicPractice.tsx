import {useEffect, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import type {Level, Topic} from '../curriculum/schema';
import {inScope} from './content';
import type {Lesson, StudyState} from './content';
import {ChoiceQuestion, WrittenQuestion} from './StudyQuestion';
import type {UpdateStudy} from './StudyQuestion';
import UnderstandingLabel from './UnderstandingLabel';
import {practiceHubHref, practicePapers, practiceScopeLabel, practiceTopics, readPaper, readTheme, topicPracticeHref} from './practice-selection';

export default function TopicPractice({lesson, topic, level, hash, requestedId, study, update, revisit}: {
  lesson: Lesson;
  topic: Topic;
  level: Level;
  hash: string;
  requestedId: string | null;
  study: StudyState;
  update: UpdateStudy;
  revisit: (id: string) => void;
}) {
  const params = new URLSearchParams(hash.split('?')[1]);
  const paper = readPaper(params.get('paper'));
  const scope = params.get('scope');
  const group = readTheme(scope);
  const topicRun = paper && !requestedId && (scope === 'all' || group === topic.theme) ? practiceTopics(level, paper, group) : [];
  const position = topicRun.findIndex(item => item.topic.id === topic.id);
  const previous = position > 0 ? topicRun[position - 1] : undefined;
  const next = position >= 0 ? topicRun[position + 1] : undefined;
  const runScope = scope === 'all' ? 'all' : group;
  const targeted = lesson.questions.filter(question =>
    inScope(question, level) &&
    (!requestedId || question.understandingIds.includes(requestedId))
  );
  const questions = paper ? targeted.filter(question => question.paper === paper) : targeted;
  const choices = questions.filter(question => question.options?.length);
  const written = questions.filter(question => question.markingPoints?.length);
  const attempted = choices.filter(question => study.answers[question.id]);
  const missed = attempted.filter(question => !question.options?.some(option => option.id === study.answers[question.id] && option.correct));
  const [reviewIds, setReviewIds] = useState<string[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const questionPanel = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const beforeReview = useRef<string | undefined>(undefined);
  const queue = reviewIds ? choices.filter(question => reviewIds.includes(question.id)) : questions;
  const activeIndex = Math.max(0, queue.findIndex(question => question.id === selectedId));
  const question = queue[activeIndex];
  const hasNextQuestion = activeIndex + 1 < queue.length;

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    questionPanel.current?.focus();
  }, [selectedId, reviewIds]);

  function goTo(id: string) {
    if (id === question?.id) return;
    moveFocus.current = true;
    setSelectedId(id);
  }

  function toggleMissed() {
    if (!reviewIds) beforeReview.current = question?.id;
    setReviewIds(reviewIds ? null : missed.map(item => item.id));
    setSelectedId(reviewIds ? beforeReview.current : undefined);
    moveFocus.current = true;
  }

  return <section className="bio-practice">
    <a className="bio-back" href={practiceHubHref(paper, position >= 0 ? group : topic.theme, position >= 0 ? undefined : topic.id)}>
      <ArrowLeft size={16} aria-hidden="true"/> Change paper, theme or topic
    </a>
    <h2>{paper ? `Paper ${paper} practice` : 'Practice questions'}</h2>
    {position >= 0 && <p>{practiceScopeLabel(group)} · Topic {position + 1} of {topicRun.length}</p>}
    <nav className="bio-practice-filters" aria-label="Practice paper">
      <a href={topicPracticeHref(topic.id, undefined, requestedId ?? undefined)} aria-current={!paper ? 'page' : undefined}>All papers</a>
      {practicePapers.map(option => {
        const matching = position >= 0 ? practiceTopics(level, option.id, group) : [];
        const target = matching.find(item => item.topic.id === topic.id) ?? matching[0];
        return <a key={option.id}
          href={topicPracticeHref(target?.topic.id ?? topic.id, option.id, requestedId ?? undefined, target && runScope)}
          aria-current={paper === option.id ? 'page' : undefined}>{option.label}</a>;
      })}
    </nav>
    {requestedId && <p className="bio-practice-target">Questions for {requestedId} · <a href={topicPracticeHref(topic.id, paper)}>Show all topic questions</a></p>}
    <div className="bio-practice-status" role="status">
      {choices.length > 0 && <span>{attempted.length} of {choices.length} attempted · {attempted.length - missed.length} correct · {missed.length} to revisit</span>}
      {written.length > 0 && <span>{written.length} written-response {written.length === 1 ? 'question' : 'questions'}</span>}
      {questions.length === 0 && <span>No questions for this selection. Choose another paper or topic.</span>}
    </div>
    {question && <>
      <div className="bio-practice-question-picker">
        <div>
          <span>{reviewIds ? 'Missed question' : 'Question'} {activeIndex + 1} of {queue.length}</span>
          {queue.length > 1 && <select aria-label="Jump to a question" value={question.id} onChange={event => setSelectedId(event.target.value)}>
            {queue.map((item, index) => {
              const answered = attempted.some(choice => choice.id === item.id);
              const status = answered ? (missed.some(choice => choice.id === item.id) ? ' · Revisit' : ' · Correct')
                : study.revealed[item.id] ? ' · Mark scheme viewed' : '';
              return <option key={item.id} value={item.id}>Question {index + 1}{status}</option>;
            })}
          </select>}
        </div>
        {(reviewIds || missed.length > 0) && <button className="bio-btn-quiet" type="button" onClick={toggleMissed}>
          {reviewIds ? 'Back to all questions' : 'Review missed questions'}
        </button>}
      </div>
      <div className="bio-practice-question-panel" role="group" tabIndex={-1} ref={questionPanel}
        aria-label={`Question ${activeIndex + 1} of ${queue.length}. ${question.prompt}`}>
        {question.options?.length ? <div className="bio-practice-choice" key={question.id}>
          <span className="bio-eyebrow">PAPER {question.paper} STYLE{question.level === 'HL' ? ' · ADDITIONAL HL' : ''}</span>
          <p className="bio-question-syllabus">Syllabus: <UnderstandingLabel topic={topic} ids={question.understandingIds}/></p>
          <ChoiceQuestion item={{...question, kind: 'selection', options: question.options}} study={study} update={update} returnTo={() => revisit(question.sectionId)}/>
        </div> : <WrittenQuestion key={question.id} topic={topic} item={question} study={study} update={update}/>}
      </div>
      {queue.length > 1 && <nav className="bio-practice-question-nav" aria-label="Questions in this set">
        {activeIndex > 0 && <button className="bio-btn-quiet" type="button" onClick={() => goTo(queue[activeIndex - 1].id)}>
          <ArrowLeft size={17} aria-hidden="true"/> Previous question
        </button>}
        {hasNextQuestion && <button className="bio-btn-primary" type="button" onClick={() => goTo(queue[activeIndex + 1].id)}>
          Next question <ArrowRight size={17} aria-hidden="true"/>
        </button>}
      </nav>}
    </>}
    {position >= 0 && !hasNextQuestion && !reviewIds && <nav className="bio-practice-pagination" aria-label="Topics in this practice selection">
      {previous && <a className="bio-secondary" href={topicPracticeHref(previous.topic.id, paper, undefined, runScope)}><ArrowLeft size={16} aria-hidden="true"/> {previous.topic.title}</a>}
      {next
        ? <a className="bio-primary" href={topicPracticeHref(next.topic.id, paper, undefined, runScope)}>Next topic: {next.topic.title} <ArrowRight size={16} aria-hidden="true"/></a>
        : <a className="bio-secondary" href={practiceHubHref(paper, group)}>Choose another practice set <ArrowRight size={16} aria-hidden="true"/></a>}
    </nav>}
  </section>;
}
