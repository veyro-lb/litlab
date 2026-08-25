import { animate } from 'motion';
import './analysis-lab.css';

type LabOption={text:string;correct:boolean;hint?:string};
type LabStage={name:string;question:string;options:LabOption[];explanation:string;fragment:string};
type LabChallenge={title:string;focus:string;text:string;stages:LabStage[];model:string};

const challenges:LabChallenge[]=[
  {
    title:'The classroom window',
    focus:'Freedom vs obligation',
    text:'At the end of every lesson, Mara paused beside the classroom window. Beyond the glass, the football field shone in late sunlight, while the fluorescent lights above her hummed coldly. She pressed her palm to the pane, then turned back toward the stack of unfinished worksheets.',
    stages:[
      {
        name:'NOTICE',
        question:'Which detail gives you the strongest starting point for analysis?',
        options:[
          {text:'The contrast between the warm sunlight outside and the cold light inside.',correct:true},
          {text:'Mara is standing beside a window.',correct:false,hint:'That is an observation, but look for a pattern or contrast that creates meaning.'},
          {text:'There are worksheets on a desk.',correct:false,hint:'That detail matters later. First, notice what is being deliberately contrasted.'}
        ],
        explanation:'Strong analysis often begins with a pattern, contrast, shift, or repeated detail rather than a plot fact.',
        fragment:'warm sunlight outside ↔ cold fluorescent light inside'
      },
      {
        name:'CHOICE',
        question:'What authorial choice best describes how that contrast is created?',
        options:[
          {text:'Juxtaposition and contrasting imagery.',correct:true},
          {text:'A rhetorical question.',correct:false,hint:'There is no question being asked here. Focus on the two images placed against each other.'},
          {text:'Onomatopoeia only.',correct:false,hint:'The humming sound contributes atmosphere, but it does not explain the main contrast you identified.'}
        ],
        explanation:'Naming the choice precisely gives your analysis a clear mechanism: the writer juxtaposes two different environments.',
        fragment:'juxtaposition + contrasting imagery'
      },
      {
        name:'EFFECT',
        question:'What effect does this choice create in the moment?',
        options:[
          {text:'It creates a sharp divide between the attractive world outside and the restrictive classroom inside.',correct:true},
          {text:'It makes the paragraph longer.',correct:false,hint:'Think about the reader’s impression of the two spaces, not the paragraph’s physical length.'},
          {text:'It proves that Mara dislikes every part of school.',correct:false,hint:'That claim is too absolute. Stay close to what the contrast actually creates.'}
        ],
        explanation:'Effect should be specific. Explain what changes in atmosphere, emphasis, contrast, perspective, or response.',
        fragment:'creates a divide between freedom and restriction'
      },
      {
        name:'MEANING',
        question:'What interpretation is best supported by the details?',
        options:[
          {text:'The physical boundary of the window reflects Mara’s feeling that responsibility is limiting her freedom.',correct:true},
          {text:'The window means Mara wants to become a football player.',correct:false,hint:'That is possible in another text, but there is not enough evidence here to support it.'},
          {text:'The fluorescent lights represent technology.',correct:false,hint:'The stronger interpretation connects the setting contrast to Mara’s action and situation.'}
        ],
        explanation:'Interpretation moves beyond effect: ask what the pattern suggests about a character, relationship, idea, or situation.',
        fragment:'the glass mirrors Mara’s sense of confinement'
      },
      {
        name:'EVALUATION',
        question:'Which sentence actually evaluates the writer’s choice?',
        options:[
          {text:'The contrast is effective because the glass makes Mara’s emotional conflict visible without stating it directly.',correct:true},
          {text:'The writer uses juxtaposition.',correct:false,hint:'That identifies the technique, but it does not judge how well the choice creates meaning.'},
          {text:'The imagery is interesting.',correct:false,hint:'Evaluation needs a reason. Explain why the choice is effective, convincing, powerful, subtle, or limited.'}
        ],
        explanation:'Evaluation is a judgment supported by reasoning. Do not just add “effectively” — explain why the choice works.',
        fragment:'effectively makes an internal conflict visible'
      },
      {
        name:'WIDER THEME',
        question:'What larger idea does this analysis most convincingly connect to?',
        options:[
          {text:'The tension between personal freedom and obligation.',correct:true},
          {text:'The importance of sports.',correct:false,hint:'The field is part of the contrast, but the paragraph is more strongly about what the two spaces represent.'},
          {text:'Technology is always harmful.',correct:false,hint:'That conclusion is much broader than the evidence allows.'}
        ],
        explanation:'The final move connects the close detail back to the wider argument or theme without making an unsupported leap.',
        fragment:'reinforces the theme of freedom versus obligation'
      }
    ],
    model:'By juxtaposing the warm sunlight beyond the window with the cold fluorescent classroom, the writer effectively turns the glass into a visual boundary between freedom and obligation. The contrast externalises Mara’s sense of confinement, suggesting that her responsibilities restrict the autonomy she desires and reinforcing the wider theme of freedom versus control.'
  },
  {
    title:'The applause',
    focus:'Belonging vs exclusion',
    text:'“Together, we rise,” the gold slogan announced above the stage. The audience stood to applaud. In the third row, Sami kept his hands beneath his chair and folded the rejection letter into smaller and smaller squares until the paper disappeared inside his fist.',
    stages:[
      {
        name:'NOTICE',
        question:'Which pattern is most worth investigating?',
        options:[
          {text:'The public message of unity is placed beside Sami’s private experience of rejection.',correct:true},
          {text:'The slogan is written in gold.',correct:false,hint:'Colour may matter, but the stronger pattern involves the contradiction between the slogan and Sami’s experience.'},
          {text:'Sami is sitting in the third row.',correct:false,hint:'That fact alone does not yet create a strong analytical direction.'}
        ],
        explanation:'Look for contradiction: the scene says one thing publicly while showing something very different privately.',
        fragment:'public unity ↔ private rejection'
      },
      {
        name:'CHOICE',
        question:'Which authorial choice creates that contradiction most clearly?',
        options:[
          {text:'Juxtaposition with situational irony.',correct:true},
          {text:'A simile.',correct:false,hint:'There is no comparison using “like” or “as”. Focus on the contradiction between message and reality.'},
          {text:'Flashback.',correct:false,hint:'The scene stays in the present moment.'}
        ],
        explanation:'The unity slogan becomes ironic because the scene immediately shows someone who has been excluded.',
        fragment:'juxtaposition + situational irony'
      },
      {
        name:'EFFECT',
        question:'What effect does the repeated folding of the letter create?',
        options:[
          {text:'It makes Sami’s attempt to hide and compress his disappointment feel controlled but increasingly tense.',correct:true},
          {text:'It shows he enjoys origami.',correct:false,hint:'Stay connected to the rejection letter and the emotional context.'},
          {text:'It makes the audience seem louder.',correct:false,hint:'The action mainly tells us something about Sami’s response.'}
        ],
        explanation:'Physical actions can embody emotional pressure. Here, repetition turns a small gesture into a sign of contained tension.',
        fragment:'repeated folding embodies contained disappointment'
      },
      {
        name:'MEANING',
        question:'What does the scene suggest about the institution’s message?',
        options:[
          {text:'Its language of belonging may be idealistic or performative when individual experiences contradict it.',correct:true},
          {text:'Every institution deliberately lies.',correct:false,hint:'That generalisation goes far beyond the evidence in this short scene.'},
          {text:'Sami does not understand the slogan.',correct:false,hint:'The tension comes from the slogan’s contradiction with his situation, not from misunderstanding.'}
        ],
        explanation:'A careful interpretation stays arguable and evidence-based instead of turning one moment into an absolute claim.',
        fragment:'questions whether public belonging matches lived experience'
      },
      {
        name:'EVALUATION',
        question:'Which evaluation is strongest?',
        options:[
          {text:'The juxtaposition is especially effective because the celebratory slogan remains visible while Sami silently hides evidence of exclusion.',correct:true},
          {text:'The writer successfully uses a slogan.',correct:false,hint:'Explain what makes the choice successful and what meaning that success creates.'},
          {text:'The scene is very emotional.',correct:false,hint:'That is a reaction, not an evaluation of the writer’s method.'}
        ],
        explanation:'Good evaluation links success to method: why does this particular arrangement communicate the idea convincingly?',
        fragment:'effectively exposes the contradiction without explaining it outright'
      },
      {
        name:'WIDER THEME',
        question:'Which wider theme best fits the analysis?',
        options:[
          {text:'Belonging, exclusion, and the gap between public ideals and private experience.',correct:true},
          {text:'Paper folding as creativity.',correct:false,hint:'That ignores the social contradiction established by the rest of the scene.'},
          {text:'Gold is the most important colour.',correct:false,hint:'A single visual detail is not the widest idea the paragraph develops.'}
        ],
        explanation:'The close analysis now supports a broader conceptual claim without leaving the evidence behind.',
        fragment:'develops the theme of belonging versus exclusion'
      }
    ],
    model:'By juxtaposing the gold slogan “Together, we rise” with Sami’s silent handling of a rejection letter, the writer creates situational irony that exposes the gap between public ideals and private experience. The repeated folding of the letter effectively turns Sami’s disappointment into a controlled physical action, making his exclusion visible without direct explanation and developing the wider theme of belonging versus exclusion.'
  }
];

