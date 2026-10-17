import type {Level,ReviewStatus} from '../curriculum/schema';
export type Scope = 'shared'|'HL';
export interface Reference {id:string;title:string;url?:string;locator:string;accessedAt:string;level:Scope}
export interface Choice {kind:'selection';id:string;prompt:string;understandingIds:string[];options:{id:string;text:string;correct:boolean;feedback:string}[]}
export interface Recall {enrichment?:boolean;kind:'recall';id:string;prompt:string;answer:string;explanation:string;understandingIds:string[]}
export interface Asset {id:string;kind:string;src:string;recallSrc?:string;mobileSrc?:string;recallMobileSrc?:string;alt:string;captionTitle:string;withheldReason?:string;interpretation?:string;attribution:string;license:string;permissionEvidence:string;referenceIds:string[];level:Scope;review:ReviewStatus;sourceUrl?:string;originalUrl?:string;termsUrl?:string}
/** Contextual visuals are editorially authored for a specific understanding.
 * Numeric values must be real source values or explicitly declared calculations/models.
 */
export type LearningVisual =
 | {kind:'comparison'; title:string; afterBlock:number; headers:string[]; rows:string[][]; note?:string}
 | {kind:'sequence'; title:string; afterBlock:number; steps:{title:string;description:string}[]; note?:string}
 | {kind:'bars'; title:string; afterBlock:number; unit:string; values:{label:string;value:number}[]; note:string};
export interface AuthenticMicrograph {
 id:string; title:string; specimen:string; modality:'light'|'TEM'; referenceId:string;
 imageUrl:string; sourceUrl:string; author:string; license:string; licenseUrl:string;
 observationPrompt:string; expectedEvidence:string; scaleNote:string; limitation:string;
}
export interface TeachingBlock {title:string;explanation:string;referenceIds:string[]}
export interface MechanismChallenge {title:string;instructions:string;stages:{id:string;prompt:string;options:{id:string;text:string;correct:boolean;feedback:string}[];explanation:string}[]}
export interface Section {
 id:string;understandingIds:string[];level:Scope;guidingQuestion:string;explanation:string;revisionSummary:string;
 terms:string[];workedExample:string;misconceptions:{misconception:string;correction:string}[];
 claimReferences:{claim:string;referenceIds:string[]}[];referenceIds:string[];assets:string[];
 interactions:Choice[];recall:Recall[];guidePage:number;pdfPage:number;
 textbook?:{referenceId:string;printedPages:number[];pdfPages:number[]};
 support?:{simple:string;example:string;different:string;concepts:{title:string;keywords:string[];explanation:string}[]};
 figurePlacements?:{assetId:string;afterBlock:number}[];exampleTitle?:string;activityTitle?:string;
 prediction?:{context:string;question:Choice};scaffold?:string;
 teachingBlocks?:TeachingBlock[];enrichment?:{title:string;text:string;referenceIds:string[]};
 explorer?:{title:string;prompt?:string;features:{id:string;label:string;explanation:string}[]};
 mechanismChallenge?:MechanismChallenge;
 molecularViewer?:{title:string;structureId:string;url:string;prompt:string;fallback:string;referenceId:string};
 graphTables?:{caption:string;headers:string[];rows:(string|number)[][]}[];
 visuals?:LearningVisual[]; authenticMicrographs?:AuthenticMicrograph[];
}
export interface Question {
 id:string;paper:'1A'|'1B'|'2';kind:string;original:true;understandingIds:string[];level:Scope;prompt:string;marks:number;
 sectionId:string;referenceIds:string[];options?:Choice['options'];answer?:string;markingPoints?:string[];review?:ReviewStatus;
 data?:{caption:string;headers:string[];rows:(string|number)[][]};
}
export interface Lesson {
 schemaVersion:1;id:string;topicId:string;curriculumVersion:string;title:string;introduction:string;
 learningPath:string[];prerequisites:string[];objectives:string[];sections:Section[];questions:Question[];references:Reference[];assets:Asset[];summary:string;
 review:{status:ReviewStatus;sourceCheckedAt:string;reviewer:null|{name:string;qualification:string;reviewedAt:string};notes:string[]};
}
export const inScope=(item:{level:Scope},level:Level)=>level==='HL'||item.level==='shared';
export function isApproved(lesson:Lesson):boolean {
 const review=lesson.review;
 return lesson.references.length>0&&review.status==='approved'&&Boolean(review.reviewer?.name&&review.reviewer?.qualification&&review.reviewer?.reviewedAt);
}
