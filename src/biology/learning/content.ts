import raw from './water/lesson.json';
import type {Level} from '../curriculum/schema';
export type WaterLesson = typeof raw;
export type Section = WaterLesson['sections'][number];
export type Choice = WaterLesson['sections'][number]['interactions'][number];
export type Question = WaterLesson['questions'][number];
export type Asset = WaterLesson['assets'][number];
export const waterLesson = raw;
export const inScope = (item: {level: string}, level: Level) => level === 'HL' || item.level === 'shared';
// Ephemeral tab memory only. No identity, localStorage, cloud writes or completion claims.
// It survives subject/route unmounts, but a full refresh intentionally starts a new study session.
export interface StudyState {answers: Record<string,string>; drafts: Record<string,string>; revealed: Record<string,boolean>; labels: boolean; sectionId: string}
const sessions = new Map<string,StudyState>();
export function readStudy(id: string): StudyState {
  return sessions.get(id) ?? {answers:{},drafts:{},revealed:{},labels:true,sectionId:'water-1'};
}
export function saveStudy(id: string, state: StudyState) {sessions.set(id,state);}
