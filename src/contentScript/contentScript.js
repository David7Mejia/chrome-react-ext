import React from "react";
import ReactDOM from "react-dom/client";
import "./contentScript.css";
import { useState, useEffect, useRef } from "react";

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
  const editableDivRef = useRef(null); // Ref to store the contenteditable div

  useEffect(() => {
    const trackContentEditable = () => {
      const editableDiv = document.querySelector("#prompt-textarea");

      if (editableDiv) {
        console.log("ContentEditable div found:", editableDiv);
        editableDivRef.current = editableDiv; // Store the reference
      }
      // else {
      //   console.warn("ContentEditable div not found, retrying...");
      // }
    };

    // Initial Tracking
    trackContentEditable();

    // Observe DOM for dynamic changes
    const observer = new MutationObserver(() => {
      setTimeout(trackContentEditable, 100); // Slight delay for stability
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleClick = () => {
    if (!editableDivRef.current) {
      console.warn("ContentEditable div not found at click time.");
      alert("Unable to find the input field. Please try again.");
      return;
    }

    const content = editableDivRef.current.innerText.trim(); // Get and trim content

    if (!content) {
      console.warn("No content in the input field.");
      alert("Please enter some text before enhancing the prompt.");
      return;
    }

    console.log("Enhancer clicked. Current Input:", content);

    // Send content to the background script
    chrome.runtime.sendMessage({ type: "contenteditableUpdate", content }, response => {
      if (chrome.runtime.lastError) {
        console.error("Message failed:", chrome.runtime.lastError.message);
      } else {
        console.log("Background response (Enhancer):", response);
      }
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
