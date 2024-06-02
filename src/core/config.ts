import _ from 'lodash';
import { computed, makeObservable, observable } from 'mobx';
import { Reaction } from './reaction';

interface ConfigInterface {
  autoRefreshing: boolean;
}

export class Config extends Reaction implements ConfigInterface {
  private static readonly key = 'linux.do.config';

  autoRefreshing = false;

  private get export(): ConfigInterface {
    return {
      autoRefreshing: this.autoRefreshing,
    };
  }

  private set export(config: ConfigInterface) {
    if (!config) {
      return;
    }
    Object.entries(config).forEach(([key, value]) => {
      this[key as keyof ConfigInterface] = value;
    });
    this.autoRefreshing = config.autoRefreshing;
  }

  constructor() {
    super();
    this.init().then();

    makeObservable<ConfigInterface, 'export'>(this, {
      autoRefreshing: observable,
      export: computed,
    });
  }

  private async init() {
    await this.initConfig();

    chrome.storage.onChanged.addListener((changes) => {
      if (changes[Config.key]) {
        this.export = changes[Config.key].newValue as ConfigInterface;
      }
    });

    this.reaction(() => this.export, (config, oldConfig) => {
      if (_.isEqual(config, oldConfig)) {
        return;
      }
      chrome.storage.sync.set({ [Config.key]: config });
    });
  }

  private async initConfig() {
    this.export = (await chrome.storage.sync.get(Config.key)) as ConfigInterface;
  }
}
