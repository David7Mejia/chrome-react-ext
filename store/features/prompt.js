const GET_ENHANCED_PROMPT = "promtp/GET_ENAHNCED_PROMPT";

//******ACTIONS******//
export const getEnhancedPrompt = prompt => ({
  type: GET_ENHANCED_PROMPT,
  prompt,
});

//******THUNKS******//

// curl http://localhost:3000/api/v1/prediction/196a5a49-bd9a-4741-8008-a403960db7ad \
//  -d '{"question": "Hey, how are you?"}' \
export const getEnhancedPromptThunk =
  ({ message }) =>
  async dispatch => {
    // const res = await fetch("http://localhost:3000/api/v1/prediction/196a5a49-bd9a-4741-8008-a403960db7ad ", {
    const res = await fetch("http://localhost:5500/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      data: `{"question": "${message}"}`,
    });

    if (res.ok) {
      const prompt = await res.json();
      console.log("inside the thunk prompt", prompt);
      dispatch(getEnhancedPrompt(prompt));
    }
  };

//******REDUCER******//

const initialState = {};

const promptReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case GET_ENHANCED_PROMPT:
      console.log("this is the state ", state, action);
      newState = Object.assign({}, state);
      newState.prompt = action.prompt;
      return newState;
    default:
      return state;
  }
};

export default promptReducer;
