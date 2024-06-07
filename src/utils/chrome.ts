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

export function goto(url: string, inactive: boolean = false) {
  return chrome.tabs.create({ url, active: !inactive });
}

export async function handlerViewTopic(id?: number, inactive = false) {
  if (id) {
    return goto(`https://linux.do/t/topic/${id}`, inactive)
  }
  return null;
}

export async function handlerLogin() {
  return goto(`https://linux.do/login`)
}
