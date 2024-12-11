import React from "react";
import ReactDOM from "react-dom/client";
import "./contentScript.css";
import nodes from "../static/nodes.svg";
import icon from "../static/icon.png";

console.log("Content script loaded!"); // Debug line
const imageUrl = chrome.runtime.getURL("nodes.svg");
// Just append a normal div for now

// console.log("Image URL:", imageUrl);

const container = document.createElement("div");
document.body.appendChild(container);

const Bubble = () => {
  return (
    <div className="bubble-boy">
      <img src={imageUrl} alt="No" className="nodes-svg" />
    </div>
  );
};

// Render without shadow root
ReactDOM.createRoot(container).render(<Bubble />);
