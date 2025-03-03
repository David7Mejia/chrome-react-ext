import React from "react";
import "./Bubble.css";
// Load bubble image from extension
const imageUrl = chrome.runtime.getURL("brain-logo.svg");
// Bubble Component
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

export default Bubble;
