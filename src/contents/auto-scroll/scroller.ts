export class Scroller {
  private static instance: Scroller;
  private static readonly TIMELINE_SELECTOR = '.timeline-scrollarea-wrapper';
  private static readonly PROGRESS_SELECTOR = '.topic-progress-wrapper';

  getInstance() {
    if (!Scroller.instance) {
      Scroller.instance = new Scroller();
    }
    return Scroller.instance;
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


  async toTop() {
    const timeline = await this.getTimeline()
    if (!timeline) return

  }
}
