chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("this is the message from content script", message);
  console.log("this is the sender from content script", sender);
  sendResponse("Hello from background");
});
