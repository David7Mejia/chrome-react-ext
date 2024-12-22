const GET_ENHANCED_PROMPT = "prompt/GET_ENHANCED_PROMPT";

//******ACTIONS******//
export const getEnhancedPrompt = ({ prompt, framework }) => ({
  type: GET_ENHANCED_PROMPT,
  prompt,
  framework,
});

//******THUNKS******//
export const getEnhancedPromptThunk =
  ({ prompt, framework }) =>
  async dispatch => {
    try {
      const res = await fetch("http://localhost:5500/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, framework }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("This is the prompt:", prompt);
        console.log("This is the framework:", framework);
        console.log("Inside the thunk response data:", data);

        dispatch(getEnhancedPrompt({ prompt: data.prompt, framework: data.framework }));
      } else {
        console.error("Failed to fetch enhanced prompt");
      }
    } catch (error) {
      console.error("Thunk API Error:", error);
    }
  };

//******REDUCER******//

const initialState = {
  prompt: "",
  framework: "",
};

const promptReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ENHANCED_PROMPT:
      console.log("Reducer Action:", action);
      return {
        ...state,
        prompt: action.prompt,
        framework: action.framework,
      };
    default:
      return state;
  }
};

export default promptReducer;
