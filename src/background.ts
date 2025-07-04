import { Runtime } from '@src/core/runtime.ts';
import { Config } from '@src/core/config.ts';
import { rules } from './rules';
import { Topic } from './core/type';
import { READ_TOPIC, READ_TOPIC_BATCH } from '@src/constant.ts';
import { cancelAlarm, DEFAULT_ALARM, removePartitionCookies, setAlarm, TIMING_ALARM } from '@src/utils';
import { LatestTopicOrder } from '@src/core/latest-topic.ts';

const SETTING_MENU = 'setting_menu';

const SELECTION_MENU = 'get_selected_text';

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: SETTING_MENU,
    title: '设置',
    contexts: ['action'],
  });

  chrome.contextMenus.create({
    id: SELECTION_MENU,
    title: '添加到快捷回复',
    contexts: ['selection'],
  });

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map((rule) => rule.id), // remove existing rules
    addRules: rules,
  });

  const r = await Runtime.getInstance();
  console.log(r);
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === SETTING_MENU) {
    await chrome.tabs.create({ url: 'manager.html' });
    return;
  }
  if (info.menuItemId === SELECTION_MENU) {
    const config = new Config();
    await config.init();
    const shortcuts = config.shortcuts;
    console.log(info);
    const selectedText = info.selectionText?.trim();
    if (!selectedText) return;
    const newShortcuts = Array.isArray(shortcuts) ? [...shortcuts] : [
      '谢谢分享，感谢佬',
      'CCC，一天到晚就知道 C',
      '来不及解释了，快上车',
    ];
    newShortcuts.push(selectedText);
    config.updateConfig('shortcuts', Array.from(new Set(newShortcuts)));
    return Promise.resolve();
  }
});

chrome.tabs.onUpdated.addListener(async (_, changeInfo) => {
  const { status } = changeInfo;

  if (status !== 'complete') {
    return;
  }
  await removePartitionCookies();
});

chrome.tabs.onActivated.addListener(async () => {
  // 重新加载 url / config
  await removePartitionCookies();
});

chrome.runtime.onConnect.addListener(async (port) => {
  const r = await Runtime.getInstance();

  // 监听消息
  port.onMessage.addListener(async (message, p) => {
    const { action, topic, order } = message as { action: string; topic: Topic, order: LatestTopicOrder };
    switch (action) {
      case READ_TOPIC: {
        await r.timing.timing(topic);
        break;
      }
      case READ_TOPIC_BATCH: {
        await r.timing.timingBatch(order);
        break;
      }
    }
    p.disconnect();
  });
});

chrome.notifications.onClicked.addListener(async () => {
  const data = await chrome.storage.local.get('timing-notification');
  const topic: Topic = data['timing-notification'];
  if (!data) return;
  await chrome.tabs.create({ url: `https://linux.do/t/topic/${topic.id}` });
});


chrome.alarms.onAlarm.addListener(async (alarm) => {
  const r = await Runtime.getInstance();

  if (alarm.name === DEFAULT_ALARM) {
    r.refresh();
    return;
  }

  if (alarm.name === TIMING_ALARM) {
    const hour = new Date().getHours();
    if (hour < 7 || hour >= 21) return;
    console.log('自动阅读');
    await r.timing.timingBatch();
    await cancelAlarm(TIMING_ALARM);
    await setAlarm(TIMING_ALARM, {
      periodInMinutes: Math.floor(Math.random() * 40) + 20,
    });
  }
});
