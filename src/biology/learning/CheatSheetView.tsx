import {useMemo} from 'react';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import type {Level, Topic} from '../curriculum/schema';
import ResourceNav from '../components/ResourceNav';
import type {Lesson} from './content';
import {getCheatSheet} from './cheat-sheet-data';
import CheatSheetPdf from './CheatSheetPdf';

export default function CheatSheetView({lesson, topic, level, requestedId}: {
  lesson: Lesson;
  topic: Topic;
  level: Level;
  requestedId: string | null;
}) {
  const base = `#biology/topic/${topic.id}`;
  const data = useMemo(() => getCheatSheet(lesson, topic, level), [lesson, topic, level]);

  return <article className="bio-sheets" data-mode="cheat-sheets">
    <ResourceNav active="cheat-sheets" topicId={topic.id} understandingId={requestedId ?? undefined}/>
    <a className="bio-sheets-back" href="#biology?resource=cheat-sheets"><ArrowLeft size={16} aria-hidden="true"/> All cheat sheets</a>
    <header className="bio-sheets-reader-heading">
      <div>
        <p className="bio-sheets-code">{data.subtitle}</p>
        <h1>{data.title}</h1>
      </div>
      <a href={`${base}/learn${requestedId ? `?understanding=${requestedId}` : ''}`}>Full explanation <ArrowRight size={15} aria-hidden="true"/></a>
    </header>
    <CheatSheetPdf data={data} requestedId={requestedId}/>
  </article>;
}
