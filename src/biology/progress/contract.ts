import type {Level} from '../curriculum/schema';
export const BIOLOGY_PREFERENCES_KEY = 'litlab:biology:preferences:v1';
export const BIOLOGY_PROGRESS_KEY = 'litlab:biology:progress:v1';
export interface BiologyProgress {
  version: 1;
  curriculumVersion: 'ib-biology-fa2025-v1';
  attempts: {understandingId: string; questionId: string; correct: boolean; at: string}[];
  bookmarks: string[];
  reviews: {understandingId: string; dueAt: string; basedOnAttemptIds: string[]}[];
}
export function readLevel(): Level {
  try { return localStorage.getItem(BIOLOGY_PREFERENCES_KEY) === 'HL' ? 'HL' : 'SL'; } catch { return 'SL'; }
}
export function saveLevel(level: Level) {
  try { localStorage.setItem(BIOLOGY_PREFERENCES_KEY, level); } catch { /* Selection remains usable without storage. */ }
}
