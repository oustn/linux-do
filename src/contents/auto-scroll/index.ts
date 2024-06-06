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

  const { path, prevPath } = event.data
  const reg = /\/t\/topic\/\d+/
  // 页面内滚动
  if (reg.exec(path)?.[0] === reg.exec(prevPath)?.[0]) return

  launch();
}, false);

let observer: IntersectionObserver | null = null;
let root: HTMLDivElement | null = null;

// watch for flex
function handleIntersection(entries: IntersectionObserverEntry[]) {
  if (!entries?.[0]?.isIntersecting) {
    observer?.disconnect();
    observer = null;
    launch();
  }
}

function launch() {
  if (root) {
    root?.parentElement?.removeChild(root);
    root = null;
  }
  if (!/\/t\/topic\/.*/.test(window.location.href)) {
    return;
  }
  console.log('🚀');
  const target = document.querySelector('.timeline-scrollarea-wrapper') ||
    document.getElementById('topic-progress-wrapper');
  if (!target) return;
  const div = document.createElement('div');
  div.className = '__inject_from_plugin';
  target.appendChild(div);
  render(div);
  root = div;
  observer = new IntersectionObserver(handleIntersection);
  observer.observe(target);
}

launch();
