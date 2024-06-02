export const DEFAULT_ALARM = 'linux.do.refresh';

export function updateActionIcon(icon: string) {
  chrome.action.setIcon({
    path: `icons/${icon}128.png`,
  }).then();
}

export function updateBadgeText(text?: string) {
  chrome.action.setBadgeText({
    text: text || '',
  }).then();
}

export function clearBadgeText() {
  updateBadgeText();
}

export async function setAlarm(name: string = DEFAULT_ALARM, options: chrome.alarms.AlarmCreateInfo = {
  periodInMinutes: 1,

}) {
  const alarm = await chrome.alarms.get(name);
  if (!alarm) {
    return chrome.alarms.create(name, options);
  }
}

export async function cancelAlarm(name: string = DEFAULT_ALARM) {
  await chrome.alarms.clear(name);
}

export async function handlerViewTopic(id?: number) {
  if (id) {
    return chrome.tabs.create({
      url: `https://linux.do/t/topic/${id}`,
    });
  }
  return null;
}
