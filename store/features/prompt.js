// Action Types
const GET_ENHANCED_PROMPT = "prompt/GET_ENHANCED_PROMPT";
const UPDATE_STREAMING_PROMPT = "prompt/UPDATE_STREAMING_PROMPT";
const COMPLETE_STREAMING = "prompt/COMPLETE_STREAMING";
const UPDATE_METADATA = "prompt/UPDATE_METADATA";
const CLEAR_STREAMING = "prompt/CLEAR_STREAMING";

//******ACTIONS******
export const getEnhancedPrompt = ({ enhancedPrompt, framework }) => ({
  type: GET_ENHANCED_PROMPT,
  enhancedPrompt,
  framework,
});

export const updateStreamingPrompt = text => ({
  type: UPDATE_STREAMING_PROMPT,
  text,
});

export const completeStreaming = metadata => ({
  type: COMPLETE_STREAMING,
  metadata,
});

export const updateMetadata = metadata => ({
  type: UPDATE_METADATA,
  metadata,
});

export const clearStreaming = () => ({
  type: CLEAR_STREAMING,
});

//******THUNKS******
export const getEnhancedPromptThunk =
  ({ prompt, framework }) =>
  async dispatch => {
    try {
      console.log("Starting SSE connection");
      console.log("Initial prompt:", prompt);
      console.log("Framework:", framework);

      // Initialize EventSource for streaming
      const eventSource = new EventSource(`http://localhost:3000/enhance`);

      let accumulatedResponse = "";

      eventSource.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received SSE data:", data);

          if (data.done) {
            console.log("Stream completed");
            eventSource.close();
            dispatch(completeStreaming(data.metadata));
          } else if (data.text) {
            accumulatedResponse += data.text;
            console.log("Accumulated response:", accumulatedResponse);
            dispatch(updateStreamingPrompt(data.text));
          }

          if (data.event === "metadata" && data.data?.chatId) {
            dispatch(updateMetadata(data.data));
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = error => {
        console.error("EventSource error:", error);
        eventSource.close();
      };
    } catch (error) {
      console.error("Thunk API Error:", error);
    }
  };

export const streamEnhancedPromptThunk =
  ({ prompt, framework }) =>
  async dispatch => {
    try {
      dispatch(clearStreaming());

      const response = await fetch("http://localhost:5500/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, framework }),
      });

      if (!response.ok) {
        console.error("Bad response status:", response.status);
        return;
      }

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
            const jsonStr = line.slice(6); // remove "data: "
            const parsed = JSON.parse(jsonStr);

            switch (parsed.type) {
              case "metadata":
                dispatch(updateMetadata(parsed.metadata));
                break;
              case "content":
                dispatch(updateStreamingPrompt(parsed.text));
                break;
              case "end":
                dispatch(completeStreaming(parsed.metadata));
                break;
            }
          } catch (err) {
            console.error("Error parsing JSON chunk", err, line);
          }
        }
      }

      dispatch(completeStreaming());
    } catch (err) {
      console.error("Error in streamEnhancedPromptThunk:", err);
    }
  };

//******REDUCER******
const initialState = {
  prompt: "",
  framework: "",
  isStreaming: false,
  streamedContent: "",
  metadata: {
    chatId: null,
    sessionId: null,
    threadId: null,
    messageId: null,
    conversationId: null,
  },
};

const promptReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ENHANCED_PROMPT:
      return {
        ...state,
        prompt: action.enhancedPrompt,
        framework: action.framework,
      };

    case UPDATE_STREAMING_PROMPT:
      return {
        ...state,
        isStreaming: true,
        streamedContent: state.streamedContent + action.text,
      };

    case COMPLETE_STREAMING:
      return {
        ...state,
        isStreaming: false,
        prompt: state.streamedContent, // Update final prompt with accumulated content
        metadata: {
          ...state.metadata,
          ...action.metadata,
        },
      };

    case UPDATE_METADATA:
      return {
        ...state,
        metadata: {
          ...state.metadata,
          ...action.metadata,
        },
      };
    case CLEAR_STREAMING:
      return {
        ...state,
        streamedContent: "",
        isStreaming: false,
      };
    default:
      return state;
  }
};

export default promptReducer;
