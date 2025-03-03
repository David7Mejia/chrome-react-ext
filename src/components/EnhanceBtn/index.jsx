import React, { useEffect, useRef, useState, useCallback } from "react";
import { streamEnhancedPromptThunk } from "../../../store/features/prompt";
// import { useDispatch } from "react-redux";
/**
 * PLATFORM_CONFIGS would be whatever you have for:
 *   - domain, buttonSelector, containerSelector, textareaSelector, dynamicButtonCheck
 * For brevity, here's an example (shortened).
 */
const PLATFORM_CONFIGS = {
  chatgpt: {
    domain: "chatgpt.com",
    buttonSelector: 'button[aria-label="Send prompt"],button[aria-label="Start voice mode"], button[aria-label="Start voice input"], button[aria-label="Stop streaming"]',
    containerSelector: 'div[class*="flex"][class*="items-center"]',
    textareaSelector: "textarea",
    dynamicButtonCheck: false,
  },
  claude: {
    domain: "claude.ai",
    buttonSelector: 'button[type="submit"], button[aria-label="Upload content"]',
    containerSelector: 'div[class*="flex"]',
    textareaSelector: "textarea, [contenteditable='true']",
    dynamicButtonCheck: false,
  },
  gemini: {
    domain: "gemini.google.com",
    buttonSelector: 'button[aria-label*="send message"],button[aria-label*="Microphone"], button[class*="hidden"]',
    containerSelector: 'div[class*="send-button-container"],[class*="input-buttons-wrapper-bottom"]',
    textareaSelector: "div[class*='input-area']",
    dynamicButtonCheck: false,
    isGemini: false,
  },
  perplexity: {
    domain: "perplexity.ai",
    buttonSelector: 'button[type="Submit"], button[aria-label="Submit"], button[class*="text-textOff"], button[class*="text-white"]',
    containerSelector: 'div[class*="flex"][class*="items-center"]',
    textareaSelector: "textarea",
    dynamicButtonCheck: true,
  },
  copilot: {
    domain: "copilot.microsoft.com",
    buttonSelector: 'button[aria-label*="Talk to Copilot"], button[aria-label="Submit message"]',
    containerSelector: 'div[class*="flex"]',
    textareaSelector: 'textarea[placeholder*="Enter a message"], textarea.copilot-textarea',
    dynamicButtonCheck: true,
  },
  notebookllm: {
    domain: "notebooklm.google.com",
    buttonSelector: 'button[aria-label*="Submit"], button[disabled="true"], button[class*="submit-button"]',
    containerSelector: 'div[class*="input-group"]',
    textareaSelector: 'textarea[aria-label*="Query box"]',
    dynamicButtonCheck: true,
  },
  sora: {
    domain: "sora.com",
    buttonSelector: 'button[type="submit"], button[data-disabled="false"], button[data-disabled="true"]',
    containerSelector: 'div[class*="flex"], [class*="items-center"]',
    textareaSelector: "textarea, [contenteditable='true']",
    dynamicButtonCheck: true,
  },
  grok: {
    domain: "x.com",
    buttonSelector: 'button[aria-label="Grok something"], button[aria-label="Cancel"], button[aria-disabled="true"]',
    containerSelector: 'div[class*="css-175oi2r"]',
    textareaSelector: "textarea, [contenteditable='true']",
    dynamicButtonCheck: false,
  },
  deepseek: {
    domain: "chat.deepseek.com",
    buttonSelector: 'div[class*="f6d670"], div[class*="bcc55ca1"]',
    containerSelector: 'div[class*="flex"]',
    textareaSelector: "textarea",
    dynamicButtonCheck: false,
  },
};

/** Helper that checks the current domain and returns the matched platform key */
const getCurrentPlatform = () => {
  const host = window.location.hostname;
  const found = Object.entries(PLATFORM_CONFIGS).find(([key, cfg]) => cfg.domain.split(".").every(part => host.includes(part)));
  return found ? found[0] : null;
};

/** Finds the container in which to position the button, if any. */
const findPlatformButtonDiv = el => {
  const platform = getCurrentPlatform();
  if (!platform) return null;
  const cfg = PLATFORM_CONFIGS[platform];
  let node = el;

  // If the platform has dynamicButtonCheck, we might try to see if the site’s
  // official button is already in the DOM, etc. (like in prompt-enhancer.js)
  if (cfg.dynamicButtonCheck) {
    document.querySelector(cfg.buttonSelector);
    // Possibly check an alternativeButtonSelector, if any, etc.
  }

  // Walk upward until we find something that has the site’s official button.
  while (node && node.tagName !== "BODY") {
    if (node.querySelector(cfg.buttonSelector)) {
      return node.closest(cfg.containerSelector) || node;
    }
    node = node.parentElement;
  }

  // Fallback: If we never found the container, we might
  // just find the main text area and get that container
  const fallbackArea = document.querySelector(cfg.textareaSelector);
  if (fallbackArea) {
    return fallbackArea.closest(cfg.containerSelector) || null;
  }
  return null;
};

