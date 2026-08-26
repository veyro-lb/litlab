import './books-cover-system.css';
import {bookProfiles,type BookProfile} from './books-data';

type CoverMotif='handmaid'|'surveillance'|'electric'|'persepolis'|'sun'|'voice'|'generic';
type CoverSpec={title?:string;motif:CoverMotif;base:string;wash:string;ink:string;accent:string};

const coverSpecs:Record<string,CoverSpec>={
  'handmaids-tale':{title:"THE HANDMAID'S TALE",motif:'handmaid',base:'#75152d',wash:'#d44958',ink:'#fff7ee',accent:'#f2cbbf'},
  'nineteen-eighty-four':{title:'1984',motif:'surveillance',base:'#090d14',wash:'#252b35',ink:'#f4efe7',accent:'#ef3e50'},
  frankenstein:{title:'FRANKENSTEIN',motif:'electric',base:'#07140f',wash:'#143725',ink:'#efffe7',accent:'#9beb62'},
  persepolis:{title:'PERSEPOLIS',motif:'persepolis',base:'#f1eadf',wash:'#d7cfc4',ink:'#171717',accent:'#cf413c'},
  'the-stranger':{title:'THE STRANGER',motif:'sun',base:'#e7a343',wash:'#f2cf78',ink:'#1d1711',accent:'#f16637'},
  'carol-ann-duffy':{title:'CAROL ANN DUFFY',motif:'voice',base:'#24143b',wash:'#5b347e',ink:'#fbf3ff',accent:'#d69cff'}
};

const fallbackSpec:CoverSpec={motif:'generic',base:'#19162f',wash:'#493b7c',ink:'#f8f6ff',accent:'#9b82ff'};
const esc=(value:string)=>value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch));
const compactLevel=(level:string)=>level.replace(/\s*studied work\s*/i,'').trim().toUpperCase()||'LITLAB';
const compactYear=(year:string)=>year==='Coming soon'?'COMING SOON':year.split('/')[0].trim();
let activeProfileId='';

function motifMarkup(motif:CoverMotif){
  if(motif==='handmaid')return `<div class="lit-cover-motif motif-handmaid"><i class="hm-halo"></i><i class="hm-face"></i><i class="hm-wing hm-left"></i><i class="hm-wing hm-right"></i><i class="hm-eye"></i></div>`;
  if(motif==='surveillance')return `<div class="lit-cover-motif motif-surveillance"><b>84</b><i class="sv-lens"></i><i class="sv-beam"></i><i class="sv-scan one"></i><i class="sv-scan two"></i></div>`;
  if(motif==='electric')return `<div class="lit-cover-motif motif-electric"><i class="el-bolt"></i><i class="el-body"></i><i class="el-stitch s1"></i><i class="el-stitch s2"></i><i class="el-stitch s3"></i><span>+</span></div>`;
  if(motif==='persepolis')return `<div class="lit-cover-motif motif-persepolis"><i class="pp-panel p1"></i><i class="pp-panel p2"></i><i class="pp-panel p3"></i><i class="pp-face"></i><i class="pp-hair"></i><i class="pp-scarf"></i></div>`;
  if(motif==='sun')return `<div class="lit-cover-motif motif-sun"><i class="sun-disc"></i><i class="sun-horizon"></i><i class="sun-figure"></i><i class="sun-shadow"></i></div>`;
  if(motif==='voice')return `<div class="lit-cover-motif motif-voice"><b>“</b><i class="voice-line v1"></i><i class="voice-line v2"></i><i class="voice-line v3"></i><span>VOICE</span></div>`;
  return `<div class="lit-cover-motif motif-generic"><b>LL</b><i></i><span>STUDY EDITION</span></div>`;
}

function profileById(id:string|undefined){return id?bookProfiles.find(profile=>profile.id===id):undefined}

