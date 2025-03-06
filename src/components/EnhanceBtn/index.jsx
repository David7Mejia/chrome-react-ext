import React, { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { enhanceContentThunk, updateContent } from "../../../store/features/enhanceBtnReducer";
import PLATFORM_CONFIGS from "./platforms.js";
import { getCurrentPlatform, findPlatformButtonDiv } from "./enhanceUtils";

const EnhanceBtn = () => {
  const dispatch = useDispatch();
  const currentContent = useSelector(state => state.enhanceBtn.currentContent);

  const platformRef = useRef(getCurrentPlatform() || null);
  const buttonRef = useRef(null);
  const textAreaRef = useRef(null);
  const containerRef = useRef(null);

  const positionButton = useCallback(() => {
    if (!buttonRef.current || !containerRef.current || !platformRef.current) return;

    const platform = platformRef.current;
    const cfg = PLATFORM_CONFIGS[platform];
    const platformButton = containerRef.current.querySelector(cfg.buttonSelector);

    if (platformButton) {
      const buttonRect = platformButton.getBoundingClientRect();
      const buttonSize = 36;
      let top = window.scrollY + buttonRect.top + (buttonRect.height - buttonSize) / 2;
      let left = window.scrollX + buttonRect.left - buttonSize - 12;

      buttonRef.current.style.top = `${top}px`;
      buttonRef.current.style.left = `${left}px`;
    }
  }, []);

  const handleContentChange = useCallback(
    element => {
      let content = "";

      if (platformRef.current === "chatgpt") {
        const proseMirror = document.querySelector('[contenteditable="true"].ProseMirror');
        if (proseMirror) {
          content = proseMirror.textContent;
        } else {
          const visibleInput = document.querySelector("#prompt-textarea") || document.querySelector('[role="textbox"]');
          if (visibleInput) {
            content = visibleInput.value || visibleInput.textContent;
          }
        }
      } else if (element.isContentEditable) {
        content = element.textContent;
      } else if (element.value !== undefined) {
        content = element.value;
      }

      content = content?.trim() || "";
      dispatch(updateContent(content));
    },
    [platformRef, dispatch]
  );

  const handleEnhance = useCallback(() => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    let clickedContent = "";

    if (platformRef.current === "chatgpt") {
      const visibleInput = document.querySelector('[contenteditable="true"].ProseMirror') || document.querySelector("#prompt-textarea");
      if (visibleInput) {
        clickedContent = visibleInput.value || visibleInput.textContent;
      }
    } else {
      clickedContent = textArea.value || textArea.textContent;
    }

    const contentToEnhance = clickedContent || currentContent;
    if (!contentToEnhance) return;

    // Fix: Send the content directly as the prompt string
    dispatch(
      enhanceContentThunk({
        content: contentToEnhance, // This is being sent as { content: "string" }
        textArea,
      })
    );
  }, [currentContent, platformRef, dispatch]);

  useEffect(() => {
    if (!platformRef.current) return;

    const platform = platformRef.current;
    const cfg = PLATFORM_CONFIGS[platform];
    if (!cfg) return;

    const textArea = document.querySelector(cfg.textareaSelector);
    if (!textArea) return;

    textAreaRef.current = textArea;
    handleContentChange(textArea);

    const handleInput = () => handleContentChange(textArea);
    textArea.addEventListener("input", handleInput);

    const container = findPlatformButtonDiv(textArea);
    if (!container) return;
    containerRef.current = container;

    const btn = document.createElement("button");
    btn.id = "pk_prompt_btn";
    Object.assign(btn.style, {
      position: "fixed",
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
    });

    const icon = document.createElement("img");
    icon.src = chrome.runtime.getURL("brain-logo.svg");
    icon.style.width = "24px";
    icon.style.height = "24px";
    icon.alt = "Enhance";
    btn.appendChild(icon);

    btn.addEventListener("click", handleEnhance);

    document.body.appendChild(btn);
    buttonRef.current = btn;
    positionButton();

    const observer = new MutationObserver(positionButton);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      textArea.removeEventListener("input", handleInput);
      if (buttonRef.current) buttonRef.current.remove();
    };
  }, [handleContentChange, handleEnhance, positionButton]);

  return null;
};

export default EnhanceBtn;
