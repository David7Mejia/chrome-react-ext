import React, { useEffect, useState } from "react";
import "../styles/SidePanel.css";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import { getEnhancedPromptThunk } from "../../store/features/prompt";

const SidePanel = () => {
  const dispatch = useDispatch();
  const enhancedResult = useSelector(state => state.prompt.enhancedPrompt);
  const loading = useSelector(state => state.prompt.loading);
  const state = useSelector(state => state);
  console.log("Redux State Test:", state);

  const [prompt, setPrompt] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");

  const frameworks = ["AIDA", "BAB", "PAS", "GRADE", "CREO", "FAB", "4C's", "PASTOR", "SCAMPER", "KISS", "Hero's Journey"];

  const handleEnhance = () => {
    if (!prompt || !selectedFramework) {
      alert("Please enter a prompt and select a framework.");
      return;
    }

    // Dispatching the thunk with the current prompt and selected framework
    dispatch(getEnhancedPromptThunk({ prompt: prompt, framework: selectedFramework }));
  };
  useEffect(() => {
    console.log("this is the prompt", prompt);
  }, []);
  return (
    <div className="sidepanel-container">
      <div className="sidepanel-top">
        {/* <p className="greeting-ptag">OCULUS</p> */}
        <span className="greeting-span">How can I assist you today?</span>
      </div>

      <div className="chatbox-area">
        <Formik initialValues={{ prompt: "" }} onSubmit={() => handleEnhance()}>
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="sidepanel-form">
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
              <textarea name="prompt" placeholder="Enter your prompt here..." value={prompt} onChange={e => setPrompt(e.target.value)} rows="5" className="sidepanel-input" />

              <button type="submit" disabled={loading} className="enhance-prompt-btn">
                {loading ? "Enhancing..." : "Enhance Prompt"}
              </button>
            </form>
          )}
        </Formik>

        {enhancedResult && (
          <div className="enhanced-result">
            <h4>Enhanced Prompt:</h4>
            <p>{enhancedResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidePanel;
