/// <reference types="vite/client" />
import catalog from './catalog.json';
import type {Lesson} from './lesson-contract';
const entries=catalog as Record<string,{topicId:string;path:string}>;
// Vite emits one lazy chunk per authored lesson; the dashboard does not import lesson bodies.
const imports=import.meta.glob<{default:Lesson}>('./*/lesson.json');
export async function loadLesson(id:string):Promise<Lesson>{
 const entry=entries[id];const load=entry&&imports[entry.path];
 if(!load)throw new Error('This lesson is not available.');
 return (await load()).default;
}
