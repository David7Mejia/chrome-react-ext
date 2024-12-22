import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "../../store";

// import "./popup.css";
import SidePanel from "../components/SidePanel";
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
