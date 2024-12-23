import {Runtime} from "@src/core/runtime.ts";
import { Config } from '@src/core/config.ts';

const SETTING_MENU = 'setting_menu'

const SELECTION_MENU = 'get_selected_text'

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: SETTING_MENU,
    title: '设置',
    contexts: ['action']
  })

  chrome.contextMenus.create({
    id: SELECTION_MENU,
    title: "添加到快捷回复",
    contexts: ["selection"],
  });

  const r = await Runtime.getInstance()
  console.log(r)
})

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === SETTING_MENU) {
    await chrome.tabs.create({url: 'manager.html'})
    return
  }
  if (info.menuItemId === SELECTION_MENU) {
    const config = new Config();
    await config.init()
    const shortcuts = config.shortcuts
    console.log(info)
    const selectedText = info.selectionText?.trim();
    if (!selectedText) return
    const newShortcuts = Array.isArray(shortcuts) ? [...shortcuts] : [
      '谢谢分享，感谢佬',
      'CCC，一天到晚就知道 C',
      '来不及解释了，快上车',
    ]
    newShortcuts.push(selectedText)
    config.updateConfig('shortcuts', Array.from(new Set(newShortcuts)))
    return Promise.resolve()
  }
})
