import React, { useEffect, useState, useRef } from "react";
import "../styles/SidePanel.css";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import { getEnhancedPromptThunk, streamEnhancedPromptThunk } from "../../store/features/prompt";
import ReactMarkdown from "react-markdown";
import cn from "classnames";
// import "../styles/BracketHighlight.css";
import BracketEditor from "./BracketEditor";

// Ant Icons
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  SwapOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Modal, Button, Dropdown, Menu, Popover, Space, Switch } from "antd";

const Message = ({ content, isUser }) => (
<div className={`message-bubble ${isUser ? "user-message" : "ai-message"}`}>
  {isUser ? content : <ReactMarkdown>{content}</ReactMarkdown>}
  </div>);

const SidePanel = () => {
  const dispatch = useDispatch();
  const promptStream = useSelector(state => state.prompt?.streamedContent);
  const loading = useSelector(state => state.prompt.loading);
  const chatId = useSelector(state => state.prompt.chatId);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState([]);
  const [promptModeSwitch, setPromptModeSwitch] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  //REMOVE currentStream
  const [currentStream, setCurrentStream] = useState("");

  const [prompt, setPrompt] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const frameworks = ["AIDA", "BAB", "PAS", "GRADE", "CREO", "FAB", "4C's", "PASTOR", "SCAMPER", "KISS", "Hero's Journey"];
  const contentEditableRef = React.useRef(null);

  // Modal Handlers
  const showModal = () => {
    setIsModalOpen(true);
    console.log("these are the messages in the sidepanel:", messages);
  };
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);
  const toggleCollapsed = () => setCollapsed(!collapsed);

  // const items = [
  //   {
  //     key: "1",
  //     icon: <PieChartOutlined />,
  //     label: "Option 1",
  //   },
  //   {
  //     key: "2",
  //     icon: <DesktopOutlined />,
  //     label: "Option 2",
  //   },
  //   {
  //     key: "3",
  //     icon: <ContainerOutlined />,
  //     label: "Option 3",
  //   },
  //   {
  //     key: "sub1",
  //     label: "Navigation One",
  //     icon: <MailOutlined />,
  //     children: [
  //       {
  //         key: "5",
  //         label: "Option 5",
  //       },
  //       {
  //         key: "6",
  //         label: "Option 6",
  //       },
  //       {
  //         key: "7",
  //         label: "Option 7",
  //       },
  //       {
  //         key: "8",
  //         label: "Option 8",
  //       },
  //     ],
  //   },
  //   {
  //     key: "sub2",
  //     label: "Navigation Two",
  //     icon: <AppstoreOutlined />,
  //     children: [
  //       {
  //         key: "9",
  //         label: "Option 9",
  //       },
  //       {
  //         key: "10",
  //         label: "Option 10",
  //       },
  //       {
  //         key: "sub3",
  //         label: "Submenu",
  //         children: [
  //           {
  //             key: "11",
  //             label: "Option 11",
  //           },
  //           {
  //             key: "12",
  //             label: "Option 12",
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // ];

  const content = (
    <div>
      <h2>Prompt Controls</h2>
      <p>Content</p>
      <p>Content</p>
    </div>
  );
  const handleInput = e => {
    const content = e.currentTarget.innerText;
    setPrompt(content);
  };
  const handleEnhance = () => {
    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }
    const userMessage = { content: prompt, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    // setCurrentStream("");
    setPrompt("");
    // Only include chatId if it exists (for continuing conversations)
    const payload = {
      prompt,
      framework: selectedFramework,
      ...(chatId && { chatId }), // Conditionally add chatId
    };
    dispatch(streamEnhancedPromptThunk(payload));
  };

  const handleNewPrompt = () => {
    setMessages([]);
    setPrompt("");
    dispatch(clearChatId());
  };

  // useEffect(() => {
  //   if (promptStream) {
  //     setIsStreaming(true);
  //     try {
  //       setCurrentStream(JSON.parse(promptStream));
  //     } catch (e) {
  //       setCurrentStream(promptStream);
  //     }
  //   }
  // }, [promptStream]);

  useEffect(() => {
    let container = document.querySelector(".sidepanel-top");
    let blob = document.querySelector(".blob");

    if (promptModeSwitch) {
      container.classList.add("mode-focus");
      container.classList.remove("mode-flow");
      blob.classList.add("mode-focus");
      blob.classList.remove("mode-flow");
    } else {
      container.classList.add("mode-flow");
      container.classList.remove("mode-focus");
      blob.classList.add("mode-flow");
      blob.classList.remove("mode-focus");
    }
  }, [promptModeSwitch]);

  useEffect(() => {
    if (!promptStream) return;

    // Whenever promptStream updates, we handle a new chunk
    setMessages(prevMessages => {
      // If there's no message yet OR the last message is the user's,
      // we create a NEW AI message with this chunk:
      if (prevMessages.length === 0 || prevMessages[prevMessages.length - 1].isUser) {
        return [...prevMessages, { content: promptStream, isUser: false }];
      } else {
        // Otherwise, the last message is already AI,
        // so we append the new chunk to it:
        const lastIdx = prevMessages.length - 1;
        const updatedLast = {
          ...prevMessages[lastIdx],
          content: promptStream,
        };
        return [...prevMessages.slice(0, -1), updatedLast];
      }
    });
  }, [promptStream]);

  return (
    // Create. Refine. Dominate. Tagline for the tool
    <>
      <div
        className={cn("blob", {
          blow_flow: promptModeSwitch === false,
        })}
      />

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
          {messages?.length === 0 && (
            <span className="greeting-span-container">
              {/* <div className="blob-greeting"></div> */}
              {selectedTab === 0 ? (
                <>
                  <div className="greeting-ptag">Hey!</div>

                  <div className="greeting-span">Let’s craft the perfect prompt!</div>
                  {promptModeSwitch ? <div className="greeting-span">Focus Mode: Iterate a Single Prompt</div> : <div className="greeting-span">Fast Mode: Quickly Enhance your Prompts.</div>}
                </>
              ) : (
                <></>
              )}
              {selectedTab === 1 ? (
                <>
                  <div className="greeting-ptag">Hey!</div>
                  <div className="greeting-span">What can I help you with today?</div>
                </>
              ) : (
                <></>
              )}
            </span>
          )}
        </div>

        <div
          className={cn("sp-message-container", {
            sp_container_margin: messages.length > 0,
          })}
        >
          <div className="chat-container">
            {messages.map((msg, index) => (
              <Message key={index} content={msg.content} isUser={msg.isUser} />
            ))}
            {/* {currentStream && <Message content={currentStream} isUser={false} />} */}
          </div>
        </div>

        <div className="chatbox-area">
          <Formik initialValues={{ prompt: "" }} onSubmit={() => handleEnhance()}>
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
                    <p>Some contents...</p>
                  </Modal>
                  // <Menu defaultSelectedKeys={["1"]} defaultOpenKeys={["sub1"]} mode="inline" theme="dark" inlineCollapsed={collapsed} items={items} />
                )}
                <div className="toolbar-container">
                  <div className="toolbar-left">
                    {selectedTab == 0 && (
                      <Switch
                        className={cn("prompt-mode-switch", {
                          switch_on: promptModeSwitch,
                          switch_off: !promptModeSwitch,
                        })}
                        checked={promptModeSwitch}
                        onChange={setPromptModeSwitch}
                        checkedChildren="Focus"
                        unCheckedChildren="Fast"
                      />
                    )}
                    {/* <Button
                  className="swap-chat-btn"
                  // className="advanced-options-btn"
                  type="filled"
                  onClick={showModal}
                  >
                  <SwapOutlined
                    className="swap-icon"
                    style={{
                    fontSize: "16px",
                    color: "#fff",
                    // color: "#08c"
                    }}
                  />
                  </Button> */}
                    {/* {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} */}
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
                    ></Popover>

                    {/* <Switch checkedChildren="Focus" unCheckedChildren="Flow" defaultChecked /> */}
                    {/* {selectedTab === 0 ? <Button className="new-prompt-btn">New Prompt +</Button> : <Button className="new-prompt-btn">New Chat +</Button>} */}

                    <Button className="new-prompt-btn" onClick={handleNewPrompt}>
                      {selectedTab === 0 ? "New Prompt +" : "New Chat +"}
                    </Button>
                  </div>

                  <div className="toolbar-right">
                    {/* <Button className="voice-btn" type="filled" onClick={showModal}></Button> */}
                    {/* <Button className="category-btn" type="filled" onClick={showModal}></Button> */}

                    {/* <Button className="more-btn" type="filled" onClick={showModal}></Button> */}
                  </div>
                </div>

                <BracketEditor selectedTab={selectedTab} prompt={prompt} setPrompt={setPrompt} />
                {/* <textarea
                  name="prompt"
                  placeholder={selectedTab === 0 ? "Type your Prompt" : "Ask Assistant"}
                  value={prompt}
                  onChange={e => {
                    console.log("this is the value:", e.target.value);
                    setPrompt(e.target.value);
                  }}
                  rows="5"
                  className="sidepanel-input"
                /> */}
                <button type="submit" disabled={loading} className="enhance-prompt-btn" />
              </form>
            )}
          </Formik>
        </div>
        {/* <BracketHighlighter /> */}
      </div>
      {/* </div> */}
    </>
  );
};

export default SidePanel;
