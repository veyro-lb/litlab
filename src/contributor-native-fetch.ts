declare global {
  interface Window {
    __litlabNativeFetch?: typeof window.fetch;
  }
}

if(!window.__litlabNativeFetch){
  const nativeFetch=window.fetch.bind(window);
  Object.defineProperty(window,'__litlabNativeFetch',{
    value:nativeFetch,
    configurable:false,
    enumerable:false,
    writable:false,
  });
}

export function litlabNativeFetch(){
  return window.__litlabNativeFetch || window.fetch.bind(window);
}

export {};
