import {Runtime} from "@src/core/runtime.ts";

const SETTING_MENU = 'setting_menu'

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: SETTING_MENU,
    title: '设置',
    contexts: ['action']
  })

  await Runtime.getInstance()
})

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === SETTING_MENU) {
    await chrome.tabs.create({url: 'manager.html'})
  }
})
