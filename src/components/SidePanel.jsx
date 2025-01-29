import React, { useEffect, useState } from "react";
import "../styles/SidePanel.css";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import { getEnhancedPromptThunk, streamEnhancedPromptThunk } from "../../store/features/prompt";
import cn from "classnames";

const Message = ({ content, isUser }) => <div className={`message-bubble ${isUser ? "user-message" : "ai-message"}`}>{content}</div>;

const SidePanel = () => {
  const dispatch = useDispatch();
  const promptStream = useSelector(state => state.prompt?.streamedContent);
  const loading = useSelector(state => state.prompt.loading);
  const [clientMessages, setClientMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState([]);
  // const state = useSelector(state => state);
  // console.log("Redux State Test:", state);

  const [prompt, setPrompt] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);

  const frameworks = ["AIDA", "BAB", "PAS", "GRADE", "CREO", "FAB", "4C's", "PASTOR", "SCAMPER", "KISS", "Hero's Journey"];

  const handleEnhance = () => {
    if (!prompt || !selectedFramework) {
      alert("Please enter a prompt and select a framework.");
      return;
    }
    // Add user message to chat
    const userMessage = { content: prompt, isUser: true };
    setMessages(prev => [...prev, userMessage]);

    // Clear textarea
    setPrompt("");

    // Dispatching the thunk with the current prompt and selected framework
    // dispatch(getEnhancedPromptThunk({ prompt: prompt, framework: selectedFramework }));
    dispatch(streamEnhancedPromptThunk({ prompt: prompt, framework: selectedFramework }));
  };
  useEffect(() => {
    console.log("this is the prompt", prompt);
    // console.log("this is the state ********: ", state);
  }, [selectedTab, prompt]);
  useEffect(() => {
    if (promptStream) {
      setIsStreaming(true);
    }
  }, [promptStream]);
  const renderStructuredResponse = data => {
    try {
      const response = JSON.parse(data);
      return (
        <div className="chat-bubble response-bubble">
          <div className="section original">
            <h4 className="prompt-section-header">Original Prompt</h4>
            <p classname="original-prompt">{response?.original_prompt}</p>
          </div>
          <div className="section revised">
            <h4 className="prompt-section-header">Revised Prompt</h4>
            <p>{response?.revised_prompt}</p>
          </div>
          <div className="section questions">
            <h4 className="prompt-section-header">Questions to Consider</h4>
            <ul>
              {response?.questions?.map((q, i) => (
                <li key={`question-${i}`}>{q?.question}</li>
              ))}
            </ul>
          </div>

          <div className="section suggestions">
            <h4 className="prompt-section-header">Suggestions</h4>
            <ul>
              {response?.suggestions?.map((s, i) => (
                <li key={`suggestion-${i}`}>{s?.suggestion}</li>
              ))}
            </ul>
          </div>

          <div className="section meta-info">
            <div>
              <strong>Role:</strong> {response?.role}
            </div>
            <div>
              <strong>Context:</strong> {response?.context}
            </div>
            <div>
              <strong>Audience:</strong> {response?.target_audience}
            </div>
            <div>
              <strong>Objective:</strong> {response?.objective}
            </div>
          </div>
        </div>
      );
    } catch (e) {
      return (
        <div className="chat-bubble response-bubble">
          <p>{data}</p>
        </div>
      );
    }
  };
  return (
    <div className="sidepanel-container">
      <div className="sidepanel-top">
        {/* <p className="greeting-ptag">OCULUS</p> */}
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
          {promptStream && renderStructuredResponse(promptStream)}
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

              <button type="submit" disabled={loading} className="enhance-prompt-btn">
                {/* {loading ? "Enhancing..." : "Enhance Prompt"} */}
                {/* {selectedTab === 0 ? "Enhance Prompt" : "Send Message"} */}
              </button>
            </form>
          )}
        </Formik>

        {/* {promptStream && (
          <div className="enhanced-result">
            <h4>Enhanced Prompt:</h4>
            <p>{promptStream}</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default SidePanel;
