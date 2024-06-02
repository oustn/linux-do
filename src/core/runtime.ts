import { Client } from '@src/discourse/client.ts';
import { makeObservable, observable, reaction, runInAction } from 'mobx';

export class Runtime {
  private static instance?: Runtime;

  static async getInstance(): Promise<Runtime> {
    if (!this.instance) {
      this.instance = new Runtime();
    }
    return this.instance;
  }

  private readonly client: Client;

  private username: string | null = null;

  constructor() {
    this.client = new Client('https://linux.do');
    makeObservable<Runtime>(this, {
      username: observable,
    });
    console.log(this.client);
    this.init();
  }

  private init() {
    reaction(() => this.username, async () => {
      const icon = this.username ? 'active' : 'icon';
      if (this.username) {
        this.fetchSummary().then();
      }
      await chrome.action.setIcon({
        path: `icons/${icon}128.png`,
      });
    }, { fireImmediately: true });

    this.client.getCurrentUsername().then((username) => {
      runInAction(() => {
        this.username = username;
      });
    });
  }

  private async fetchSummary() {
    const summary = await this.client.getUserSummary(this.username!);
    console.log(summary);
  }
}
