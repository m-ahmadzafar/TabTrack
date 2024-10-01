chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      const tabInfo = {
        id: tab.id,
        url: tab.url,
        openTime: Date.now() // Store the timestamp when the tab is created
      };
      chrome.storage.local.set({ [tab.id]: tabInfo });
    });
  });
});

chrome.tabs.onCreated.addListener(function (tab) {
  const tabInfo = {
    id: tab.id,
    url: tab.url,
    openTime: Date.now() // Store the timestamp when the tab is created
  };
  chrome.storage.local.set({ [tab.id]: tabInfo });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    const tabInfo = {
      id: tab.id,
      url: changeInfo.url,
      openTime: Date.now() // Update the timestamp when the tab URL changes
    };
    chrome.storage.local.set({ [tab.id]: tabInfo });
  }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  chrome.storage.local.remove(tabId.toString()); // Remove the tab info when the tab is closed
});



//   chrome.tabs.onCreated.addListener(groupTabs);
// chrome.tabs.onUpdated.addListener(groupTabs);
// chrome.tabs.onRemoved.addListener(groupTabs);

// function groupTabs() {
//   chrome.tabs.query({}, (tabs) => {
//     let groups = {};

//     tabs.forEach((tab) => {
//       let hostname = new URL(tab.url).hostname;
//       if (!groups[hostname]) {
//         groups[hostname] = [];
//       }
//       groups[hostname].push(tab);
//     });

//     chrome.storage.local.set({tabGroups: groups});
//   });
// }
