import './index.scss';

const injectScript = (file: string, node: string) => {
  const th = document.querySelector(node);
  const s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  th?.appendChild(s);
};
injectScript(chrome.runtime.getURL('inject.js'), 'body');

(async () => {
  const { URL_CHANGE_MESSAGE } = await import('@src/constant.ts');

  window.addEventListener('message', (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) {
      return;
    }

    if (event?.data?.type !== URL_CHANGE_MESSAGE) {
      return;
    }

    launch();
  }, false);
})();

// inject script

function launch() {
  if (/\/t\/topic\/.*/.test(window.location.href)) {
    console.log('🚀');
  }
}

launch();
// 区分自适应宽度的元素

// const target = document.querySelector('.timeline-scrollarea-wrapper') ||
//   document.getElementById('topic-progress-wrapper')
//
// const el = document.querySelectorAll('.loading-container')
// console.log('hello')
// console.log(el)
