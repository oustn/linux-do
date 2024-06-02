import { Client } from '@src/discourse/client.ts';
import { makeObservable, observable, runInAction } from 'mobx';
import { Config } from './config';
import { Reaction } from './reaction';
import { cancelAlarm, DEFAULT_ALARM, setAlarm, updateActionIcon } from '@src/utils';
import { LatestTopic } from '@src/core/latest-topic.ts';
import { Categories } from '@src/core/categories.ts';

export class Runtime extends Reaction {
  private static instance?: Runtime;

  static async getInstance(): Promise<Runtime> {
    if (!this.instance) {
      this.instance = new Runtime();
    }
    return this.instance;
  }

  private readonly client: Client;

  private readonly config = new Config();

  private username: string | null = null;

  readonly latestTopic: LatestTopic;

  readonly categories: Categories;

  constructor() {
    super();
    this.client = new Client('https://linux.do');
    this.latestTopic = new LatestTopic(this.client);
    this.categories = new Categories(this.client);

    makeObservable<Runtime,
      'username' |
      'config'
    >(this, {
      username: observable,
      config: observable.ref,
      latestTopic: observable.ref,
      categories: observable.ref,
    });
    console.log(this.client);
    this.init();
  }

  private init() {
    // 登录状态
    this.reaction(() => this.username, async () => {
      const icon = this.username ? 'active' : 'icon';
      updateActionIcon(icon);

      if (this.username) {
        this.fetchSummary().then();
      }
    }, { fireImmediately: true });

    this.fetchCurrentUser().then();

    // Alarm 启用
    this.reaction(() => this.config.autoRefreshing, async (autoRefreshing) => {
      if (autoRefreshing) {
        await setAlarm();
        this.refresh();
      } else {
        await cancelAlarm();
      }
    }, { fireImmediately: true });

    // Alarm 监听
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === DEFAULT_ALARM) {
        this.refresh();
      }
    });

    this.categories.fetch().then();
    this.latestTopic.fetch().then();
  }

  private async fetchCurrentUser() {
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

  depose() {
    super.depose();
    this.config.depose();
  }

  private refresh() {
    Promise.all([
      this.fetchCurrentUser().then(() => {
        return Promise.all([
          // 个人相关部分
        ]);
      }),
      // 与登录无关部分

    ]).then();
  }
}
