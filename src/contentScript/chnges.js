/* contentScript.js */

import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./contentScript.css";

const PLATFORM_CONFIGS = {
  chatgpt: {
    domain: "chatgpt.com",
    textareaSelector: "textarea",
    // ... any other config
  },
  // ... other platforms
};

function getCurrentPlatform() {
  const host = window.location.hostname;
  const found = Object.entries(PLATFORM_CONFIGS).find(([key, cfg]) => cfg.domain.split(".").every(part => host.includes(part)));
  return found ? found[0] : null;
}

// Example bubble button or icon
const imageUrl = chrome.runtime.getURL("nodes_nbg_dark.svg");
const Bubble = () => {
  const handleClick = () => {
    chrome.runtime.sendMessage({ type: "openSidePanel" }, response => {
      console.log("Bubble: openSidePanel response:", response);
    });
  };

  return (
    <div className="bubble-boy" onClick={handleClick}>
      <div className="nodes-svg" style={{ backgroundImage: `url(${imageUrl})` }} />
    </div>
  );
};

// Main overlay for the "Enhance" button
function OverlayApp({ platform }) {
  const [rect, setRect] = useState(null);
  const textAreaRef = useRef(null);

  // On mount, find the text area and store its bounding rect
  useEffect(() => {
    const config = PLATFORM_CONFIGS[platform];
    if (!config) return;

    // e.g. for chatgpt => "textarea", or for claude => "textarea,[contenteditable]", etc.
    const textArea = document.querySelector(config.textareaSelector);
    if (!textArea) return;

    textAreaRef.current = textArea;

    // measure once
    const measure = () => {
      const r = textArea.getBoundingClientRect();
      setRect({
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        height: r.height,
      });
    };
    measure();

    // remeasure on scroll/resize
    const handleChange = () => measure();
    window.addEventListener("scroll", handleChange, true);
    window.addEventListener("resize", handleChange, true);

    // optional: observe DOM changes if the site might reposition the text area
    const obs = new MutationObserver(() => measure());
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", handleChange, true);
      window.removeEventListener("resize", handleChange, true);
      obs.disconnect();
    };
  }, [platform]);

  // Called when user clicks "Enhance" or similar
  const handleEnhance = () => {
    if (!textAreaRef.current) return;
    let content = textAreaRef.current.value || textAreaRef.current.innerText || "";
    content = content.trim();
    if (!content) {
      console.warn("No content in the input field.");
      return;
    }
    chrome.runtime.sendMessage({ type: "enhancePrompt", content }, response => {
      if (chrome.runtime.lastError) {
        console.error("Message failed:", chrome.runtime.lastError.message);
      } else {
        console.log("Enhance response:", response);
      }
    });
  };

  return (
    <>
      {/* Optional bubble in corner */}
      <div id="bubble-container">
        <Bubble />
      </div>

      {/* If we have a rect, show the always-on overlay button */}
      {rect && (
        <div
          className="input-overlay"
          style={{
            position: "absolute",
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            zIndex: 9999,
          }}
        >
          <button className="enhance-btn" onClick={handleEnhance}>
            <div className="quick-access-btn" />
          </button>
        </div>
      )}
    </>
  );
}

// Initialize if recognized domain
function initializeOverlay() {
  const platform = getCurrentPlatform();
  if (!platform) return;

  if (document.getElementById("prompt-enhancer-root")) return;

  const root = document.createElement("div");
  root.id = "prompt-enhancer-root";
  document.body.appendChild(root);

  createRoot(root).render(<OverlayApp platform={platform} />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeOverlay);
} else {
  initializeOverlay();
}

// If site is SPA, watch for DOM changes to re-inject if needed
const navigationObserver = new MutationObserver(() => {
  requestAnimationFrame(initializeOverlay);
});
navigationObserver.observe(document.body, { childList: true, subtree: true });
