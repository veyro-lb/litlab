import './logo-refresh.css';

const MARKUP = `
  <path class="logo-book logo-book-left" d="M5.5 22.5c9.5-1.8 18.2.5 26.5 7.8v24.2c-8.1-5.5-16.9-7.4-26.5-5.4z"/>
  <path class="logo-book logo-book-right" d="M58.5 22.5c-9.5-1.8-18.2.5-26.5 7.8v24.2c8.1-5.5 16.9-7.4 26.5-5.4z"/>
  <path class="logo-book-line" d="M7.5 48.7c8.8-1.3 16.8.8 24.5 6.2M56.5 48.7c-8.8-1.3-16.8.8-24.5 6.2"/>
  <path class="logo-flask-fill" d="M26.2 7.5h11.6v4.3h-1.9v8.1l10.2 18.3c2.7 4.8-.8 10.8-6.3 10.8H24.2c-5.5 0-9-6-6.3-10.8l10.2-18.3v-8.1h-1.9z"/>
  <path class="logo-liquid" d="M20.6 38.8c3.4-2.5 7-2.9 10.6-1.2 4.8 2.3 8.3 2.8 12.2.8l3.1 5.4c1.3 2.3-.4 5.2-3 5.2h-23c-2.6 0-4.3-2.9-3-5.2z"/>
  <path class="logo-flask" d="M26.2 7.5h11.6v4.3h-1.9v8.1l10.2 18.3c2.7 4.8-.8 10.8-6.3 10.8H24.2c-5.5 0-9-6-6.3-10.8l10.2-18.3v-8.1h-1.9V7.5z"/>
  <circle class="logo-bubble" cx="29" cy="31" r="1.8"/>
  <circle class="logo-bubble logo-bubble-small" cx="37.8" cy="34.4" r="1.3"/>
  <path class="logo-spark" d="m49.7 7.2 1.7 4.8 4.8 1.7-4.8 1.7-1.7 4.8-1.7-4.8-4.8-1.7L48 12z"/>
`;

function refreshLogos() {
  document.querySelectorAll<SVGSVGElement>('.logo svg').forEach((svg) => {
    if (svg.dataset.litlabLogo === '2') return;
    svg.dataset.litlabLogo = '2';
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.innerHTML = MARKUP;
  });
}

function start() {
  refreshLogos();
  const observer = new MutationObserver(refreshLogos);
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
