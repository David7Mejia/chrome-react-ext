import React, { useEffect, useState } from "react";
import "../styles/SidePanel.css";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import { getEnhancedPromptThunk, streamEnhancedPromptThunk } from "../../store/features/prompt";
import ReactMarkdown from "react-markdown";
import cn from "classnames";

const Message = ({ content, isUser }) => <div className={`message-bubble ${isUser ? "user-message" : "ai-message"}`}>{isUser ? content : <ReactMarkdown>{content}</ReactMarkdown>}</div>;

const SidePanel = () => {
  const dispatch = useDispatch();
  const promptStream = useSelector(state => state.prompt?.streamedContent);
  const loading = useSelector(state => state.prompt.loading);
  const [clientMessages, setClientMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentStream, setCurrentStream] = useState("");

  const [prompt, setPrompt] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);

  const frameworks = ["AIDA", "BAB", "PAS", "GRADE", "CREO", "FAB", "4C's", "PASTOR", "SCAMPER", "KISS", "Hero's Journey"];

  const handleEnhance = () => {
    if (!prompt) {
      alert("Please enter a prompt and select a framework.");
      return;
    }
    const userMessage = { content: prompt, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setCurrentStream("");
    setPrompt("");
    dispatch(streamEnhancedPromptThunk({ prompt: prompt, framework: selectedFramework }));
  };

  useEffect(() => {
    console.log("this is the prompt", prompt);
  }, [selectedTab, prompt]);

  useEffect(() => {
    if (promptStream) {
      setIsStreaming(true);
      try {
        const response = JSON.parse(promptStream);
        let markdown = "";

        if (response.original_prompt) markdown += `### Original Prompt\n${response.original_prompt}\n\n`;
        if (response.revised_prompt) markdown += `### Revised Prompt\n${response.revised_prompt}\n\n`;

        if (response.questions?.length) {
          markdown += `### Questions to Consider\n`;
          response.questions.forEach(q => (markdown += `- ${q.question}\n`));
          markdown += "\n";
        }

        if (response.suggestions?.length) {
          markdown += `### Suggestions\n`;
          response.suggestions.forEach(s => (markdown += `- ${s.suggestion}\n`));
          markdown += "\n";
        }

        if (response.role || response.context || response.target_audience || response.objective) {
          markdown += `### Additional Information\n`;
          if (response.role) markdown += `**Role:** ${response.role}\n`;
          if (response.context) markdown += `**Context:** ${response.context}\n`;
          if (response.target_audience) markdown += `**Audience:** ${response.target_audience}\n`;
          if (response.objective) markdown += `**Objective:** ${response.objective}\n`;
        }

        setCurrentStream(markdown);
      } catch (e) {
        setCurrentStream(promptStream);
      }
    }
  }, [promptStream]);

  return (
    <div className="sidepanel-container">
      <div className="sidepanel-top">
        <div className="sidepanel-tabs">
          <div
            className={cn("sidepanel-tab spt-left", {
              selected_tab: selectedTab === 0,
            })}
            onClick={() => setSelectedTab(0)}
          >
            ENHANCE PROMPT
          </div>
          <div className="tab-divider"></div>
          <div
            className={cn("sidepanel-tab spt-right", {
              selected_tab: selectedTab === 1,
            })}
            onClick={() => setSelectedTab(1)}
          >
            CHAT
          </div>
        </div>
        <span className="greeting-span-container">
          <div classname="greeting-ptag">Hey!</div>
          <div className="greeting-span">What can I help you with today?</div>
        </span>
      </div>
      <div className="sp-message-container">
        <div className="chat-container">
          {messages.map((msg, index) => (
            <Message key={index} content={msg.content} isUser={msg.isUser} />
          ))}
          {currentStream && <Message content={currentStream} isUser={false} />}
        </div>
      </div>
      <div className="chatbox-area">
        <Formik initialValues={{ prompt: "" }} onSubmit={() => handleEnhance()}>
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="sidepanel-form">
              {selectedTab === 0 && (
                <select value={selectedFramework} onChange={e => setSelectedFramework(e.target.value)} className="framework-select">
                  <option value="" disabled>
                    Select Framework
                  </option>
                  {frameworks.map((framework, index) => (
                    <option key={index} value={framework}>
                      {framework}
                    </option>
                  ))}
                </select>
              )}
              <textarea
                name="prompt"
                placeholder={selectedTab === 0 ? "Enter your prompt here..." : "Type your message..."}
                value={prompt}
                onChange={e => {
                  console.log("this is the value:", e.target.value);
                  setPrompt(e.target.value);
                }}
                rows="5"
                className="sidepanel-input"
              />
              <button type="submit" disabled={loading} className="enhance-prompt-btn" />
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SidePanel;
