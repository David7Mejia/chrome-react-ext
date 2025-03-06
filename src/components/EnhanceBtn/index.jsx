import React, { useEffect, useRef, useState, useCallback } from "react";
import PLATFORM_CONFIGS from "./platforms.js";
import { getCurrentPlatform, findPlatformButtonDiv } from "./enhanceUtils";

const EnhanceBtn = () => {
  const platformRef = useRef(getCurrentPlatform() || null);
  const [currentContent, setCurrentContent] = useState("");
  const buttonRef = useRef(null);
  const textAreaRef = useRef(null);
  const containerRef = useRef(null);

  const positionButton = useCallback(() => {
    // Handles button positioning relative to the platform's UI
    // Uses containerRef to find the platform's button and position our enhance button next to it
    if (!buttonRef.current || !containerRef.current || !platformRef.current) return;

    const platform = platformRef.current;
    const cfg = PLATFORM_CONFIGS[platform];
    const containerRect = containerRef.current.getBoundingClientRect();
    const buttonSize = 36;

    const platformButton = containerRef.current.querySelector(cfg.buttonSelector);

    if (platformButton) {
      const buttonRect = platformButton.getBoundingClientRect();
      let top = window.scrollY + buttonRect.top + (buttonRect.height - buttonSize) / 2;
      let left = window.scrollX + buttonRect.left - buttonSize - 12;

      buttonRef.current.style.top = `${top}px`;
      buttonRef.current.style.left = `${left}px`;
    }
  }, []);

  // Simple content tracking function
  const handleContentChange = useCallback(
    element => {
      let content = "";

      // For ChatGPT, find the visible input
      // For ChatGPT's updated structure
      if (platformRef.current === "chatgpt") {
        // First try the ProseMirror editor
        const proseMirror = document.querySelector('[contenteditable="true"].ProseMirror');
        if (proseMirror) {
          content = proseMirror.textContent;
          console.log("Found content in ProseMirror:", content);
        } else {
          // Fallback to other possible selectors
          const visibleInput = document.querySelector("#prompt-textarea") || document.querySelector('[role="textbox"]') || document.querySelector('[data-testid="textbox"]');

          if (visibleInput) {
            content = visibleInput.value || visibleInput.textContent || visibleInput.innerText;
            console.log("Found content in fallback input:", content);
          }
        }
      } else if (element.isContentEditable) {
        content = element.textContent || element.innerText;
      } else if (element.value !== undefined) {
        content = element.value;
      }

      // Special cases remain the same...
      if (!content && platformRef.current === "gemini") {
        const inputArea = document.querySelector("div[class*='input-area']");
        if (inputArea) {
          content = inputArea.textContent || inputArea.innerText;
        }
      }

      content = content?.trim() || "";
      console.log("Content extracted:", content ? content.substring(0, 50) + "..." : "None");
      setCurrentContent(content);
    },
    [platformRef]
  );

  // API call handler
  const handleEnhance = useCallback(async () => {
    // Get the current textarea content directly when clicked
    const textArea = textAreaRef.current;
    if (!textArea) {
      console.error("No textarea reference found");
      return;
    }

    // Try to get content from multiple possible sources
    let clickedContent = "";

    // Check for ChatGPT's specific structure
    if (platformRef.current === "chatgpt") {
      // Find the visible input element
      const visibleInput = document.querySelector('[role="textbox"]') || document.querySelector("#prompt-textarea") || document.querySelector('[data-testid="textbox"]');

      if (visibleInput) {
        console.log("Found visible input:", visibleInput);
        clickedContent = visibleInput.value || visibleInput.textContent || visibleInput.innerText;
      }
    } else if (textArea.isContentEditable) {
      clickedContent = textArea.textContent || textArea.innerText;
    } else if (textArea.value !== undefined) {
      clickedContent = textArea.value;
    }

    console.log("Button clicked, content check:", {
      textAreaContent: clickedContent,
      storedContent: currentContent,
      textAreaRef: textArea,
      platform: platformRef.current,
    });

    // Use either the directly fetched content or stored content
    const contentToEnhance = clickedContent || currentContent;

    if (!contentToEnhance) {
      console.log("No content to enhance");
      return;
    }

    try {
      console.log("Sending to backend:", contentToEnhance);
      const response = await fetch("http://localhost:5500/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: contentToEnhance,
          framework: "",
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Enhancement successful:", data);

      // Update textarea content
      if (textArea) {
        const enhancedText = data.enhancedPrompt || data.result || data;
        if (textArea.isContentEditable) {
          textArea.textContent = enhancedText;
        } else if (textArea.value !== undefined) {
          textArea.value = enhancedText;
        }
        textArea.dispatchEvent(new Event("input", { bubbles: true }));

        // Update our stored content
        setCurrentContent(enhancedText);
      }
    } catch (err) {
      console.error("Enhancement failed:", err);
    }
  }, [currentContent, platformRef]);

  // Setup button and content tracking
  useEffect(() => {
    if (!platformRef.current) return;

    const platform = platformRef.current;
    const cfg = PLATFORM_CONFIGS[platform];
    if (!cfg) return;

    // Find textarea and setup content tracking
    const textArea = document.querySelector(cfg.textareaSelector);
    if (!textArea) return;

    textAreaRef.current = textArea;

    // Initial content
    handleContentChange(textArea);

    // Setup input listeners with more events
    const handleInput = () => {
      console.log("Input event triggered");
      handleContentChange(textArea);
    };

    textArea.addEventListener("input", handleInput);
    textArea.addEventListener("change", handleInput);
    textArea.addEventListener("keyup", handleInput);
    textArea.addEventListener("paste", handleInput);

    // Create a MutationObserver for content changes
    const contentObserver = new MutationObserver(() => {
      console.log("Content mutation detected");
      handleContentChange(textArea);
    });

    contentObserver.observe(textArea, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    // Create enhance button
    const container = findPlatformButtonDiv(textArea);
    if (!container) return;

    containerRef.current = container;

    //? ***********CREATE BUTTON***********
    const btn = document.createElement("button");
    btn.id = "pk_prompt_btn";
    Object.assign(btn.style, {
      position: "fixed", // Changed from absolute to fixed
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
    });

    //? ***********BUTTON STYLES***********
    const icon = document.createElement("img");
    icon.src = chrome.runtime.getURL("brain-logo.svg");
    icon.style.width = "24px";
    icon.style.height = "24px";
    icon.alt = "Enhance";
    btn.appendChild(icon);

    btn.addEventListener("click", evt => {
      evt.stopPropagation();
      console.log("Button clicked, current textarea:", textAreaRef.current);
      handleEnhance();
    });
    btn.addEventListener("mouseenter", () => {
      btn.style.backgroundColor = "#64d3d9";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.backgroundColor = "#c6c6cb";
    });

    document.body.appendChild(btn);
    buttonRef.current = btn;
    //*******************************?

    // Initial positioning
    positionButton();

    //? Setup observers and event listeners
    const observer = new MutationObserver(positionButton);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    window.addEventListener("scroll", positionButton, true);
    window.addEventListener("resize", positionButton, true);

    // Cleanup
    return () => {
      observer.disconnect();
      contentObserver.disconnect();
      window.removeEventListener("scroll", positionButton, true);
      window.removeEventListener("resize", positionButton, true);
      textArea.removeEventListener("input", handleInput);
      textArea.removeEventListener("change", handleInput);
      textArea.removeEventListener("keyup", handleInput);
      textArea.removeEventListener("paste", handleInput);
      if (buttonRef.current) {
        buttonRef.current.remove();
      }
    };
  }, [handleContentChange, handleEnhance, positionButton]);

  return null;
};

export default EnhanceBtn;
