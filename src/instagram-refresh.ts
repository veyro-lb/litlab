const LITLAB_INSTAGRAM_URL='https://www.instagram.com/litlab_lb/';
const OLD_INSTAGRAM_HANDLE='@rhhs.ibdp.27';
const NEW_INSTAGRAM_HANDLE='@litlab_lb';

function replaceInstagramText(root:ParentNode){
  const walker=document.createTreeWalker(root as Node,NodeFilter.SHOW_TEXT);
  let node:Node|null;
  while((node=walker.nextNode())){
    if(node.nodeValue?.includes(OLD_INSTAGRAM_HANDLE)){
      node.nodeValue=node.nodeValue.replaceAll(OLD_INSTAGRAM_HANDLE,NEW_INSTAGRAM_HANDLE);
    }
  }
}

function refreshInstagramInfo(){
  document.querySelectorAll<HTMLAnchorElement>('a[href*="instagram.com"]').forEach(link=>{
    link.href=LITLAB_INSTAGRAM_URL;
    link.setAttribute('aria-label',link.textContent?.includes('Instagram')?`${link.textContent.trim()} — ${NEW_INSTAGRAM_HANDLE}`:`LitLab Instagram — ${NEW_INSTAGRAM_HANDLE}`);
  });
  replaceInstagramText(document.body);
}

function startInstagramRefresh(){
  refreshInstagramInfo();
  new MutationObserver(()=>refreshInstagramInfo()).observe(document.body,{childList:true,subtree:true});
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',startInstagramRefresh,{once:true});
}else{
  startInstagramRefresh();
}
