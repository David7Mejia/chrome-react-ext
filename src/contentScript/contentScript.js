import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import "./contentScript.css";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/extension";
import Bubble from "../components/Bubble";
import EnhanceBtn from "../components/EnhanceBtn";
import cn from "classnames";
import promptReducer from "../../store/features/prompt";

// Logging Middleware
const loggerMiddleware = store => next => action => {
  console.group(action.type);
  console.log("%c Previous State:", "color: gray", store.getState());
  console.log("%c Action:", "color: blue", action);
  const result = next(action);
  console.log("%c Next State:", "color: green", store.getState());
  console.groupEnd();
  return result;
};

const store = configureStore({
  reducer: {
    prompt: promptReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(loggerMiddleware),
  enhancers: getDefaultEnhancers => getDefaultEnhancers().concat(devToolsEnhancer()),
});

function ContentScriptApp() {
  return (
    <>
      <Bubble />
      <EnhanceBtn />
    </>
  );
}

/**
 * Creates a root <div>, mounts our React app once.
 * We keep a check so we don't inject multiple times.
 */
function initializeOverlay() {
  // Avoid duplicates
  if (document.getElementById("my-extension-root")) return;

  // Create a container for our content script UI
  const container = document.createElement("div");
  container.id = "my-extension-root";
  document.body.appendChild(container);

  // Render the “ContentScriptApp”
  createRoot(container).render(<ContentScriptApp />);
}

// 1) If DOM not ready, wait; else inject right away
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeOverlay);
} else {
  initializeOverlay();
}

/**
 * 2) For single-page apps (SPAs), watch DOM changes
 *    and re-run initializeOverlay if e.g. route changed
 */
const navigationObserver = new MutationObserver(() => {
  // Using requestAnimationFrame so the DOM can settle
  requestAnimationFrame(initializeOverlay);
});
navigationObserver.observe(document.body, { childList: true, subtree: true });
