/******/ (() => { // webpackBootstrap
/*!**************************************!*\
  !*** ./src/background/background.js ***!
  \**************************************/
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("this is the message from content script", message);
  console.log("this is the sender from content script", sender);
  sendResponse("Hello from background");
});
/******/ })()
;
//# sourceMappingURL=background.js.map