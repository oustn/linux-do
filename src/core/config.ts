import _ from 'lodash';
import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { Reaction } from './reaction';
import { UserBasic } from '@src/core/type';

interface ConfigInterface {
  autoRefreshing: boolean;
  username: string | null;
  userBasic: UserBasic | null;
}

type keys = keyof ConfigInterface;

export class Config extends Reaction implements ConfigInterface {
  private static readonly key = 'linux.do.config';

  @observable
  autoRefreshing = false;

  @observable
  username: string | null = null;

  @observable.ref
  userBasic: UserBasic | null = null;

  @computed
  private get export(): ConfigInterface {
    return {
      autoRefreshing: this.autoRefreshing,
      username: this.username,
      userBasic: toJS(this.userBasic),
    };
  }

  constructor() {
    super();
    makeObservable(this)
  }

  async init() {
    await this.initConfig();

    this.reaction(() => this.export, (config, oldConfig) => {
      if (_.isEqual(config, oldConfig)) {
        return;
      }
      chrome.storage.sync.set({ [Config.key]: config });
    });
  }

  private async initConfig() {
    const { [Config.key]: config = {} } = await chrome.storage.sync.get(Config.key);
    const {
      username,
      userBasic,
      autoRefreshing,
    } = config

    this.username = username;
    this.userBasic = userBasic;
    this.autoRefreshing = autoRefreshing;
  }

  @action
  updateConfig(key: keys, value: unknown) {
    this[key] = value as never;
  }
}
