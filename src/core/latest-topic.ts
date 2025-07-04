import { ApiReturnType, Client } from '@src/discourse/client.ts';
import { action, computed, IObservableArray, makeObservable, observable, runInAction, ObservableMap } from 'mobx';
import { PostDetail, TopicDetail } from '@src/discourse/types.ts';
import { Model } from './model';

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

export class LatestTopic extends Model {
  private order: LatestTopicOrder = LatestTopicOrder.created;

  @observable.ref
  topics: IObservableArray<Topic> = observable.array([], { deep: false });

  @observable.ref
  topicMap: ObservableMap<string, TopicDetail & { post?: string } | null> = observable.map({}, { deep: false });

  @observable.ref
  postMap: ObservableMap<string, PostDetail | null> = observable.map({}, { deep: false });

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
    super(client);
    makeObservable(this);
  }

  @action
  async fetch(order?: LatestTopicOrder) {
    this.loading = true;
    if (order) {
      this.order = order;
    }
    try {
      const topics = await this.client.listLatestTopics(this.order);
      const users: User[] = topics?.users || [];
      runInAction(() => {
        this.topics.replace((topics?.topic_list?.topics || []).map((topic) => ({
          ...topic,
          author: users.find((user) => user.id === topic?.posters?.[0].user_id)!,
        })));
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async fetchDetail(id: string) {
    const topic = await this.client.getTopic(id);
    if (!topic) {
      return null;
    }
    const postId = topic?.post_stream?.posts?.[0]?.id;
    if (!postId) {
      runInAction(() => {
        this.topicMap.set(`${topic.id}`, topic);
      });
      return topic;
    }
    const post = await this.client.getPost(`${postId}`);
    runInAction(() => {
      this.topicMap.set(`${topic.id}`, {
        ...topic,
        post: `${postId}`,
      });
      this.postMap.set(`${postId}`, post as PostDetail ?? null);
    });
    return {
      ...topic,
      post,
    };
  }

  async resolvePost(id: string) {
    if (!this.topicMap.has(id)) {
      await this.fetchDetail(id);
    }
    const topic = this.topicMap.get(id);
    const post = topic?.post;
    if (!post) return null;
    return this.postMap.get(post);
  }

  async toggleLike(topicId: string, postId: string, reaction: string) {
    const csrf = await this.getCsrfToken(topicId);
    const postDetail = await this.client.toggleLike(postId, reaction, csrf);
    runInAction(() => {
      this.postMap.set(postId, postDetail ?? null);
    });
    return postDetail;
  }
}
