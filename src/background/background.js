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

//

/*
background.js (Manifest V3)
import { configureStore, createSlice, combineReducers } from "@reduxjs/toolkit";
import { createWrapStore } from "webext-redux";

1) Import your existing promptReducer from the file above:
import promptReducer from "../../store/features/prompt.js"; // <-- adjust path as needed!

2) appSlice
const appSlice = createSlice({
  name: "app",
  initialState: {
    content: null,
    sidePanelOpen: false,
  },
  reducers: {
    updateContent: (state, action) => {
      state.content = action.payload;
    },
    setSidePanelOpen: (state, action) => {
      state.sidePanelOpen = action.payload;
    },
  },
});
export const { updateContent, setSidePanelOpen } = appSlice.actions;

Combine both reducers into one rootReducer
const rootReducer = combineReducers({
  app: appSlice.reducer,
  prompt: promptReducer, // <--- now "state.prompt" is handled by your prompt.js code
});

4) Create the store with rootReducer
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware(),
});

5) wrapStore for MV3
const wrapStore = createWrapStore({ portName: "PROMPT_KING" });
wrapStore(store);

6) Event listeners as before
Listen for messages from content scripts, etc.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "contenteditableUpdate") {
    store.dispatch(updateContent(message.content));
    sendResponse({ status: "Content received", content: message?.content });
    return true;
  }

  if (message.type === "openSidePanel") {
    if (sender.tab) {
      chrome.sidePanel
        .open({ windowId: sender.tab.windowId })
        .then(() => {
          store.dispatch(setSidePanelOpen(true));
          sendResponse({ status: "Side panel opened" });
        })
        .catch(err => {
          console.error("Failed to open side panel:", err);
          sendResponse({ status: "error", error: err });
        });
      return true;
    } else {
      sendResponse({ status: "no-tab-context" });
    }
  }
});

Optional: tab updates or onInstalled listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
  console.log("Initial store state:", store.getState());
});

For debugging: see changes in the background console
store.subscribe(() => {
  console.log("Background store updated:", store.getState());
});

*/
