(async () => {
  const { URL_CHANGE_MESSAGE } = await import('@src/constant.ts');

  type Handler = (event: { location: string, action: string }) => void;

  class RouteListener {
    currentPath: string;
    currentHash: string;

    constructor(private readonly handler: Handler) {
      this.currentPath = window.location.pathname;
      this.currentHash = window.location.hash;
      this.init();
    }

    init() {
      // Listen for popstate and hashchange events
      window.addEventListener('popstate', () => this.onRouteChange('popstate'));
      window.addEventListener('hashchange', () => this.onRouteChange('hashchange'));

      // Override pushState and replaceState to listen for these methods
      this.overrideHistoryMethods();
    }

    onRouteChange(action: string) {
      const newPath = window.location.pathname;
      const newHash = window.location.hash;

      if (newPath !== this.currentPath || newHash !== this.currentHash) {
        this.handler({
          location: window.location.href,
          action,
        });
        this.currentPath = newPath;
        this.currentHash = newHash;
      }
    }

    overrideHistoryMethods() {
      const pushState = window.history.pushState;
      const replaceState = window.history.replaceState;

      window.history.pushState = (...args: Parameters<typeof pushState>) => {
        const result = pushState.apply(history, args);
        this.onRouteChange('pushState');
        return result;
      };

      window.history.replaceState = (...args: Parameters<typeof pushState>) => {
        const result = replaceState.apply(history, args);
        this.onRouteChange('replaceState');
        return result;
      };
    }
  }

  const handler = ({ location, action }: { location: string, action: string }) => {
    window.postMessage({
      type: URL_CHANGE_MESSAGE,
      payload: {
        location,
        action,
      },
    }, '*');
  };
// Create an instance of RouteListener to start listening for route changes
  new RouteListener(handler);
})();
