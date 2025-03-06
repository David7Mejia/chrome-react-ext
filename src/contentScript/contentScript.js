import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/extension";
import enhanceBtnReducer from "../../store/features/enhanceBtnReducer";
import promptReducer from "../../store/features/prompt";
import "./contentScript.css";
import Bubble from "../components/Bubble";
import EnhanceBtn from "../components/EnhanceBtn";

// Logging Middleware (same as sidepanel)
const loggerMiddleware = store => next => action => {
  console.group(action.type);
  console.log("Previous State:", store.getState());
  console.log("Action:", action);
  const result = next(action);
  console.log("Next State:", store.getState());
  console.groupEnd();
  return result;
};

// Configure store
const store = configureStore({
  reducer: {
    enhanceBtn: enhanceBtnReducer,
    prompt: promptReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(loggerMiddleware),
  enhancers: getDefaultEnhancers => getDefaultEnhancers().concat(devToolsEnhancer()),
});

function ContentScriptApp() {
  return (
    <Provider store={store}>
      <Bubble />
      <EnhanceBtn />
    </Provider>
  );
}

function initializeOverlay() {
  if (document.getElementById("my-extension-root")) return;

  const container = document.createElement("div");
  container.id = "my-extension-root";
  document.body.appendChild(container);

  createRoot(container).render(
    <React.StrictMode>
      <ContentScriptApp />
    </React.StrictMode>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeOverlay);
} else {
  initializeOverlay();
}

const navigationObserver = new MutationObserver(() => {
  requestAnimationFrame(initializeOverlay);
});
navigationObserver.observe(document.body, { childList: true, subtree: true });
