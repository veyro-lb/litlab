import type {ThemeId} from './curriculum/schema';

export type LessonMode = 'learn' | 'cheat-sheets' | 'practice' | 'flashcards' | 'drawing';
export type BiologyRoute =
  | {kind: 'dashboard'}
  | {kind: 'sources'}
  | {kind: 'theme'; id: ThemeId}
  | {kind: 'topic'; id: string; mode?: LessonMode}
  | {kind: 'not-found'};

export const isBiologyRoute = (route: string) => /^biology(?:\/|$)/i.test(route.split('?')[0]);

export function parseBiologyRoute(hash: string): BiologyRoute {
  const [path, query] = hash.replace(/^#/, '').split('?', 2);
  const route = path.replace(/\/$/, '');
  if (route === 'biology/sources' || /^biology\/topic\/[A-D][1-4]\.\d+\/sources$/.test(route)) {
    return {kind: 'sources'};
  }
  const theme = /^biology\/theme\/([A-D])$/.exec(route);
  if ((route === 'biology' || theme) && new URLSearchParams(query).get('resource') === 'sources') {
    return {kind: 'sources'};
  }
  if (route === 'biology') return {kind: 'dashboard'};
  if (theme) return {kind: 'theme', id: theme[1] as ThemeId};
  const lesson = /^biology\/topic\/([A-D][1-4]\.\d+)\/(learn|cheat-sheets|revision|practice|flashcards|drawing)$/.exec(route);
  if (lesson) return {kind: 'topic', id: lesson[1], mode: lesson[2] === 'revision' ? 'cheat-sheets' : lesson[2] as LessonMode};
  const topic = /^biology\/topic\/([A-D][1-4]\.\d+)$/.exec(route);
  if (topic) return {kind: 'topic', id: topic[1]};
  return {kind: 'not-found'};
}
