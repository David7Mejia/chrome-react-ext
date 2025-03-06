// Action Types
const ENHANCE_CONTENT_REQUEST = "enhanceBtn/ENHANCE_CONTENT_REQUEST";
const ENHANCE_CONTENT_SUCCESS = "enhanceBtn/ENHANCE_CONTENT_SUCCESS";
const ENHANCE_CONTENT_FAILURE = "enhanceBtn/ENHANCE_CONTENT_FAILURE";
const UPDATE_CONTENT = "enhanceBtn/UPDATE_CONTENT";
const START_STREAMING = "enhanceBtn/START_STREAMING";
const UPDATE_STREAMING = "enhanceBtn/UPDATE_STREAMING";
const COMPLETE_STREAMING = "enhanceBtn/COMPLETE_STREAMING";

// Action Creators
export const enhanceContentRequest = () => ({
  type: ENHANCE_CONTENT_REQUEST,
});

export const enhanceContentSuccess = enhancedContent => ({
  type: ENHANCE_CONTENT_SUCCESS,
  payload: enhancedContent,
});

export const enhanceContentFailure = error => ({
  type: ENHANCE_CONTENT_FAILURE,
  error,
});

export const updateContent = content => ({
  type: UPDATE_CONTENT,
  payload: content,
});

// Thunk Action Creator
export const enhanceContentThunk =
  ({ content, textArea }) =>
  async dispatch => {
    dispatch(enhanceContentRequest());

    try {
      const response = await fetch("http://localhost:5500/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: content,
          framework: "",
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const jsonStr = line.slice(6);
            const parsed = JSON.parse(jsonStr);

            if (parsed.type === "content" && parsed.text) {
              dispatch({
                type: UPDATE_STREAMING,
                payload: parsed.text,
              });
            }
          } catch (err) {
            console.error("Error parsing chunk:", err);
          }
        }
      }

      dispatch({ type: COMPLETE_STREAMING });
    } catch (error) {
      console.error("Enhancement failed:", error);
      dispatch(enhanceContentFailure(error.toString()));
    }
  };

// Initial State
const initialState = {
  currentContent: "",
  enhancedContent: "",
  isLoading: false,
  error: null,
  isStreaming: false,
  streamedContent: "",
};

// Reducer
const enhanceBtnReducer = (state = initialState, action) => {
  switch (action.type) {
    case ENHANCE_CONTENT_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case ENHANCE_CONTENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        enhancedContent: action.payload,
      };

    case ENHANCE_CONTENT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };

    case UPDATE_CONTENT:
      return {
        ...state,
        currentContent: action.payload,
      };

    case START_STREAMING:
      return {
        ...state,
        isStreaming: true,
        streamedContent: "",
      };

    case UPDATE_STREAMING:
      return {
        ...state,
        streamedContent: state.streamedContent + action.payload,
      };

    case COMPLETE_STREAMING:
      return {
        ...state,
        isStreaming: false,
        enhancedContent: state.streamedContent,
      };

    default:
      return state;
  }
};

export default enhanceBtnReducer;