function profileForCover(cover:HTMLElement):BookProfile|undefined{
  const explicit=profileById(cover.dataset.bookId);
  if(explicit)return explicit;

  const card=cover.closest<HTMLElement>('.books-profile-card[data-open-book]');
  const cardProfile=profileById(card?.dataset.openBook);
  if(cardProfile)return cardProfile;

  const profilePage=cover.closest<HTMLElement>('.books-profile-page');
  if(profilePage){
    const selected=profileById(profilePage.dataset.activeBook||activeProfileId);
    if(selected)return selected;
    const title=profilePage.querySelector<HTMLElement>('.book-profile-hero-copy h1')?.textContent?.trim();
    const byTitle=title?bookProfiles.find(profile=>profile.title===title||profile.title.split(';')[0].trim()===title):undefined;
    if(byTitle)return byTitle;
    const author=profilePage.querySelector<HTMLElement>('.book-byline')?.textContent?.trim();
    const byAuthor=author?bookProfiles.find(profile=>profile.author===author):undefined;
    if(byAuthor)return byAuthor;
  }

  if(cover.closest('.books-hero-art'))return profileById('handmaids-tale')||bookProfiles[0];
  return undefined;
}

function paintCover(cover:HTMLElement,profile:BookProfile){
  const hasCorrectArtwork=cover.dataset.litlabCover==='v3'&&cover.dataset.coverId===profile.id&&Boolean(cover.querySelector('.lit-cover-copy')&&cover.querySelector(`.motif-${coverSpecs[profile.id]?.motif||'generic'}`));
  if(hasCorrectArtwork)return;
  const spec=coverSpecs[profile.id]||fallbackSpec;
  cover.dataset.litlabCover='v3';
  cover.dataset.coverId=profile.id;
  cover.dataset.bookId=profile.id;
  cover.style.setProperty('--cover-base',spec.base);
  cover.style.setProperty('--cover-wash',spec.wash);
  cover.style.setProperty('--cover-ink',spec.ink);
  cover.style.setProperty('--cover-accent',spec.accent);
  cover.innerHTML=`
    <div class="lit-cover-texture"></div>
    <div class="lit-cover-series"><span>${esc(compactLevel(profile.level))}</span><b>LITLAB</b></div>
    ${motifMarkup(spec.motif)}
    <div class="lit-cover-copy"><strong>${esc(spec.title||profile.title.toUpperCase())}</strong><small>${esc(profile.author||'LITLAB STUDY PROFILE')}</small></div>
    <div class="lit-cover-foot"><span>STUDY EDITION</span><b>${esc(compactYear(profile.year))}</b></div>`;
}

function syncCovers(){
  document.querySelectorAll<HTMLElement>('.books-profile-card[data-open-book]').forEach(card=>{
    const profile=profileById(card.dataset.openBook);
    const cover=card.querySelector<HTMLElement>('.lit-book-cover');
    if(profile&&cover)paintCover(cover,profile);
  });

  const profilePage=document.querySelector<HTMLElement>('.books-profile-page');
  if(profilePage){
    const cover=profilePage.querySelector<HTMLElement>('.book-profile-cover-wrap .lit-book-cover');
    if(cover){
      const profile=profileForCover(cover);
      if(profile){activeProfileId=profile.id;profilePage.dataset.activeBook=profile.id;paintCover(cover,profile)}
    }
  }

  const hero=document.querySelector<HTMLElement>('.books-library-page .books-hero-art .lit-book-cover');
  const heroProfile=profileById('handmaids-tale')||bookProfiles[0];
  if(hero&&heroProfile)paintCover(hero,heroProfile);
}

let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;syncCovers()})}

const root=document.getElementById('root');
if(root){
  root.addEventListener('click',event=>{
    const target=event.target as HTMLElement|null;
    const card=target?.closest<HTMLElement>('[data-open-book]');
    if(card?.dataset.openBook)activeProfileId=card.dataset.openBook;
  },true);
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
}
window.addEventListener('hashchange',()=>setTimeout(schedule,60));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
