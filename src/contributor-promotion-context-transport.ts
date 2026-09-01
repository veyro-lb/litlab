import {litlabNativeFetch} from './contributor-native-fetch';

const nativeFetch=litlabNativeFetch();
const RPC_PATH='/rest/v1/rpc/get_litlab_promotion_review_context';
const TIMEOUT_MS=12_000;
const CACHE_MS=15_000;

type Snapshot={status:number;statusText:string;headers:[string,string][];body:string;expires:number};
const inflight=new Map<string,Promise<Snapshot>>();
const cache=new Map<string,Snapshot>();

function urlOf(input:RequestInfo|URL){
  if(typeof input==='string')return input;
  if(input instanceof URL)return input.href;
  return input.url;
}
function headerValue(headers:HeadersInit|undefined,name:string){
  if(!headers)return '';
  const h=new Headers(headers);return h.get(name)||'';
}
function requestBody(input:RequestInfo|URL,init?:RequestInit){
  if(typeof init?.body==='string')return init.body;
  if(input instanceof Request){
    // The LitLab RPC caller always passes a string body in init; keep this fallback empty
    // rather than consuming a Request body that the real fetch still needs.
    return '';
  }
  return '';
}
function applicationId(body:string){
  try{return String(JSON.parse(body||'{}')?.p_application_id||'')}catch{return ''}
}
function responseFrom(snapshot:Snapshot){
  return new Response(snapshot.body,{status:snapshot.status,statusText:snapshot.statusText,headers:snapshot.headers});
}
function notifyReady(id:string){
  window.setTimeout(()=>{
    window.dispatchEvent(new CustomEvent('litlab:promotion-context-ready',{detail:{applicationId:id}}));
    window.dispatchEvent(new CustomEvent('litlab:contributor-guide-rendered'));
  },0);
}

window.fetch=async function(input:RequestInfo|URL,init?:RequestInit):Promise<Response>{
  const url=urlOf(input);
  if(!url.includes(RPC_PATH))return nativeFetch(input,init);

  const body=requestBody(input,init);
  const appId=applicationId(body);
  const auth=headerValue(init?.headers,'authorization');
  const key=`${url}|${appId}|${auth.slice(-24)}`;
  const cached=cache.get(key);
  if(cached&&cached.expires>Date.now()){
    notifyReady(appId);
    return responseFrom(cached);
  }

  let pending=inflight.get(key);
  if(!pending){
    const created:Promise<Snapshot>=(async():Promise<Snapshot>=>{
      const controller=new AbortController();
      const timer=window.setTimeout(()=>controller.abort(),TIMEOUT_MS);
      const callerSignal=init?.signal;
      const abortFromCaller=()=>controller.abort();
      if(callerSignal){
        if(callerSignal.aborted)controller.abort();
        else callerSignal.addEventListener('abort',abortFromCaller,{once:true});
      }
      try{
        // Important: bypass every later LitLab fetch wrapper for this RPC. A wrapper chain
        // previously swallowed the request before it reached Supabase, leaving the UI on
        // "Loading your Promotion submission area…" forever.
        const response=await nativeFetch(input,{...init,signal:controller.signal});
        const text=await response.text();
        const headers=Array.from(response.headers.entries()) as [string,string][];
        const snapshot:Snapshot={status:response.status,statusText:response.statusText,headers,body:text,expires:Date.now()+(response.ok?CACHE_MS:1500)};
        if(response.ok)cache.set(key,snapshot);
        return snapshot;
      }catch(error){
        const timedOut=controller.signal.aborted&&!callerSignal?.aborted;
        const message=timedOut
          ?'The Promotion submission area took too long to load. Please retry.'
          :'The Promotion submission area could not reach LitLab right now. Please retry.';
        return {status:timedOut?504:503,statusText:timedOut?'Gateway Timeout':'Service Unavailable',headers:[['content-type','application/json']],body:JSON.stringify({message}),expires:Date.now()+1000};
      }finally{
        window.clearTimeout(timer);
        callerSignal?.removeEventListener('abort',abortFromCaller);
      }
    })().finally(()=>inflight.delete(key));
    inflight.set(key,created);
    pending=created;
  }

  const snapshot=await pending;
  if(snapshot.status>=200&&snapshot.status<300)notifyReady(appId);
  return responseFrom(snapshot);
};

export {};
