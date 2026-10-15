import {ArrowUpRight} from 'lucide-react';
import type {Level, Topic} from '../curriculum/schema';
import {organizations, visibleUnderstandings} from '../curriculum/manifest';
export default function TopicCard({topic, level}: {topic: Topic; level: Level}) {
  return <a className="bio-topic-card" href={`#biology/topic/${topic.id}`} data-topic-id={topic.id}>
    <div className="bio-card-meta"><span>{topic.id}</span><span>{topic.level === 'HL' ? 'HL only' : 'SL + HL'}</span></div>
    <h3>{topic.title}</h3><p>{organizations[topic.organization-1]} · {visibleUnderstandings(topic, level).length} syllabus statements</p>
    <div className="bio-card-end"><span>Lesson in development</span><ArrowUpRight size={18} aria-hidden="true"/></div>
  </a>;
}