/** The main “Enhance” button we’ll insert. We store a reference so we can remove it if needed. */
let currentEnhanceButton = null;
let observer = null;
let targetContainer = null;

/** Remove existing #pk_prompt_btn if we’ve created one before. */
const removeEnhanceButton = () => {
  if (currentEnhanceButton) {
    currentEnhanceButton.remove();
    currentEnhanceButton = null;
  }
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  targetContainer = null;
};

/** Positions the button for the recognized platform. */
const positionButton = () => {
  if (!currentEnhanceButton || !targetContainer) return;
  const platform = getCurrentPlatform();
  if (!platform) return;

  const cfg = PLATFORM_CONFIGS[platform];
  const containerRect = targetContainer.getBoundingClientRect();
  const buttonSize = 36; // Match the size defined in BUTTON_STYLES

  // Try to find the platform's button within the container
  const platformButton = targetContainer.querySelector(cfg.buttonSelector);

  if (platformButton) {
    // Position relative to the platform's button
    const platformButtonRect = platformButton.getBoundingClientRect();
    let top = window.scrollY + platformButtonRect.top + (platformButtonRect.height - buttonSize) / 2;
    let left = window.scrollX + platformButtonRect.left - buttonSize - 12; // Default 12px spacing

    // Platform-specific adjustments
    switch (platform) {
      case "chatgpt":
        // Fine-tune for ChatGPT's layout
        left = window.scrollX + platformButtonRect.left - buttonSize - 16;
        break;
      case "claude":
        // Claude's button needs more space
        left = window.scrollX + platformButtonRect.left - buttonSize - 20;
        break;
      case "gemini":
        // Gemini has a different layout
        left = window.scrollX + platformButtonRect.left - buttonSize - 14;
        break;
      case "perplexity":
        // Perplexity has a compact layout
        left = window.scrollX + platformButtonRect.left - buttonSize - 10;
        break;
      case "notebookllm":
        // NotebookLM needs extra space
        left = window.scrollX + platformButtonRect.left - buttonSize - 24;
        break;
      case "deepseek":
        left = window.scrollX + platformButtonRect.left - buttonSize - 50;
      default:
        // Default positioning already set
        break;
    }

    currentEnhanceButton.style.top = `${top}px`;
    currentEnhanceButton.style.left = `${left}px`;
  } else {
    // Fallback to container-based positioning if no platform button is found
    let top = window.scrollY + containerRect.top + (containerRect.height - buttonSize) / 2;
    let left = window.scrollX + containerRect.left + containerRect.width - buttonSize - 20;

    // Some domain-specific tweaks for fallback positioning
    switch (platform) {
      case "chatgpt":
        left -= 30; // ChatGPT needs more space from right edge
        break;
      case "claude":
        left -= 25;
        break;
      case "gemini":
        left -= 40; // Gemini has other buttons on right edge
        break;
      default:
        // Default offset
        break;
    }

    currentEnhanceButton.style.top = `${top}px`;
    currentEnhanceButton.style.left = `${left}px`;
  }
};