const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const route=()=>location.hash.slice(1).split('#')[0]||'home';
let retryTimer=0;

function createGuideButton(){
  const toc=document.querySelector<HTMLElement>('.toc');
  if(!toc||toc.querySelector('.analysis-lab-guide'))return;
  const button=document.createElement('button');
  button.type='button';
  button.className='analysis-lab-guide';
  button.textContent='Analysis Lab';
  button.setAttribute('aria-label','Jump to Analysis Lab within Start Here');
  button.addEventListener('click',()=>{
    const target=document.getElementById('analysis-lab');
    if(!target)return;
    target.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});
    button.blur();
  });
  const ladder=toc.querySelector('a[href="#ladder"]');
  if(ladder)ladder.insertAdjacentElement('afterend',button);
  else toc.append(button);
}

function optionButton(option:LabOption,index:number){
  const button=document.createElement('button');
  button.type='button';
  button.className='analysis-lab-option';
  button.dataset.index=String(index);
  button.innerHTML=`<span>${String.fromCharCode(65+index)}</span><b>${option.text}</b>`;
  return button;
}

function mountAnalysisLab(){
  if(route()!=='start')return false;
  createGuideButton();
  if(document.getElementById('analysis-lab'))return true;
  const ladder=document.getElementById('ladder');
  if(!ladder)return false;

  const section=document.createElement('section');
  section.id='analysis-lab';
  section.className='content-section analysis-lab-section';
  section.innerHTML=`
    <div class="section-number analysis-lab-number">LAB</div>
    <div class="section-body">
      <div class="analysis-lab-heading">
        <div>
          <span class="analysis-lab-kicker">✦ SIGNATURE LITLAB PRACTICE</span>
          <h2>Analysis Lab</h2>
          <p>Turn one small detail into a complete analytical argument. Work through <b>Notice → Choice → Effect → Meaning → Evaluation → Wider Theme</b>.</p>
        </div>
        <div class="analysis-lab-flask" aria-hidden="true"><span>6</span><small>thinking moves</small></div>
      </div>
      <div class="analysis-lab-root"></div>
      <div class="callout tip analysis-lab-note"><span aria-hidden="true">★</span><div><b>Why this matters</b><p>Technique spotting is only the beginning. The strongest analysis explains meaning and then evaluates how effectively the authorial choice creates that meaning.</p></div></div>
    </div>`;
  ladder.insertAdjacentElement('afterend',section);
  renderChallenge(section.querySelector<HTMLElement>('.analysis-lab-root')!,0);
  if(!reduceMotion())void animate(section,{opacity:[0,1],transform:['translateY(24px)','translateY(0px)']},{duration:.55,ease:[.2,.8,.2,1]});
  return true;
}

