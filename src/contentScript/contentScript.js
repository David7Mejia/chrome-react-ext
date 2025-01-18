import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./contentScript.css";
import cn from "classnames";

// Load bubble image from extension
const imageUrl = chrome.runtime.getURL("nodes_nbg_dark.svg");

// Input detection constants
const INPUT_SELECTORS = {
  textarea: "textarea, #prompt-textarea",
  contentEditable: '[contenteditable="true"]',
  placeholder: "[data-placeholder]",
};

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

// Main App Component
const OverlayApp = () => {
  const [textInputs, setTextInputs] = useState([]);
  const [focusedId, setFocusedId] = useState(null);

  // Find all text inputs on the page
  const findTextInputs = useCallback(() => {
    const inputs = [];
    Object.values(INPUT_SELECTORS).forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        const style = window.getComputedStyle(element);
        if (style.display !== "none" && style.visibility !== "hidden") {
          inputs.push({
            id: element.id || `input-${Math.random().toString(36).substr(2, 9)}`,
            element,
            type: element.matches(INPUT_SELECTORS.textarea) ? "textarea" : element.matches(INPUT_SELECTORS.contentEditable) ? "contentEditable" : "placeholder",
            rect: element.getBoundingClientRect(),
          });
        }
      });
    });
    return inputs;
  }, []);

  // Update inputs when DOM changes
  useEffect(() => {
    const updateInputs = () => {
      setTextInputs(findTextInputs());
    };

    // Initial setup
    updateInputs();

    // Setup mutation observer
    const observer = new MutationObserver(() => {
      requestAnimationFrame(updateInputs);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["contenteditable", "data-placeholder"],
    });

    return () => observer.disconnect();
  }, [findTextInputs]);

  // Setup focus listeners
  useEffect(() => {
    const handleFocus = input => {
      setFocusedId(input.id);
    };

    const handleBlur = () => {
      setFocusedId(null);
    };

    textInputs.forEach(input => {
      input.element.addEventListener("focus", () => handleFocus(input));
      input.element.addEventListener("blur", handleBlur);
    });

    return () => {
      textInputs.forEach(input => {
        input.element.removeEventListener("focus", () => handleFocus(input));
        input.element.removeEventListener("blur", handleBlur);
      });
    };
  }, [textInputs]);

  // Update positions on scroll/resize
  useEffect(() => {
    const handleViewportChange = () => {
      setTextInputs(prev =>
        prev.map(input => ({
          ...input,
          rect: input.element.getBoundingClientRect(),
        }))
      );
    };

    window.addEventListener("scroll", handleViewportChange);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, []);

  // Enhancer click handler
  const handleEnhance = useCallback(input => {
    let content = "";
    if (input.type === "textarea") {
      content = input.element.value || input.element.innerText;
    } else if (input.type === "contentEditable") {
      content = input.element.innerText;
    } else {
      content = input.element.textContent;
    }

    content = content.trim();
    if (!content) {
      console.warn("No content in the input field.");
      return;
    }

    chrome.runtime.sendMessage({ type: "enhancePrompt", content }, response => {
      if (chrome.runtime.lastError) {
        console.error("Message failed:", chrome.runtime.lastError.message);
      } else {
        console.log("Background response:", response);
      }
    });
  }, []);

  return (
    <>
      {/* Bubble */}
      <div id="bubble-container">
        <Bubble />
      </div>

      {/* Overlays */}
      <div className="overlay-container">
        {textInputs.map(
          input =>
            focusedId === input.id && (
              <div
                // key={input.id}
                className="input-overlay"
                style={{
                  position: "absolute",
                  top: input.rect.top + window.scrollY,
                  left: input.rect.left + window.scrollX,
                  width: input.rect.width,
                  height: input.rect.height,
                  zIndex: 9999,
                }}
              >
                <button
                  className={cn("enhance-btn", {
                    "enhance-btn--textarea": input.type === "textarea",
                    "enhance-btn--content-editable": input.type === "contentEditable",
                    "enhance-btn--placeholder": input.type === "placeholder",
                  })}
                  onClick={() => handleEnhance(input)}
                >
                  <div className="quick-access-btn" />
                </button>
              </div>
            )
        )}
      </div>
    </>
  );
};

// Initialize the app
const initializeOverlay = () => {
  // Check if app is already initialized
  if (document.getElementById("prompt-enhancer-root")) return;

  const root = document.createElement("div");
  root.id = "prompt-enhancer-root";
  document.body.appendChild(root);

  createRoot(root).render(<OverlayApp />);
};

// Run initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeOverlay);
} else {
  initializeOverlay();
}

// Re-initialize on navigation (for SPAs)
const navigationObserver = new MutationObserver(() => {
  requestAnimationFrame(initializeOverlay);
});

navigationObserver.observe(document.body, {
  childList: true,
  subtree: true,
});
