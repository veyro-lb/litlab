export interface DrawingRequirement {id:string;topicId:string;understandingId:string;title:string;guidePage:number;sourceCredit?:string;checks:string[];reference:string|null;handoutPage:number|null;kind:'required'|'skill'|'practice';level:'shared'|'HL'}
export const drawingRequirements:DrawingRequirement[];
export function requirementLabel(kind:string):string;
