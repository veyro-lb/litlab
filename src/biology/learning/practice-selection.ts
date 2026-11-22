import index from 'virtual:biolab-practice-index';
import {themes, visibleTopics} from '../curriculum/manifest';
import type {Level, ThemeId} from '../curriculum/schema';
import type {Question} from './lesson-contract';

export type Paper = Question['paper'];
export const practicePapers = [
  {id: '1A', label: 'Paper 1A', description: 'Multiple choice'},
  {id: '1B', label: 'Paper 1B', description: 'Data-based questions'},
  {id: '2', label: 'Paper 2', description: 'Short and extended responses'},
] as const;

export const themeIds: ThemeId[] = ['A', 'B', 'C', 'D'];

export function readPaper(value: string | null): Paper | undefined {
  return practicePapers.find(paper => paper.id === value)?.id;
}

export function readTheme(value: string | null): ThemeId | undefined {
  return themeIds.find(theme => theme === value);
}

export function practiceTopics(level: Level, paper: Paper, theme?: ThemeId) {
  return visibleTopics(level).flatMap(topic => {
    const count = index[topic.id]?.[paper]?.[level] ?? 0;
    if (!topic.lessonId || !count || (theme && topic.theme !== theme)) return [];
    return [{topic, count}];
  });
}

export function practiceHubHref(paper?: Paper, theme?: ThemeId, topicId?: string) {
  const params = new URLSearchParams({resource: 'practice'});
  if (paper) params.set('paper', paper);
  if (topicId) params.set('topic', topicId);
  return `${theme ? '#biology/theme/' + theme : '#biology'}?${params}`;
}

export function topicPracticeHref(topicId: string, paper?: Paper, understandingId?: string, scope?: ThemeId | 'all') {
  const params = new URLSearchParams();
  if (paper) params.set('paper', paper);
  if (understandingId) params.set('understanding', understandingId);
  if (scope) params.set('scope', scope);
  return `#biology/topic/${topicId}/practice${params.size ? '?' + params : ''}`;
}

export function practiceScopeLabel(theme?: ThemeId) {
  return theme ? `Theme ${theme} · ${themes[theme].title}` : 'All themes';
}
