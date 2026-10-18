import type {Lesson,Section} from '../lesson-contract';
import type {Level} from '../../curriculum/schema';
export interface DrawingLabel {id:string;name:string;synonyms:string[];clue:string;function:string}
export interface DrawingExercise {id:string;topicId:string;understandingId:string;assetId:string;level:'shared'|'HL';title:string;handoutPage:number;introduction:string;drawPrompt:string;labels:DrawingLabel[];conventions:string[];availabilityEvidence:string}
export const exercises:readonly DrawingExercise[];
export const figureDependencies:readonly {topicId:string;title:string;handoutPage:number}[];
export function normalizeLabel(value:unknown):string;
export function isCorrectLabel(label:DrawingLabel,answer:string):boolean;
export function availableExercises(lesson:Lesson,level:Level,sections:Section[]):DrawingExercise[];
