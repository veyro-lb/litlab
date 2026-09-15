// Force Google to show the account chooser instead of silently reusing an active Google session.
// This capture layer runs before the existing LitLab Google handlers and covers every current
// Google sign-in entry point, including contributor-specific buttons.
const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const RETURN_KEY='litlabAuthReturnHash';
const GOOGLE_TRIGGER='[data-auth-google],[data-my-contrib-signin],[data-contributor-account-gate] button';

let redirecting=false;

function returnHashFor(target:Element){
  if(target.closest('[data-my-contrib-signin],[data-contributor-account-gate]'))return '#contribute';
  return location.hash&&!location.hash.includes('access_token=')?location.hash:'#home';
}

function beginGoogleSignIn(target:Element){
  sessionStorage.setItem(RETURN_KEY,returnHashFor(target));
  const authorize=new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  authorize.searchParams.set('provider','google');
  authorize.searchParams.set('redirect_to',`${location.origin}${location.pathname}`);
  authorize.searchParams.set('prompt','select_account');
  location.href=authorize.toString();
}

function interceptGoogleSignIn(event:Event){
  const source=event.target instanceof Element?event.target.closest<HTMLElement>(GOOGLE_TRIGGER):null;
  if(!source)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(redirecting)return;
  redirecting=true;
  beginGoogleSignIn(source);
}

document.addEventListener('pointerdown',interceptGoogleSignIn,true);
document.addEventListener('click',interceptGoogleSignIn,true);

export {};
