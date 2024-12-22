import React from "react";
import ReactDOM from "react-dom/client";
import "./contentScript.css";
import { useState, useEffect } from "react";

console.log("Content script loaded!"); // Debug line
const imageUrl = chrome.runtime.getURL("nodes_nbg_dark.svg");

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

const Enhancer = () => {
  const [chatInput, setChatInput] = useState(""); // State for contenteditable content

  useEffect(() => {
    let editableDiv = null;

    const trackContentEditable = () => {
      editableDiv = document.querySelector("#composer-background [contenteditable='true']");

      if (editableDiv) {
        console.log("ContentEditable div found:", editableDiv);

        const handleInput = () => {
          const content = editableDiv.innerText || "";
          setChatInput(content);

          chrome.runtime.sendMessage({ type: "contenteditableUpdate", content }, response => {
            if (chrome.runtime.lastError) {
              console.error("Message failed:", chrome.runtime.lastError.message);
            } else {
              console.log("Background response (Enhancer):", response);
            }
          });
        };

        editableDiv.addEventListener("input", handleInput);
        editableDiv.addEventListener("keyup", handleInput);

        // Sync initial content
        handleInput();

        return () => {
          editableDiv.removeEventListener("input", handleInput);
          editableDiv.removeEventListener("keyup", handleInput);
        };
      } else {
        console.warn("ContentEditable div not found, retrying...");
      }
    };

    // Add slight delay to avoid early DOM observation
    const observer = new MutationObserver(() => {
      setTimeout(trackContentEditable, 100); // Delay by 100ms
    });

    trackContentEditable();
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (editableDiv) {
        editableDiv.removeEventListener("input", () => {});
        editableDiv.removeEventListener("keyup", () => {});
      }
    };
  }, []);

  useEffect(() => {
    console.log("Updated chatInput state:", chatInput);
  }, [chatInput]);

  const handleClick = () => {
    console.log("Enhancer clicked. Current Input:", chatInput);

    chrome.runtime.sendMessage({ type: "contenteditableUpdate", content: chatInput }, response => {
      console.log("Background response (Enhancer):", response);
    });
  };

  return (
    <button className="enhance-btn" onClick={handleClick}>
      Enhance Prompt
    </button>
  );
};


// Function to create the bubble and append it to the DOM
const createBubble = () => {
  // Check if the bubble already exists
  if (document.getElementById("bubble-container")) return;

  // Bubble creation
  console.log("Creating the bubble...");
  const bubbleContainer = document.createElement("div");
  bubbleContainer.id = "bubble-container";
  document.body.appendChild(bubbleContainer);

  ReactDOM.createRoot(bubbleContainer).render(<Bubble />);
};
// Function to create the enhancer and append it to the DOM
const createEnhancer = () => {
  if (document.getElementById("pk-enhancer-container")) return; // Prevent duplicates

  console.log("Creating the enhancer...");
  const enhancerContainer = document.createElement("div");
  enhancerContainer.id = "pk-enhancer-container";

  document.body.appendChild(enhancerContainer);

  ReactDOM.createRoot(enhancerContainer).render(<Enhancer />);
};

// Initial bubble injection
createBubble();
createEnhancer();

// Use MutationObserver to monitor DOM changes
const observer = new MutationObserver(() => {
  createBubble(); // Re-inject the bubble if removed
  createEnhancer(); // Re-inject the enhancer if removed
});

// Start observing the body for changes
observer.observe(document.body, { childList: true, subtree: true });
