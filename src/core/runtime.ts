import { Client } from '@src/discourse/client.ts';
import { makeObservable, observable } from 'mobx';
import { Config } from './config';
import { Reaction } from './reaction';
import { removePartitionCookies, setAlarm, TIMING_ALARM } from '@src/utils';
import { LatestTopic } from '@src/core/latest-topic.ts';
import { Categories } from '@src/core/categories.ts';
import { User } from '@src/core/user.ts';
import { Timing } from '@src/core/timing'
import * as cheerio from 'cheerio';

export class Runtime extends Reaction {
  private static instance?: Runtime;

  static async getInstance(): Promise<Runtime> {
    if (!this.instance) {
      const config = new Config();
      await config.init();
      this.instance = new Runtime(config);
      await this.instance.init();
    }
    return this.instance;
  }

  private readonly client: Client;

  @observable.ref
  private readonly config;

  @observable.ref
  readonly user: User;

  @observable.ref
  readonly latestTopic: LatestTopic;

  @observable.ref
  readonly categories: Categories;

  @observable.ref
  readonly timing: Timing;

  constructor(config: Config) {
    super();
    this.config = config
    this.client = new Client('https://linux.do');
    this.latestTopic = new LatestTopic(this.client);
    this.categories = new Categories(this.client);
    this.user = new User(this.client, this.config);
    this.timing = new Timing(this.client)

    makeObservable(this)
  }

  private async init() {
    await setAlarm();
    await setAlarm(TIMING_ALARM, {
      periodInMinutes: 60
    })
    await removePartitionCookies()
    // Alarm 监听

    Promise.all([
      this.user.fetchCurrentUser(),
      this.categories.fetch(),
      this.latestTopic.fetch(),
    ]).then()
  }

  depose() {
    super.depose();
    this.config.depose();
  }

  refresh() {
    Promise.all([
      this.user.fetchCurrentUser()
    ]).then();
  }

  async fetchInfo() {
    const response = await fetch('https://connect.linux.do/')
    const html = await response.text()
    const $ = cheerio.load(html)
    const rows:  Array<{ label: string, value: string, expect: string}> = [];

    $('table tbody tr').each((_index, element) => {
      const cells = $(element).find('td');
      if (cells.length === 3) {
        const row = {
          label: $(cells[0]).text().trim(),
          value: $(cells[1]).text().trim(),
          expect: $(cells[2]).text().trim()
        };
        rows.push(row);
      }
    });

    return rows;
  }
}
