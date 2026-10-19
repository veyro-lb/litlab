import raw from './registry.json';
import type {Level, ThemeId, Topic} from './schema';
// Import is checked by the structural validator in CI before publishing any registry change.
export const topics = raw as Topic[];
export const themes: Record<ThemeId, {title: string; description: string}> = {
  A: {title: 'Unity and diversity', description: 'Explore shared features of life and the diversity shaped by evolution.'},
  B: {title: 'Form and function', description: 'Connect biological structures with the roles they perform.'},
  C: {title: 'Interaction and interdependence', description: 'Follow the connections that make living systems work together.'},
  D: {title: 'Continuity and change', description: 'Investigate inheritance, regulation and change across generations.'},
};
export const organizations = ['Molecules', 'Cells', 'Organisms', 'Ecosystems'] as const;
export const visibleTopics = (level: Level) => topics.filter(t => level === 'HL' || t.level === 'shared');
export const visibleUnderstandings = (topic: Topic, level: Level) => topic.understandings.filter(u => level === 'HL' || u.level === 'shared');
export function findTopics(query: string, level: Level, theme?: ThemeId) {
  const q = query.trim().toLowerCase();
  return visibleTopics(level).filter(t => (!theme || t.theme === theme) &&
    `${t.id} ${t.title} ${themes[t.theme].title} ${organizations[t.organization-1]}`.toLowerCase().includes(q));
}
