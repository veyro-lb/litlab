import {useState} from 'react';
import {ArrowRight, ChartNoAxesColumnIncreasing, ListChecks, PenLine} from 'lucide-react';
import type {Level, ThemeId} from '../curriculum/schema';
import {practicePapers, practiceScopeLabel, practiceTopics, readPaper, readTheme, themeIds, topicPracticeHref} from './practice-selection';
import type {Paper} from './practice-selection';

const icons = {'1A': ListChecks, '1B': ChartNoAxesColumnIncreasing, '2': PenLine};

export default function PracticeHub({level, hash, theme}: {level: Level; hash: string; theme?: ThemeId}) {
  const params = new URLSearchParams(hash.split('?')[1]);
  const [paper, setPaper] = useState<Paper>(() => readPaper(params.get('paper')) ?? '1A');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | undefined>(theme);
  const [topicId, setTopicId] = useState(params.get('topic') ?? '');
  const options = practiceTopics(level, paper, selectedTheme);
  const selected = options.find(({topic}) => topic.id === topicId);
  const first = selected ?? options[0];
  const questionCount = selected?.count ?? options.reduce((total, option) => total + option.count, 0);
  const start = first && topicPracticeHref(first.topic.id, paper, undefined, selected ? undefined : selectedTheme ?? 'all');

  const Heading = theme ? 'h2' : 'h1';

  return <section className="bio-practice-hub" aria-labelledby="bio-practice-heading">
    <Heading id="bio-practice-heading">Practice questions</Heading>
    <p>Pick a paper, then practise a topic or work through a theme one topic at a time.</p>
    <fieldset className="bio-paper-fieldset">
      <legend>Choose a paper</legend>
      <div className="bio-paper-options">
        {practicePapers.map(option => {
          const Icon = icons[option.id];
          return <label className="bio-paper-option" key={option.id}>
            <input type="radio" name="bio-practice-paper" checked={paper === option.id} onChange={() => setPaper(option.id)}/>
            <Icon size={22} aria-hidden="true"/>
            <span><strong>{option.label}</strong><small>{option.description}</small></span>
          </label>;
        })}
      </div>
    </fieldset>
    <div className="bio-practice-scope">
      <div>
        <label htmlFor="bio-practice-theme">Theme</label>
        <select id="bio-practice-theme" value={selectedTheme ?? ''} onChange={event => {
          setSelectedTheme(readTheme(event.target.value));
          setTopicId('');
        }}>
          <option value="">All themes</option>
          {themeIds.map(id => <option value={id} key={id}>{practiceScopeLabel(id)}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="bio-practice-topic">Topic</label>
        <select id="bio-practice-topic" value={selected?.topic.id ?? ''} onChange={event => setTopicId(event.target.value)}>
          <option value="">All topics in this selection</option>
          {options.map(({topic, count}) => <option key={topic.id} value={topic.id}>{topic.id} · {topic.title} ({count})</option>)}
        </select>
      </div>
    </div>
    <div className="bio-practice-launch">
      <p role="status">{questionCount ? `${questionCount} ${questionCount === 1 ? 'question' : 'questions'} · ${level}` : `No Paper ${paper} questions in this selection. Choose another paper or theme.`}</p>
      {start && <a className="bio-primary" href={start}>Start practice <ArrowRight size={17} aria-hidden="true"/></a>}
    </div>
  </section>;
}
