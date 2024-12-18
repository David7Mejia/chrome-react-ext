import React from "react";
import ReactDOM from "react-dom/client";
import "./contentScript.css";

console.log("Content script loaded!"); // Debug line
const imageUrl = chrome.runtime.getURL("nodes_nbg_dark.svg");

// Function to create the bubble and append it to the DOM
const createBubble = () => {
  // Check if the bubble already exists
  if (document.getElementById("bubble-container")) return;

  console.log("Creating the bubble...");
  const container = document.createElement("div");
  container.id = "bubble-container"; // Add a unique ID
  document.body.appendChild(container);

  // React component
  const Bubble = () => {
    const handleClick = () => {
      chrome.runtime.sendMessage({ type: "openSidePanel" }, response => {
        console.log("Background response:", response);
      });
    };

    return (
      <div className="bubble-boy" onClick={handleClick}>
        <div className="nodes-svg" style={{ backgroundImage: `url(${imageUrl})` }} />
        {/* <img src={imageUrl} alt="No" className="nodes-svg" /> */}
      </div>
    );
  };

  ReactDOM.createRoot(container).render(<Bubble />);
};

// Initial bubble injection
createBubble();

// Use MutationObserver to monitor DOM changes
const observer = new MutationObserver(() => {
  createBubble(); // Re-inject the bubble if removed
});

// Start observing the body for changes
observer.observe(document.body, { childList: true, subtree: true });
