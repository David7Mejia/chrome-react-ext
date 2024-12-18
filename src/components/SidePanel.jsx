import React from "react";
import "../styles/SidePanel.css";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { getEnhancedPromptThunk } from "../../store/features/prompt";

const SidePanel = () => {
  const dispatch = useDispatch();
  const prompt = useSelector(state => state.prompt);
  const [message, setMessage] = useState("");

  const enhancePrompt = values => {
    console.log("Enhance Prompt button clicked", values.message);
    console.log("Prompt from state", prompt);
  };

  return (
    <div className="sidepanel-container">
      <div className="sidepanel-top">
        <p className="greeting-ptag">PromptKing</p>
        <span className="greeting-span">How can I assist you today</span>
      </div>

      <div className="chatbox-area">
        <Formik
          initialValues={{ message: "" }}
          onSubmit={values => {
            dispatch(getEnhancedPromptThunk(values));
          }}
        >
          {({ values, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <input
                name="message"
                type="text"
                placeholder="Type your message here"
                value={values.message}
                onChange={e => {
                  handleChange(e);
                  console.log("Formik input value:", e.target.value);
                }}
              />
              <button type="submit">Send</button>
              <button type="submit" className="enhance-prompt-btn" onClick={values => enhancePrompt(values)}>
                Enhance Prompt
              </button>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SidePanel;
