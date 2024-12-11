import React from "react";
import { createRoot } from "react-dom/client"; // Correct import for React 18
import "./options.css";

const text = <img src="icon.png" />;

// Create a root container
const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

// Use `createRoot` instead of `ReactDom.render`
const root = createRoot(rootElement);
root.render(<React.StrictMode>{text}</React.StrictMode>);
