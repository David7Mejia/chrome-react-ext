/******/ (() => { // webpackBootstrap
/*!**************************************!*\
  !*** ./src/background/background.js ***!
  \**************************************/
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "contenteditableUpdate") {
    console.log("content editable update received from content script:", message === null || message === void 0 ? void 0 : message.content);
    sendResponse({
      status: "Content received",
      content: message === null || message === void 0 ? void 0 : message.content
    });
    return true; // Keep the sendResponse channel open
  }
  if (message.type === "openSidePanel") {
    if (sender.tab) {
      chrome.sidePanel.open({
        windowId: sender.tab.windowId
      }).then(function () {
        sendResponse({
          status: "Side panel opened"
        });
      })["catch"](function (err) {
        console.error("Failed to open side panel:", err);
        sendResponse({
          status: "error",
          error: err
        });
      });
      return true; // Keep the message channel open for sendResponse
    } else {
      sendResponse({
        status: "no-tab-context"
      });
    }
  }
});

// Re-inject content scripts and CSS on page updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.url) {
    chrome.scripting.executeScript({
      target: {
        tabId: tabId
      },
      files: ["contentScript/contentScript.js"]
    });
    chrome.scripting.insertCSS({
      target: {
        tabId: tabId
      },
      files: ["contentScript/contentScript.css"]
    });
  }
});

// Optional: Add event listener for when the extension is installed
chrome.runtime.onInstalled.addListener(function () {
  console.log("Extension installed!");
});
/******/ })()
;
//# sourceMappingURL=background.js.map