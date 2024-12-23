import { ApiReturnType, Client } from '@src/discourse/client.ts';
import { action, computed, IObservableArray, makeObservable, observable, runInAction } from 'mobx';

export enum LatestTopicOrder {
  default = 'default',
  created = 'created',
  activity = 'activity',
  views = 'views',
  posts = 'posts',
  category = 'category',
  likes = 'likes',
  op_likes = 'op_likes',
  posters = 'posters',
}

type User = Exclude<ApiReturnType<'listLatestTopics'>['users'], undefined>[number];

export type Topic =
  Exclude<Exclude<ApiReturnType<'listLatestTopics'>['topic_list'], undefined>['topics'], undefined>[number]
  & {
  author: User
}

export class LatestTopic {
  private order: LatestTopicOrder = LatestTopicOrder.created;

  @observable.ref
  topics: IObservableArray<Topic> = observable.array([], { deep: false });

  private readonly client: Client;

  @observable
  loading = false;

  @computed
  get export() {
    return {
      topics: this.topics.slice(),
      loading: this.loading,
      order: this.order,
    };
  }

  constructor(client: Client) {
    this.client = client;
    makeObservable(this);
  }

  @action
  async fetch(order?: LatestTopicOrder) {
    this.loading = true;
    if (order) {
      this.order = order;
    }
    const topics = await this.client.listLatestTopics(this.order);
    const users: User[] = topics?.users || [];
    runInAction(() => {
      this.topics.replace((topics?.topic_list?.topics || []).map((topic) => ({
        ...topic,
        author: users.find((user) => user.id === topic?.posters?.[0].user_id)!,
      })));
      this.loading = false;
    });
  }
}
