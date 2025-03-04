import React from "react";
import { createRoot } from "react-dom/client";
import "./popup.css";
import Popup from "../components/Popup";

const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

// First, create the root:
const root = createRoot(rootElement);

// Then, call root.render():
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
