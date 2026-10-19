import {useEffect,useState} from 'react';
import type {Level,Topic} from '../curriculum/schema';
import {loadLesson} from './lesson-loader';
import type {Lesson} from './content';
import LessonView from './LessonView';
import type {LessonMode} from './LessonView';
export default function LessonLoader({topic,level,mode,hash}:{topic:Topic;level:Level;mode:LessonMode;hash:string}){
 const [lesson,setLesson]=useState<Lesson>();const [error,setError]=useState('');
 useEffect(()=>{let live=true;setLesson(undefined);setError('');loadLesson(topic.lessonId!).then(x=>{if(live)setLesson(x)}).catch(()=>{if(live)setError('The lesson could not be loaded. Return to the overview and try again.')});return()=>{live=false}},[topic.lessonId]);
 if(topic.level==='HL'&&level==='SL')return <section className="bio-empty"><h1>This topic is HL only</h1><p>Select HL to open this draft.</p></section>;
 if(error)return <p role="alert">{error} <a href={`#biology/topic/${topic.id}`}>Topic overview</a></p>;
 if(!lesson)return <p role="status">Loading lesson…</p>;
 return <LessonView key={lesson.id} lesson={lesson} topic={topic} level={level} mode={mode} hash={hash}/>;
}
