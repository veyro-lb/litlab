import type {ReviewStatus} from '../curriculum/schema';
export interface Reference {id: string; title: string; url?: string; locator: string; accessedAt: string}
export interface Review {status: ReviewStatus; references: Reference[]; reviewer?: {name: string; qualification: string; reviewedAt: string}; notes: string[]}
export interface ScientificAsset {
  id: string; kind: 'illustration' | 'micrograph' | 'molecular-model' | 'graph';
  src: string; alt: string; source: Reference; license: string; permissionEvidence: string;
  attribution: string; scientificReview: Review;
}
export type Interaction =
  | {kind: 'recall'; id: string; prompt: string; answer: string; explanation: string}
  | {kind: 'selection'; id: string; prompt: string; options: {id: string; text: string; correct: boolean; feedback: string}[]}
  | {kind: 'sequence'; id: string; prompt: string; orderedSteps: {id: string; text: string}[]; explanation: string}
  | {kind: 'diagram'; id: string; assetId: string; labels: {id: string; text: string; description: string}[]};
export interface PracticeQuestion {
  id: string; paper: '1A' | '1B' | '2'; original: true; understandingIds: string[];
  level: 'shared' | 'HL'; prompt: string; marks: number; answer: string;
  markingPoints: string[]; explanation: string; review: Review;
}
export interface LessonSection {
  id: string; title: string; understandingIds: string[]; level: 'shared' | 'HL';
  explanation: string; revisionSummary: string; claimReferences: {claim: string; referenceIds: string[]}[];
  workedExample?: string; misconceptions: {misconception: string; correction: string}[];
  assets: ScientificAsset[]; interactions: Interaction[]; recall: Interaction[];
}
export interface Lesson {
  id: string; topicId: string; curriculumVersion: 'ib-biology-fa2025-v1';
  title: string; introduction: string; prerequisites: string[]; objectives: string[];
  sections: LessonSection[]; summary: string; questions: PracticeQuestion[]; review: Review;
}
// A public lesson may be called approved only after identified, qualified human review.
export function isApproved(review: Review): boolean {
  return review.status === 'approved' && Boolean(review.reviewer?.name && review.reviewer?.qualification && review.reviewer?.reviewedAt) && review.references.length > 0;
}
