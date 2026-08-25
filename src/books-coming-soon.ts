import './books-coming-soon.css';
import {bookProfiles,type BookProfile} from './books-data';

const emptyProfile=(id:string,title:string,level:string):BookProfile=>({
  id,title,author:'',year:'Coming soon',form:'',language:'',level,
  context:'',overview:'',characters:[],themes:[],symbols:[],motifs:[],choices:[],
  voice:'',structure:'',setting:'',moments:[],evidence:[],connections:[],arguments:[],misunderstandings:[],faqs:[]
});

const placeholders:BookProfile[]=[
  emptyProfile('carol-ann-duffy','Carol Ann Duffy','HL studied work'),
  emptyProfile('the-stranger','The Stranger','SL studied work')
];

for(const profile of placeholders){
  if(!bookProfiles.some(existing=>existing.id===profile.id))bookProfiles.push(profile);
}

const placeholderIds=new Set(placeholders.map(profile=>profile.id));
const route=()=>location.hash.slice(1).split('#')[0]||'home';

function polishLibrary(page:HTMLElement){
  page.querySelectorAll<HTMLElement>('[data-open-book]').forEach(card=>{
    const id=card.dataset.openBook||'';
    if(!placeholderIds.has(id))return;
    card.dataset.comingSoon='true';
    card.classList.add('books-coming-soon-card');
    const profile=bookProfiles.find(item=>item.id===id);if(!profile)return;
    const meta=card.querySelector<HTMLElement>('.books-card-copy>p');
    if(meta)meta.textContent=`${profile.level} • Coming soon`;
    const tags=card.querySelector<HTMLElement>('.books-card-tags');
    if(tags)tags.innerHTML='<small>COMING SOON</small>';
    const action=card.querySelector<HTMLElement>('.books-card-copy>b');
    if(action)action.innerHTML='Preview placeholder <i>→</i>';
  });
}

function turnProfileIntoPlaceholder(page:HTMLElement){
  const hero=page.querySelector<HTMLElement>('.book-profile-hero-copy h1');
  const title=hero?.textContent?.trim();
  if(!title)return;
  const profile=bookProfiles.find(item=>placeholderIds.has(item.id)&&item.title===title);
  if(!profile)return;
  const topLine=page.querySelector<HTMLElement>('.book-profile-topline');
  if(!topLine)return;
  const status=topLine.querySelector<HTMLElement>('span');
  if(status)status.textContent=`${profile.level} • Coming soon`;
  [...page.children].forEach(child=>{if(child!==topLine)child.remove()});
  page.className='page books-profile-page books-coming-soon-page';
  const shell=document.createElement('section');
  shell.className='books-coming-soon-shell';
  shell.innerHTML=`
    <div class="books-coming-soon-kicker">${profile.level.toUpperCase()}</div>
    <div class="books-coming-soon-mark">LL</div>
    <h1>${profile.title}</h1>
    <strong>Coming Soon</strong>
    <p>This studied-work profile has been added to the LitLab library, but its revision content has not been published yet.</p>
    <div class="books-coming-soon-rule"></div>
    <small>Characters, themes, authorial choices, important moments, evidence, and comparison material will stay empty until the study document is added.</small>`;
  page.append(shell);
  window.scrollTo({top:0,behavior:'smooth'});
}

function sync(){
  if(route()!=='books')return;
  const library=document.querySelector<HTMLElement>('.books-library-page');if(library)polishLibrary(library);
  const profile=document.querySelector<HTMLElement>('.books-profile-page');if(profile)turnProfileIntoPlaceholder(profile);
}

let pending=false;
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync()})}
const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,80));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
