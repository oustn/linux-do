import { ApiReturnType, Client } from '@src/discourse/client.ts';
import { computed, makeObservable, observable, runInAction, toJS } from 'mobx';
import { Config } from '@src/core/config.ts';
import { updateActionIcon } from '@src/utils';
import { Reaction } from '@src/core/reaction.ts';

export type UserSummary = ApiReturnType<'getUserSummary'>
export type UserBasic = UserSummary['users'][number]

export class User extends Reaction {
  private client: Client;
  private config: Config;
  private username: string | null = null;
  private summary: UserSummary | null = null;
  private basic: UserBasic | null = null;
  private unreadNotification: number = 0;
  private unreadPrivateMessage: number = 0;

  get export() {
    return {
      username: this.username,
      isLogin: !!this.username,
      summary: toJS(this.summary),
      basic: toJS(this.basic),
      unreadNotification: this.unreadNotification,
      unreadPrivateMessage: this.unreadPrivateMessage,
    };
  }

  constructor(client: Client, config: Config) {
    super();
    this.client = client;
    this.config = config;
    this.username = this.config.username;
    this.basic = this.config.userBasic;

    makeObservable<
      User,
      'username' |
      'summary' |
      'unreadNotification' |
      'unreadPrivateMessage'
    >(this, {
      username: observable,
      export: computed,
      summary: observable.ref,
      unreadNotification: observable,
      unreadPrivateMessage: observable,
    });

    this.reaction(() => this.username, async () => {
      const icon = this.username ? 'active' : 'icon';
      updateActionIcon(icon);
    }, { fireImmediately: true });

  }

  async fetchCurrentUser() {
    const username = await this.client.getCurrentUsername();

    runInAction(() => {
      this.username = username;
    });
    this.config.updateConfig('username', username);
    if (!username) {
      this.config.updateConfig('userBasic', null);
    }

    if (username) {
      await Promise.all([
        this.fetchUserSummary(),
        this.fetchNotification(),
        this.fetchPrivateMessage()
      ]);
    }
  }

  private async fetchUserSummary() {
    if (!this.username) return;
    const user = await this.client.getUserSummary(this.username);
    const current = user?.users
      .find((u) => u.username === this.username);
    runInAction(() => {
      this.summary = user || null;
      this.basic = current || null;
      this.config.updateConfig('userBasic', this.basic);
    });
  }

  private async fetchNotification() {
    const notification = await this.client.getUnreadNotifications();
    runInAction(() => {
      this.unreadNotification = notification?.total_rows_notifications ?? 0;
    });
  }

  private async fetchPrivateMessage() {
    if (!this.username) return;
    const message = await this.client.listUnreadUserPrivateMessages(this.username);
    runInAction(() => {
      this.unreadPrivateMessage = message?.topic_list?.topics?.length ?? 0;
    })
  }
}
