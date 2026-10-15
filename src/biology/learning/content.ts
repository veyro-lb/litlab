export type {Section,Choice,Question,Asset,Lesson} from './lesson-contract';
export {inScope} from './lesson-contract';
// Tab memory only: no identity, persistence, cloud writes or mastery claims.
export interface StudyState {answers:Record<string,string>;drafts:Record<string,string>;revealed:Record<string,boolean>;labels:boolean;sectionId:string}
const sessions=new Map<string,StudyState>();
export function readStudy(id:string):StudyState {
 return sessions.get(id)??{answers:{},drafts:{},revealed:{},labels:true,sectionId:''};
}
export function saveStudy(id:string,state:StudyState){sessions.set(id,state)}
