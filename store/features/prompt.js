const GET_ENHANCED_PROMPT = "prompt/GET_ENHANCED_PROMPT";

//******ACTIONS******//
export const getEnhancedPrompt = ({ enhancedPrompt, framework }) => (
  console.log("this is inside of the ACTION", enhancedPrompt),
  {
    type: GET_ENHANCED_PROMPT,
    enhancedPrompt,
    framework,
  }
);

//******THUNKS******//
export const getEnhancedPromptThunk =
  ({ prompt, framework }) =>
  async dispatch => {
    // try {
    //   const res = await fetch("http://localhost:5500/enhance", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ prompt, framework }),
    //   });

    //   if (res.ok) {
    //     const data = await res.json();
    //     const enhancedPrompt = JSON.parse(data?.enhancedPrompt?.text);
    //     console.log("This is the prompt:", prompt);
    //     console.log("This is the framework:", framework);
    //     console.log("Inside the thunk response data:", data);

    //     dispatch(getEnhancedPrompt({ enhancedPrompt, framework }));
    //   } else {
    //     console.error("Failed to fetch enhanced prompt");
    //   }
    // } catch (error) {
    //   console.error("Thunk API Error:", error);
    // }
    dispatch(getEnhancedPrompt({ enhancedPrompt: prompt, framework }));
    console.log(`PROMPT: ${prompt} FRAMEWORK: ${framework}`);
  };

//******REDUCER******//

const initialState = {
  prompt: "",
  framework: "",
};

const promptReducer = (state = initialState, action) => {
  let newState = {};
  switch (action.type) {
    case GET_ENHANCED_PROMPT:
      console.log("Reducer Action:", action);
      (newState["prompt"] = action.enhancedPrompt), (newState["framework"] = action.framework);
      return {
        ...newState,
      };
    default:
      return state;
  }
};

export default promptReducer;
