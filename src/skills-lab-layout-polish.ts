import './skills-lab-layout-polish.css';

const route=()=>location.hash.slice(1).split('#')[0]||'home';

function buildSkillsDashboard(){
  if(route()!=='skills')return;
  const page=document.querySelector<HTMLElement>('.skills-lab-page');
  if(!page)return;
  page.classList.add('skills-shell-v2');
  if(page.querySelector('.skills-practice-shell'))return;

  const nav=page.querySelector<HTMLElement>('.skills-tool-grid');
  const workspace=page.querySelector<HTMLElement>('.skills-workspace');
  if(!nav||!workspace||!nav.parentNode)return;

  const shell=document.createElement('section');
  shell.className='skills-practice-shell';
  shell.setAttribute('aria-label','Skills Lab practice dashboard');
  nav.parentNode.insertBefore(shell,nav);

  const sidebar=document.createElement('aside');
  sidebar.className='skills-lab-sidebar';
  sidebar.innerHTML=`
    <div class="skills-sidebar-head">
      <span>PRACTICE LABS</span>
      <h2>Choose a skill.</h2>
      <p>Switch labs anytime. Your reviewed labs and best scores stay saved on this device.</p>
    </div>`;

  const progress=page.querySelector<HTMLElement>('.skills-progress-summary');
  if(progress)sidebar.appendChild(progress);
  sidebar.appendChild(nav);
  shell.append(sidebar,workspace);
}

let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;buildSkillsDashboard()});
}

const root=document.getElementById('root');
if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,60));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