function renderChallenge(root:HTMLElement,challengeIndex:number){
  const challenge=challenges[challengeIndex];
  let stageIndex=0;
  let stageSolved=false;
  const solvedFragments:string[]=[];

  root.innerHTML=`
    <div class="analysis-lab-toolbar">
      <div class="analysis-lab-samples" role="group" aria-label="Practice samples">
        ${challenges.map((item,i)=>`<button type="button" class="analysis-lab-sample ${i===challengeIndex?'active':''}" data-sample="${i}"><span>${i+1}</span>${item.title}</button>`).join('')}
      </div>
      <span class="analysis-lab-focus">Focus: <b>${challenge.focus}</b></span>
    </div>
    <div class="analysis-lab-grid">
      <article class="analysis-lab-text-card">
        <span>ORIGINAL PRACTICE TEXT</span>
        <blockquote>${challenge.text}</blockquote>
        <small>Written for LitLab practice — not an official assessment text.</small>
      </article>
      <div class="analysis-lab-workbench">
        <div class="analysis-lab-progress-row">
          <span>Reasoning progress</span><b class="analysis-lab-progress-label">1 / 6</b>
        </div>
        <div class="analysis-lab-progress" role="progressbar" aria-valuemin="0" aria-valuemax="6" aria-valuenow="0"><i></i></div>
        <div class="analysis-lab-stepper" aria-label="Analysis steps">
          ${challenge.stages.map((stage,i)=>`<button type="button" data-step="${i}" ${i>0?'disabled':''}><span>${i+1}</span><small>${stage.name}</small></button>`).join('')}
        </div>
        <div class="analysis-lab-question-card">
          <div class="analysis-lab-question-head"><span class="analysis-lab-step-label"></span><h3></h3></div>
          <p class="analysis-lab-question"></p>
          <div class="analysis-lab-options"></div>
          <div class="analysis-lab-feedback" aria-live="polite"></div>
          <button type="button" class="btn primary analysis-lab-next" disabled>Continue <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </div>
    <div class="analysis-lab-chain-panel">
      <div><span>YOUR REASONING CHAIN</span><h3>Watch the analysis build.</h3></div>
      <div class="analysis-lab-chain"><em>Complete the first step to begin.</em></div>
    </div>
    <div class="analysis-lab-result" hidden>
      <span class="analysis-lab-result-kicker">✓ FULL ANALYSIS BUILT</span>
      <h3>Now compare the reasoning chain with a polished model.</h3>
      <p>${challenge.model}</p>
      <div class="analysis-lab-result-actions">
        <button type="button" class="btn secondary analysis-lab-restart">Try this sample again</button>
        <button type="button" class="btn primary analysis-lab-next-sample">Try another sample →</button>
      </div>
    </div>`;

  const optionsBox=root.querySelector<HTMLElement>('.analysis-lab-options')!;
  const feedback=root.querySelector<HTMLElement>('.analysis-lab-feedback')!;
  const next=root.querySelector<HTMLButtonElement>('.analysis-lab-next')!;
  const progress=root.querySelector<HTMLElement>('.analysis-lab-progress')!;
  const progressFill=progress.querySelector<HTMLElement>('i')!;
  const progressLabel=root.querySelector<HTMLElement>('.analysis-lab-progress-label')!;
  const chain=root.querySelector<HTMLElement>('.analysis-lab-chain')!;
  const result=root.querySelector<HTMLElement>('.analysis-lab-result')!;
  const stepButtons=Array.from(root.querySelectorAll<HTMLButtonElement>('.analysis-lab-stepper button'));

  function renderStage(){
    const stage=challenge.stages[stageIndex];
    stageSolved=solvedFragments.length>stageIndex;
    root.querySelector<HTMLElement>('.analysis-lab-step-label')!.textContent=`STEP ${stageIndex+1} OF 6`;
    root.querySelector<HTMLElement>('.analysis-lab-question-head h3')!.textContent=stage.name;
    root.querySelector<HTMLElement>('.analysis-lab-question')!.textContent=stage.question;
    progressLabel.textContent=`${Math.min(solvedFragments.length+1,6)} / 6`;
    optionsBox.replaceChildren(...stage.options.map(optionButton));
    feedback.className='analysis-lab-feedback';
    feedback.textContent=stageSolved?stage.explanation:'';
    next.disabled=!stageSolved;
    next.innerHTML=stageIndex===5?'Build final analysis <span aria-hidden="true">→</span>':'Continue <span aria-hidden="true">→</span>';

    stepButtons.forEach((button,i)=>{
      button.disabled=i>solvedFragments.length;
      button.classList.toggle('active',i===stageIndex);
      button.classList.toggle('done',i<solvedFragments.length);
    });

    optionsBox.querySelectorAll<HTMLButtonElement>('button').forEach((button,i)=>{
      button.addEventListener('click',()=>checkOption(button,stage.options[i]));
    });

    if(!reduceMotion())void animate(root.querySelector('.analysis-lab-question-card')!,{opacity:[.45,1],transform:['translateY(8px)','translateY(0px)']},{duration:.24,ease:'easeOut'});
  }

  function checkOption(button:HTMLButtonElement,option:LabOption){
    if(stageSolved)return;
    optionsBox.querySelectorAll('button').forEach(item=>item.classList.remove('wrong','correct'));
    if(option.correct){
      button.classList.add('correct');
      stageSolved=true;
      if(!solvedFragments[stageIndex])solvedFragments[stageIndex]=challenge.stages[stageIndex].fragment;
      feedback.className='analysis-lab-feedback correct';
      feedback.innerHTML=`<b>Good move.</b> ${challenge.stages[stageIndex].explanation}`;
      next.disabled=false;
      const completed=solvedFragments.length;
      progress.setAttribute('aria-valuenow',String(completed));
      progressFill.style.width=`${completed/6*100}%`;
      chain.innerHTML=solvedFragments.map((fragment,i)=>`<span><small>${challenge.stages[i].name}</small>${fragment}</span>`).join('<i aria-hidden="true">→</i>');
      stepButtons[stageIndex].classList.add('done');
      if(!reduceMotion()){
        void animate(button,{transform:['scale(.98)','scale(1.025)','scale(1)']},{type:'spring',stiffness:420,damping:24});
        void animate(feedback,{opacity:[0,1],transform:['translateY(-5px)','translateY(0px)']},{duration:.22,ease:'easeOut'});
      }
    }else{
      button.classList.add('wrong');
      feedback.className='analysis-lab-feedback wrong';
      feedback.innerHTML=`<b>Not quite.</b> ${option.hint||'Try another option and stay close to the evidence.'}`;
      if(!reduceMotion())void animate(button,{transform:['translateX(0px)','translateX(-5px)','translateX(5px)','translateX(0px)']},{duration:.28,ease:'easeOut'});
    }
  }

  next.addEventListener('click',()=>{
    if(!stageSolved)return;
    if(stageIndex<5){
      stageIndex+=1;
      renderStage();
      return;
    }
    localStorage.setItem('litlabAnalysisLabComplete','true');
    result.hidden=false;
    next.disabled=true;
    next.textContent='Completed ✓';
    progressLabel.textContent='6 / 6';
    progress.setAttribute('aria-valuenow','6');
    progressFill.style.width='100%';
    if(!reduceMotion())void animate(result,{opacity:[0,1],transform:['translateY(18px) scale(.985)','translateY(0px) scale(1)']},{type:'spring',stiffness:280,damping:26,mass:.9});
    setTimeout(()=>result.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'nearest'}),80);
  });

  stepButtons.forEach((button,i)=>button.addEventListener('click',()=>{
    if(i>solvedFragments.length)return;
    stageIndex=i;
    renderStage();
  }));

  root.querySelectorAll<HTMLButtonElement>('.analysis-lab-sample').forEach(button=>button.addEventListener('click',()=>renderChallenge(root,Number(button.dataset.sample||0))));
  root.querySelector<HTMLButtonElement>('.analysis-lab-restart')!.addEventListener('click',()=>renderChallenge(root,challengeIndex));
  root.querySelector<HTMLButtonElement>('.analysis-lab-next-sample')!.addEventListener('click',()=>renderChallenge(root,(challengeIndex+1)%challenges.length));
  renderStage();
}

