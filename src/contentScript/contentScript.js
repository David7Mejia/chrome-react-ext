import React from "react";
import ReactDOM from "react-dom/client";
import "./contentScript.css";
import { useRef, useEffect } from "react";

console.log("Content script loaded!"); // Debug line
const imageUrl = chrome.runtime.getURL("nodes_nbg_dark.svg");

// React component for the bubble
const Bubble = () => {
  const handleClick = () => {
    chrome.runtime.sendMessage({ type: "openSidePanel" }, response => {
      console.log("Background response:", response);
    });
  };

  return (
    <div className="bubble-boy" onClick={handleClick}>
      <div className="nodes-svg" style={{ backgroundImage: `url(${imageUrl})` }} />
    </div>
  );
};

// React component for the enhancer button
const Enhancer = ({ targetRef }) => {
  const handleClick = () => {
    if (!targetRef.current) {
      console.warn("Target textarea not found.");
      alert("Unable to find the input field. Please try again.");
      return;
    }

    const content = targetRef.current.innerText.trim(); // Get and trim content

    if (!content) {
      console.warn("No content in the input field.");
      alert("Please enter some text before enhancing the prompt.");
      return;
    }

    console.log("Enhancer clicked. Current Input:", content);

    // Send content to the background script
    chrome.runtime.sendMessage({ type: "enhancePrompt", content }, response => {
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

// Function to dynamically track and inject the enhancer button
const trackAndInjectEnhancer = () => {
  const targetRef = useRef(null);

  const trackTarget = () => {
    const target = document.querySelector("#composer-background #prompt-textarea");
    if (target) {
      console.log("Target textarea found:", target);
      targetRef.current = target;
      injectEnhancer(target, targetRef);
    } else {
      console.warn("Target textarea not found, retrying...");
    }
  };

  const injectEnhancer = (target, ref) => {
    if (document.getElementById("enhancer-btn-container")) return; // Prevent duplicates

    console.log("Injecting enhancer...");
    const enhancerContainer = document.createElement("div");
    enhancerContainer.id = "enhancer-btn-container";
    enhancerContainer.style.position = "absolute";
    enhancerContainer.style.top = `${target.offsetTop + target.offsetHeight + 10}px`;
    enhancerContainer.style.left = `${target.offsetLeft}px`;
    enhancerContainer.style.zIndex = "1000";

    document.body.appendChild(enhancerContainer);

    ReactDOM.createRoot(enhancerContainer).render(<Enhancer targetRef={ref} />);
  };

  // Initial tracking and injection
  trackTarget();

  // Observe DOM changes for dynamic injection
  const observer = new MutationObserver(() => {
    setTimeout(trackTarget, 100); // Delay for stability
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
  };
};

// Function to create the bubble and append it to the DOM
const createBubble = () => {
  if (document.getElementById("bubble-container")) return;

  console.log("Creating the bubble...");
  const bubbleContainer = document.createElement("div");
  bubbleContainer.id = "bubble-container";
  document.body.appendChild(bubbleContainer);

  ReactDOM.createRoot(bubbleContainer).render(<Bubble />);
};

// Inject the bubble and track the enhancer button
createBubble();
trackAndInjectEnhancer();

// Use MutationObserver to re-inject if elements are removed
const observer = new MutationObserver(() => {
  createBubble();
  trackAndInjectEnhancer();
});

observer.observe(document.body, { childList: true, subtree: true });
