export type Level = 'SL' | 'HL';
export type ThemeId = 'A' | 'B' | 'C' | 'D';
export const CURRICULUM_VERSION = 'ib-biology-fa2025-v1' as const;
export type ReviewStatus = 'draft' | 'source-mapped' | 'scientific-review' | 'approved';
export interface Understanding {
  id: string;
  printedId: string;
  level: 'shared' | 'HL';
  pdfPage: number;
  guidePage: number;
  skillsReference: boolean;
  nosReference: boolean;
  review: ReviewStatus;
  draftSummary?: string;
}
export interface Topic {
  id: string;
  title: string;
  theme: ThemeId;
  organization: number;
  version: typeof CURRICULUM_VERSION;
  level: 'shared' | 'HL';
  pdfPage: number;
  review: ReviewStatus;
  availability: 'planned';
  questionReferences: {guiding: boolean; linking: boolean};
  understandings: Understanding[];
}
