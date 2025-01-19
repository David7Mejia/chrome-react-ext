/*
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/extension";
// Corrected import path:
import promptReducer from "../../store/features/prompt";
// import "./popup.css";
import SidePanel from "../components/SidePanel";

// // Logging Middleware
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

const rootElement = document.createElement("div");
document.body.appendChild(rootElement);
// add class or ID to the root element
rootElement.id = "promptking_root";
// First, create the root:
const root = createRoot(rootElement);

// Then, call root.render():
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <SidePanel />
    </Provider>
  </React.StrictMode>
);

*/
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Store } from "webext-redux";
import SidePanel from "../components/SidePanel";

// 2) Must use the same port name:
const store = new Store({ portName: "PROMPT_KING" });

store.ready().then(() => {
  let rootElement = document.getElementById("promptking_root");
  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.id = "promptking_root";
    document.body.appendChild(rootElement);
  }
  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <SidePanel />
      </Provider>
    </React.StrictMode>
  );

  console.log("Side panel rendered successfully");
});
