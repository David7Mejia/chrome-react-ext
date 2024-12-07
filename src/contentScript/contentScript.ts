chrome.runtime.sendMessage("Hello from content script", res => {
  console.log("this is the response from content script", res);
});
