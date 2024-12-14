chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "openSidePanel") {
    // Ensure we have a user gesture context (the click in contentScript triggers this)
    // sender.tab should be available, giving us a windowId
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
