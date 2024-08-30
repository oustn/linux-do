export class Scroller {
  private static instance: Scroller;
  private static readonly TIMELINE_SELECTOR = '.timeline-scrollarea-wrapper';
  private static readonly PROGRESS_SELECTOR = '.topic-progress-wrapper';
  private static readonly ANCHOR_SELECTOR = '.loading-container';

  static getInstance() {
    if (!Scroller.instance) {
      Scroller.instance = new Scroller();
    }
    return Scroller.instance;
  }

  private getTopAnchor(): Element | null {
    return document.querySelectorAll(Scroller.ANCHOR_SELECTOR)?.[0] ?? null;
  }

  private getBottomAnchor(): Element | null {
    return document.querySelectorAll(Scroller.ANCHOR_SELECTOR)?.[2] ?? null;
  }

  private constructor() {
  }

  private async getTimeline(): Promise<Element | null> {
    const timeline = document.querySelector(Scroller.TIMELINE_SELECTOR);
    if (timeline) return timeline;
    const progress = document.getElementById(Scroller.PROGRESS_SELECTOR);
    if (progress) {
      progress.click();
      return new Promise(resolve => {
        setTimeout(() => {
          const timeline = document.querySelector(Scroller.TIMELINE_SELECTOR);
          resolve(timeline);
        }, 1000);
      });
    }
    return null;
  }

  private async emulateClick(selector: string, intersectionTarget: Element | null, target: string): Promise<boolean> {
    const timeline = await this.getTimeline();
    if (!timeline) return Promise.resolve(false);
    const topAnchor = timeline.querySelector(selector);
    if (!topAnchor) return Promise.resolve(false);
    const box = topAnchor.getBoundingClientRect();
    const evt = new MouseEvent('click', {
      clientX: box.left,
      clientY: box.top,
      bubbles: true,
      cancelable: true,
      view: window,
    });
    topAnchor.dispatchEvent(evt);

    return new Promise((resolve) => {
      if (!intersectionTarget) {
        resolve(false);
        return;
      }
      let timer: number = -1;
      let request: number = -1;

      const find = () => {
        const el = document.querySelector(target);
        if (el) {
          resolve(true);
        } else {
          request = requestIdleCallback(find);
        }
      };

      const i = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          i.disconnect();
          find();
          clearTimeout(timer);
        }
      });
      i.observe(intersectionTarget);
      timer = setTimeout(() => {
        resolve(false);
        cancelIdleCallback(request);
        i.disconnect();
      }, 5000) as unknown as number;
    });
  }

  async toTop(): Promise<boolean> {
    return this.emulateClick('.start-date', this.getTopAnchor(), '#topic-title');
  }

  async toBottom(): Promise<boolean> {
    return this.emulateClick('.now-date', this.getBottomAnchor(), '.more-topics__container');
  }

  async autoPlay() {
    // const result = await this.toTop();
    // if (!result) return;
    const stream = document.querySelector('.post-stream');
    if (!stream) return;
    const anchor = this.getBottomAnchor();

    let timer = -1;
    let clear = -1;
    let resizeObserver: ResizeObserver | null = null;
    const scroll = () => {
      anchor?.scrollIntoView({
        behavior: 'smooth',
      });
      console.log('scroll...')

      clear = setTimeout(() => {
        resizeObserver?.disconnect();
        console.log('finished')
      }, 5000) as unknown as number;
    };


    const handlerResize = () => {
      clearTimeout(timer);
      clearTimeout(clear);
      timer = setTimeout(scroll, 1000) as unknown as number;
    };

    resizeObserver = new ResizeObserver(handlerResize);

    resizeObserver.observe(stream);

    scroll();
  }
}
