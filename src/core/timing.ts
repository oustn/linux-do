import { ApiReturnType, Client } from '@src/discourse/client.ts';
import { removePartitionCookies } from '@src/utils';

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

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function wait(microsecond: number) {
  return new Promise(resolve => setTimeout(resolve, microsecond));
}

export class Timing {
  private readonly client: Client;

  private minReqSize = 8;

  private maxReqSize = 20;

  private baseDelay = 2500;

  private randomDelayRange = 1000;

  private minReadTime = 800;

  private maxReadTime = 3000;

  private csrfToken = '';

  private tab: chrome.tabs.Tab | null = null;

  private processing = false;

  private readonly startId = 'timing-notification';

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * fetch topics
   * @param order
   */
  async fetchTopics(order: LatestTopicOrder = LatestTopicOrder.activity): Promise<Topic[]> {
    const topics = await this.client.listLatestTopics(order);
    const users: User[] = topics?.users || [];
    return (topics?.topic_list?.topics || []).map((topic) => ({
      ...topic,
      author: users.find((user) => user.id === topic?.posters?.[0].user_id)!,
    }));
  }

  private createBatchParams(topicID: string, startId: number, endId: number) {
    const params = new URLSearchParams();

    for (let i = startId; i <= endId; i++) {
      params.append(`timings[${i}]`, getRandomInt(this.minReadTime, this.maxReadTime).toString());
    }

    const topicTime = getRandomInt(
      this.minReadTime * (endId - startId + 1),
      this.maxReadTime * (endId - startId + 1),
    ).toString();

    params.append('topic_time', topicTime);
    params.append('topic_id', topicID);
    return params;
  }

  private async getCsrfToken(id: number | string) {
    if (!this.csrfToken) {
      this.csrfToken = await this.client.getCsrfToken(id);
    }
    return this.csrfToken;
  }

  private async sendBatch(topicID: string, csrfToken: string, startId: number, endId: number, retryCount = 5): Promise<boolean> {
    if (!topicID) return false;
    const params = this.createBatchParams(topicID, startId, endId);
    try {
      const response = await fetch('https://linux.do/topics/timings', {
        headers: {
          'accept': '*/*',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'discourse-background': 'true',
          'discourse-logged-in': 'true',
          'discourse-present': 'true',
          'priority': 'u=1, i',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-csrf-token': csrfToken,
          'x-requested-with': 'XMLHttpRequest',
          'x-silence-logger': 'true',
        },
        referrer: `https://linux.do/`,
        body: params.toString(),
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        const message = await response.text();
        if (message.includes('BAD CSRF') || message.includes('Just a moment...')) {
          this.tab = this.tab || await chrome.tabs.create({
            url: `https://linux.do/t/topic/${topicID}`,
            active: false,
          });

          await wait(5000);

          await removePartitionCookies();
        }
        throw new Error(`HTTP请求失败，状态码：${response.status}`);
      }

      this.notification(`成功处理回复 ${startId} - ${endId}`, 'SUCCESS');
      if (this.tab && this.tab.id) {
        await chrome.tabs.remove(this.tab.id);
        this.tab = null;
      }
      return true;
    } catch (error) {
      this.notification(`处理回复 ${startId} - ${endId} 失败: ${error} `, 'ERROR');

      if (retryCount > 0) {
        this.notification(`重试处理回复 ${startId} - ${endId}，剩余重试次数：${retryCount}`, 'WARNING');
        await wait(2000);
        return this.sendBatch(topicID, csrfToken, startId, endId, retryCount - 1);
      } else {
        this.notification(`处理回复 ${startId} - ${endId} 失败，自动跳过`, 'ERROR');
        return false;
      }
    }

  }

  private notification(message: string, title = 'LinuxDo - 自动阅读通知') {
    return chrome.notifications.create(this.startId, {
      title,
      type: 'basic',
      message,
      iconUrl: 'icons/active128.png',
    });
  }

  async timing(topic: Topic) {
    if (this.processing) return;
    const { posts_count: totalReplies = 0, id = 0, unseen, unread_posts } = topic;
    if (!totalReplies || !id) return;
    if (!unseen && !unread_posts) return;

    this.processing = true;
    const csrfToken = await this.getCsrfToken(id);

    this.notification(`开始自动阅读，共${totalReplies}条回复。 \n\n ${topic.title!}`);
    for (let i = 1; i <= totalReplies;) {
      const batchSize = getRandomInt(this.minReqSize, this.maxReqSize);
      const startId = i;
      const endId = Math.min(i + batchSize - 1, totalReplies);

      const success = await this.sendBatch(id.toString(), csrfToken, startId, endId);
      if (success) {
        const delay = this.baseDelay + getRandomInt(0, this.randomDelayRange);
        await wait(delay);
      } else {
        this.notification(`自动阅读失败，已完成${i}条阅读。\n\n ${topic.title!}`);
        this.processing = false;
        return;
      }

      i = endId + 1;
    }
    this.notification(`自动阅读已完成。\n\n ${topic.title!}`);
    this.processing = false;
  }

  async timingBatch(order: LatestTopicOrder) {
    const topics = await this.fetchTopics(order)
    if (!topics.length) return
    for (let i = 0; i < topics.length; i++) {
      await this.timing(topics[i])
      await wait(2000)
    }
  }
}
