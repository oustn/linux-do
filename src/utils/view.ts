import { format } from 'd3-format';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn.js';
import { LatestTopicOrder, Topic } from '@src/core/latest-topic.ts';
import { READ_TOPIC, READ_TOPIC_BATCH } from '@src/constant.ts';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

let port: chrome.runtime.Port | null;

export function avatarUrl(template: string, size: number = 96) {
  return template.replace(/^\//, 'https://linux.do/')
    .replace('{size}', size.toString());
}

export function formatNumber(value?: number) {
  if (typeof value === 'undefined') return '';
  if (value < 1e3) return value;
  return format('.2s')(value);
}

export function formatDate(date: string) {
  if (!date) return '';
  return dayjs(date).toNow(true);
}

function getPort() {
  if (!port) {
    port = chrome.runtime.connect({ name: 'popup_connection' });
    port.onDisconnect.addListener(() => {
      port = null
    });
  }
  return port;
}

export async function handleReadWithTopic(topic: Topic) {
  const port = getPort();

  port.postMessage({
    action: READ_TOPIC,
    topic,
  });
}

export async function handleReadWithBatch(order: LatestTopicOrder) {
  const port = getPort();
  port.postMessage({
    action: READ_TOPIC_BATCH,
    order,
  });
}