/** Actually create the <button> & inject it into the DOM. Similar to “addButton()” in prompt-enhancer.js */
function createEnhanceButton(container, textInput, platform, onEnhance) {
  removeEnhanceButton(); // ensure old one is gone
  const imageUrl = chrome.runtime.getURL("brain-logo.svg");
  const BUTTON_STYLES = {
    position: "absolute",
    zIndex: 9999,
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    backgroundColor: "#c6c6cb",
    color: "#fff",
    border: "1px solid transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  };

  const btn = document.createElement("button");
  btn.id = "pk_prompt_btn";
  //   btn.innerText = "Enhance"; // or replace with an icon
  Object.assign(btn.style, BUTTON_STYLES);

  // Create an img
  const icon = document.createElement("img");
  icon.src = imageUrl;
  icon.style.width = "24px"; // adjust as needed
  icon.style.height = "24px";
  icon.alt = "Enhance";

  // Append to button
  btn.appendChild(icon);

  // On click, do the “enhance” logic
  btn.addEventListener("click", evt => {
    evt.stopPropagation();
    onEnhance(textInput);
  });

  // Add hover effects via event listeners
  btn.addEventListener("mouseenter", () => {
    btn.style.backgroundColor = "#64d3d9";
    // btn.style.transform = "translateY(-1px)";
    // btn.style.boxShadow = "0 4px 12px rgba(11, 27, 249, 0.35)";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.backgroundColor = "#c6c6cb";
    btn.style.transform = "none";
    // btn.style.boxShadow = "0 2px 8px #64d3d9";
  });
  // Append to body, store references
  document.body.appendChild(btn);
  currentEnhanceButton = btn;
  targetContainer = container;

  // position the button right away
  positionButton();

  // watch for container changes
  observer = new MutationObserver(positionButton);
  observer.observe(container, { childList: true, subtree: true, attributes: true, characterData: true });

  // also watch for resize / scroll
  window.addEventListener("scroll", positionButton, true);
  window.addEventListener("resize", positionButton, true);
}

/** The actual "enhance" logic - "handleEnhancePrompt" from the reference. */
async function handleEnhancePrompt(textInput) {
  // More robust content extraction from various input types
  let content = "";

  try {
    // Handle different types of input fields
    if (textInput.isContentEditable) {
      content = textInput.textContent || textInput.innerText;
    } else if (textInput.value !== undefined) {
      content = textInput.value;
    } else if (textInput.querySelector) {
      // For complex elements that might contain the text in child nodes
      const innerTextElement = textInput.querySelector("[contenteditable='true']") || textInput.querySelector("textarea") || textInput.querySelector("input");
      if (innerTextElement) {
        content = innerTextElement.value || innerTextElement.textContent || innerTextElement.innerText;
      } else {
        // Last resort - try to get any text content
        content = textInput.textContent || textInput.innerText;
      }
    }

    // For Gemini which may have a different structure
    if (!content && getCurrentPlatform() === "gemini") {
      const inputArea = document.querySelector("div[class*='input-area']");
      if (inputArea) {
        content = inputArea.textContent || inputArea.innerText;
      }
    }

    content = content?.trim();
    console.log("Content found:", content ? content.substring(0, 50) + "..." : "None");
  } catch (error) {
    console.error("Error extracting content:", error);
  }

  if (!content) {
    console.log("No content to enhance");
    return;
  }

  // check if user is logged in (just a dummy check)
  const storage = await new Promise(resolve => {
    chrome.storage.local.get("sessionState", res => {
      resolve(res.sessionState);
    });
  });

  if (!storage?.jwtToken) {
    console.log("No token => show login modal");
    // showLoginModal()
    return;
  }

  // Dispatch the same action used in SidePanel component
  try {
    console.log("Enhancing prompt via Redux:", content);

    // Create a chrome runtime message to send to the background script
    chrome.runtime.sendMessage(
      {
        type: "DISPATCH_REDUX_ACTION",
        payload: {
          action: "streamEnhancedPrompt",
          content: content,
          framework: "", // You may want to add framework selection
        },
      },
      response => {
        console.log("Action dispatched response:", response);
      }
    );
  } catch (err) {
    console.error("Enhance failed:", err);
  }
}

async function extractPromptContent(textInput) {
  let content = "";

  try {
    // Handle different types of input fields
    if (textInput.isContentEditable) {
      content = textInput.textContent || textInput.innerText;
    } else if (textInput.value !== undefined) {
      content = textInput.value;
    } else if (textInput.querySelector) {
      // For complex elements that might contain the text in child nodes
      const innerTextElement = textInput.querySelector("[contenteditable='true']") || textInput.querySelector("textarea") || textInput.querySelector("input");
      if (innerTextElement) {
        content = innerTextElement.value || innerTextElement.textContent || innerTextElement.innerText;
      } else {
        // Last resort - try to get any text content
        content = textInput.textContent || textInput.innerText;
      }
    }

    // For Gemini which may have a different structure
    if (!content && getCurrentPlatform() === "gemini") {
      const inputArea = document.querySelector("div[class*='input-area']");
      if (inputArea) {
        content = inputArea.textContent || inputArea.innerText;
      }
    }

    content = content?.trim();
    console.log("Content found:", content ? content.substring(0, 50) + "..." : "None");
  } catch (error) {
    console.error("Error extracting content:", error);
  }

  return content;
}

/** LLMEnhanceButton React component: sets up watchers for the text area on recognized domains. */
const EnhanceBtn = () => {
  const platformRef = useRef(getCurrentPlatform() || null);

  useEffect(() => {
    if (!platformRef.current) {
      console.log("LLMEnhanceButton: Not a recognized LLM domain");
      return;
    }

    const platform = platformRef.current;
    const cfg = PLATFORM_CONFIGS[platform];
    if (!cfg) return;

    function checkAndAddButton() {
      const textArea = document.querySelector(cfg.textareaSelector);
      if (!textArea) return;

      const container = findPlatformButtonDiv(textArea);
      if (!container) return;

      if (!document.getElementById("pk_prompt_btn")) {
        createEnhanceButton(container, textArea, platform);
      } else {
        positionButton();
      }
    }

    checkAndAddButton();

    const observer = new MutationObserver(() => {
      checkAndAddButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function handleFocusIn(evt) {
      const target = evt.target;
      if (!target) return;
      if (target.matches(cfg.textareaSelector) || target.isContentEditable) {
        const container = findPlatformButtonDiv(target);
        if (container && !document.getElementById("pk_prompt_btn")) {
          createEnhanceButton(container, target, platform);
        }
      }
    }
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("scroll", positionButton, true);
      window.removeEventListener("resize", positionButton, true);
      removeEnhanceButton();
    };
  }, []);

  return null;
};
export default EnhanceBtn;
