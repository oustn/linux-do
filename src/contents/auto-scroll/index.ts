import { URL_CHANGE_MESSAGE } from '@src/constant.ts';
import { render } from './Button.tsx';

import './index.scss';

const injectScript = (file: string, node: string) => {
  const th = document.querySelector(node);
  const s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  th?.appendChild(s);
};
injectScript(chrome.runtime.getURL('inject.js'), 'body');

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

// inject script

function launch() {
  if (!/\/t\/topic\/.*/.test(window.location.href)) {
    return;
  }
  console.log('🚀');
  const target = document.querySelector('.timeline-scrollarea-wrapper') ||
    document.getElementById('topic-progress-wrapper');
  if (!target) return;
  const div = document.createElement('div');
  target.appendChild(div);
  render(div);
}

launch();
// 区分自适应宽度的元素

// const target = document.querySelector('.timeline-scrollarea-wrapper') ||
//   document.getElementById('topic-progress-wrapper')
//
// const el = document.querySelectorAll('.loading-container')
// console.log('hello')
// console.log(el)
