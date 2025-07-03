export const DEFAULT_ALARM = 'linux.do.refresh';
export const TIMING_ALARM = 'linux.do.timing';

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
  periodInMinutes: 5,

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

export function removePartitionCookies() {
  return new Promise((resolve) => {
    // @ts-expect-error lower version error
    chrome.cookies.getAll({ domain: 'linux.do', partitionKey: { topLevelSite: 'https://linux.do'} }, (cookies) => {
      Promise.all(cookies.map(cookie => new Promise((res) => {
        chrome.cookies.set({
          url: 'https://linux.do',
          domain: cookie.domain,
          name: cookie.name,
          storeId: cookie.storeId,
          value: cookie.value,
          expirationDate: cookie.expirationDate,
          secure: cookie.secure,
          sameSite: cookie.sameSite,
          path: cookie.path,
          httpOnly: cookie.httpOnly,
        }, res)
      }))).then(resolve)
    })
  })
}
