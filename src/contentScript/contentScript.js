import React from "react";
import ReactDOM from "react-dom/client";
import "./contentScript.css";

console.log("Content script loaded!"); // Debug line
const imageUrl = chrome.runtime.getURL("promptking.png");
// Just append a normal div for now

// console.log("Image URL:", imageUrl);

const container = document.createElement("div");
document.body.appendChild(container);

const Bubble = () => {
  const handleClick = () => {
    chrome.runtime.sendMessage({ type: "openSidePanel" }, response => {
      console.log("Background response:", response);
    });
  };
  return (
    <div className="bubble-boy" onClick={handleClick}>
      <img src={imageUrl} alt="No" className="nodes-svg" />
    </div>
  );
};

// Render without shadow root
ReactDOM.createRoot(container).render(<Bubble />);
