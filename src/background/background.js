// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "contenteditableUpdate") {
    console.log("content editable update received from content script:", message?.content);
    sendResponse({ status: "Content received", content: message?.content });
    return true; // Keep the sendResponse channel open
  }
  if (message.type === "openSidePanel") {
    if (sender.tab) {
      chrome.sidePanel
        .open({ windowId: sender.tab.windowId })
        .then(() => {
          sendResponse({ status: "Side panel opened" });
        })
        .catch(err => {
          console.error("Failed to open side panel:", err);
          sendResponse({ status: "error", error: err });
        });
      return true; // Keep the message channel open for sendResponse
    } else {
      sendResponse({ status: "no-tab-context" });
    }
  }
});

// Re-inject content scripts and CSS on page updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["contentScript/contentScript.js"],
    });
    chrome.scripting.insertCSS({
      target: { tabId },
      files: ["contentScript/contentScript.css"],
    });
  }
});

// Optional: Add event listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});

// chrome.contextMenus.create({
//   title: "Enhance with Oculus",
//   id: "enhance-with-oculus",
//   context: ["page", "selection", "link"],
// });
