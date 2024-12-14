import React from "react";
import "../styles/SidePanel.css";
const SidePanel = () => {
  return (
    <div className="sidepanel-container">
      <div className="sidepanel-top">
        <p className="greeting-ptag">Hey there!</p>
        <span className="greeting-span">How can I assist you today</span>
      </div>

      <div className="chatbox-area">

      <textarea className="sidepanel-input" />

      </div>
    </div>
  );
};

export default SidePanel;
