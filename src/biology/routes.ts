import type {ThemeId} from './curriculum/schema';
export type BiologyRoute = {kind: 'dashboard'} | {kind: 'theme'; id: ThemeId} | {kind: 'topic'; id: string; mode?: 'learn'|'revision'|'practice'|'sources'} | {kind: 'not-found'};
export const isBiologyRoute = (route: string) => /^biology(?:\/|$)/i.test(route.split('?')[0]);
export function parseBiologyRoute(hash: string): BiologyRoute {
  const route = hash.replace(/^#/, '').split('?')[0].replace(/\/$/, '');
  if (route === 'biology') return {kind: 'dashboard'};
  const theme = /^biology\/theme\/([A-D])$/.exec(route);
  if (theme) return {kind: 'theme', id: theme[1] as ThemeId};
  const lesson = /^biology\/topic\/(A1\.1)\/(learn|revision|practice|sources)$/.exec(route);
  if (lesson) return {kind:'topic',id:lesson[1],mode:lesson[2] as 'learn'|'revision'|'practice'|'sources'};
  const topic = /^biology\/topic\/([A-D][1-4]\.\d+)$/.exec(route);
  if (topic) return {kind: 'topic', id: topic[1]};
  return {kind: 'not-found'};
}
