const allResourceTypes = Object.values(chrome.declarativeNetRequest.ResourceType);

const rules: chrome.declarativeNetRequest.Rule[] = [
  {
    id: 1,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      requestHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'origin',
          value: 'https://linux.do/',
        },
      ]
    },
    condition: {
      urlFilter: '/topics/timings',
      resourceTypes: allResourceTypes,
    }
  },
];

export {
  rules,
}