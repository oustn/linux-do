import {Runtime} from "@src/core/runtime.ts";

const SETTING_MENU = 'setting_menu'

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: SETTING_MENU,
    title: '设置',
    contexts: ['action']
  })

  const r = await Runtime.getInstance()
  console.log(r)
})

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === SETTING_MENU) {
    await chrome.tabs.create({url: 'manager.html'})
  }
})
