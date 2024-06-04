import history from 'history/browser';

import './index.scss';


class RouteListener {
  currentPath: string;
  currentHash: string;

  constructor() {
    this.currentPath = window.location.pathname;
    this.currentHash = window.location.hash;
    this.init();
  }

  init() {
    // Listen for popstate and hashchange events
    window.addEventListener('popstate', this.onRouteChange.bind(this));
    window.addEventListener('hashchange', this.onRouteChange.bind(this));

    // Override pushState and replaceState to listen for these methods
    this.overrideHistoryMethods();
  }

  onRouteChange() {
    const newPath = window.location.pathname;
    const newHash = window.location.hash;

    if (newPath !== this.currentPath || newHash !== this.currentHash) {
      console.log('Route changed to:', window.location.href);
      launch();
      this.currentPath = newPath;
      this.currentHash = newHash;
    }
  }

  overrideHistoryMethods() {
    const pushState = window.history.pushState;
    const replaceState = window.history.replaceState;

    window.history.pushState = (...args: Parameters<typeof pushState>) => {
      const result = pushState.apply(history, args);
      this.onRouteChange();
      return result;
    };

    window.history.replaceState = (...args: Parameters<typeof pushState>) => {
      const result = replaceState.apply(history, args);
      this.onRouteChange();
      return result;
    };
  }
}

// Create an instance of RouteListener to start listening for route changes
new RouteListener();

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