function updateLabScrollSpy(){
  const button=document.querySelector<HTMLButtonElement>('.analysis-lab-guide');
  const section=document.getElementById('analysis-lab');
  if(route()!=='start'||!button||!section)return;
  const marker=Math.min(235,Math.max(165,window.innerHeight*.24));
  const rect=section.getBoundingClientRect();
  const active=rect.top<=marker&&rect.bottom>marker;
  button.classList.toggle('current',active);
  if(active){
    document.querySelectorAll<HTMLAnchorElement>('.toc a.current').forEach(link=>{
      link.classList.remove('current');
      link.removeAttribute('aria-current');
    });
    button.setAttribute('aria-current','location');
    const toc=button.closest<HTMLElement>('.toc');
    if(toc){
      const desired=button.offsetLeft-(toc.clientWidth-button.clientWidth)/2;
      toc.scrollTo({left:Math.max(0,desired),behavior:reduceMotion()?'auto':'smooth'});
    }
  }else button.removeAttribute('aria-current');
}

function scheduleMount(attempt=0){
  window.clearTimeout(retryTimer);
  retryTimer=window.setTimeout(()=>{
    if(mountAnalysisLab()){
      updateLabScrollSpy();
      return;
    }
    if(route()==='start'&&attempt<20)scheduleMount(attempt+1);
  },attempt?60:25);
}

window.addEventListener('scroll',updateLabScrollSpy,{passive:true});
window.addEventListener('resize',updateLabScrollSpy,{passive:true});
window.addEventListener('hashchange',()=>scheduleMount());

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scheduleMount(),{once:true});
else scheduleMount();
