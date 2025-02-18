import React, { useEffect, useState } from "react";
import "../styles/SidePanel.css";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import { streamEnhancedPromptThunk } from "../../store/features/prompt";
import ReactMarkdown from "react-markdown";
import cn from "classnames";
import { Modal, Button, Popover } from "antd";
import { SwapOutlined } from "@ant-design/icons";

const Message = ({ content, isUser }) => <div className={`message-bubble ${isUser ? "user-message" : "ai-message"}`}>{isUser ? content : <ReactMarkdown>{content}</ReactMarkdown>}</div>;

const SidePanel = () => {
  const dispatch = useDispatch();
  const promptStream = useSelector(state => state.prompt?.streamedContent);
  const loading = useSelector(state => state.prompt.loading);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);

  const [messageHistory, setMessageHistory] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const frameworks = ["AIDA", "BAB", "PAS", "GRADE", "CREO", "FAB", "4C's", "PASTOR", "SCAMPER", "KISS", "Hero's Journey"];

  // Reset streaming state when starting a new message
  useEffect(() => {
    if (!loading) {
      setIsStreaming(false);
      setActiveMessageId(null);
    }
  }, [loading]);

  // Handle streaming updates
  useEffect(() => {
    if (promptStream && activeMessageId) {
      setMessageHistory(prev => {
        return prev.map(message => {
          if (message.id === activeMessageId) {
            return {
              ...message,
              aiResponse: promptStream,
            };
          }
          return message;
        });
      });
    }
  }, [promptStream, activeMessageId]);

  const handleEnhance = () => {
    if (!prompt) {
      alert("Please enter a prompt and select a framework.");
      return;
    }

    // Create new message
    const newMessageId = Date.now();
    const newMessage = {
      id: newMessageId,
      userMessage: prompt,
      aiResponse: "",
      timestamp: new Date().toISOString(),
    };

    // Add new message to history
    setMessageHistory(prev => [...prev, newMessage]);
    setActiveMessageId(newMessageId);
    setIsStreaming(true);
    setPrompt("");

    // Dispatch with the new message ID
    dispatch(
      streamEnhancedPromptThunk({
        prompt: prompt,
        framework: selectedFramework,
        messageId: newMessageId,
      })
    );
  };

  const renderMessages = () => {
    return messageHistory.map(message => (
      <React.Fragment key={message.id}>
        <Message content={message.userMessage} isUser={true} />
        {message.aiResponse && <Message content={message.aiResponse} isUser={false} />}
      </React.Fragment>
    ));
  };

  // Modal handlers
  const showModal = () => setIsModalOpen(true);
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);
  const toggleCollapsed = () => setCollapsed(!collapsed);

  const content = (
    <div>
      <h2>Prompt Controls</h2>
      <p>Content</p>
    </div>
  );

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
          <div className="greeting-ptag">Hey!</div>
          <div className="greeting-span">What can I help you with today?</div>
        </span>
      </div>

      <div className="sp-message-container">
        <div className="chat-container">{renderMessages()}</div>
      </div>

      <div className="chatbox-area">
        <Formik initialValues={{ prompt: "" }} onSubmit={handleEnhance}>
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="sidepanel-form">
              {selectedTab === 0 && (
                <Modal title="Prompt Settings" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
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
                </Modal>
              )}

              <div className="toolbar-container">
                <div className="toolbar-left">
                  <Button type="filled" onClick={showModal}>
                    <SwapOutlined className="swap-icon" style={{ fontSize: "16px", color: "#08c" }} />
                  </Button>
                  <Popover
                    overlayClassName="advanced-options-popover"
                    color="#21262d"
                    arrow={false}
                    placement="topLeft"
                    className="advanced-options-btn"
                    content={content}
                    trigger="click"
                    type="primary"
                    onClick={toggleCollapsed}
                    style={{ marginBottom: 16 }}
                  />
                  <Button className="upload-btn" type="filled" onClick={showModal} />
                </div>

                <div className="toolbar-right">
                  <Button className="voice-btn" type="filled" onClick={showModal} />
                  <Button className="category-btn" type="filled" onClick={showModal} />
                  <Button className="more-btn" type="filled" onClick={showModal} />
                </div>
              </div>

              <textarea
                name="prompt"
                placeholder={selectedTab === 0 ? "Enter your prompt here..." : "Type your message..."}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
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
