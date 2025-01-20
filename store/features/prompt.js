/**
 *
// Action Types
const GET_ENHANCED_PROMPT = "prompt/GET_ENHANCED_PROMPT";
const UPDATE_STREAMING_PROMPT = "prompt/UPDATE_STREAMING_PROMPT";
const COMPLETE_STREAMING = "prompt/COMPLETE_STREAMING";

//******ACTIONS******
export const getEnhancedPrompt = ({ enhancedPrompt, framework }) => ({
  type: GET_ENHANCED_PROMPT,
  enhancedPrompt,
  framework,
});


export const updateStreamingPrompt = chunk => ({
  type: UPDATE_STREAMING_PROMPT,
  chunk,
});

export const completeStreaming = () => ({
  type: COMPLETE_STREAMING,
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
            dispatch(completeStreaming());
          } else if (data.text) {
            accumulatedResponse += data.text;
            console.log("Accumulated response:", accumulatedResponse);
            dispatch(updateStreamingPrompt(data.text));
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
      // 1) Make POST request with large prompt
      const response = await fetch("http://localhost:5500/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, framework }),
      });

      if (!response.ok) {
        console.error("Bad response status:", response.status);
        // Optionally dispatch an error action
        return;
      }

      // 2) Prepare to read the body as a stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // We'll accumulate partial data in a buffer in case
      // we receive half a line, etc.
      let buffer = "";

      // 3) Continuously read chunks until done
      while (true) {
        const { value, done } = await reader.read();
        if (done) break; // no more data

        // decode chunk to text
        buffer += decoder.decode(value, { stream: true });

        // SSE lines are separated by "\n\n"
        const lines = buffer.split("\n\n");

        // The last element of `lines` might be an incomplete chunk,
        // so we hold it in `buffer` for the next iteration.
        buffer = lines.pop() || "";

        // 4) Process each complete line
        // for (const line of lines) {
        //   // Each line is supposed to look like: "data: { ...json... }"
        //   if (!line.startsWith("data: ")) {
        //     continue;
        //   }
        //   const jsonPart = line.slice(6); // remove "data: "
        //   try {
        //     const parsed = JSON.parse(jsonPart);
        //     // Check for "done" or "text"
        //     if (parsed.done) {
        //       // Final chunk
        //       dispatch(completeStreaming());
        //     } else if (parsed.text) {
        //       // Partial text chunk
        //       dispatch(updateStreamingPrompt(parsed.text));
        //     }
        //   } catch (err) {
        //     console.error("Error parsing SSE chunk:", err);
        //   }
        // }
        for (const line of lines) {
          // if the line looks like:
          // "message:\ndata:{\"event\":\"token\",\"data\":\"Freelancers...\"}"
          // we can split on "\n" first:
          const subParts = line.split("\n");
          // subParts might be ["message:", "data:{\"event\":\"token\",\"data\":\"Freelancers...\"}"]

          // find the one that starts with "data:"
          const dataPart = subParts.find(sp => sp.startsWith("data: "));
          if (!dataPart) continue;

          const jsonStr = dataPart.slice(6); // remove "data: "
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed?.text) {
              dispatch(updateStreamingPrompt(parsed.text));
            }
          } catch (err) {
            console.error("Error parsing JSON chunk", err, dataPart);
          }
        }
      }

      // 5) End of stream
      dispatch(completeStreaming());
    } catch (err) {
      console.error("Error in streamEnhancedPromptThunk:", err);
      // Optionally dispatch an error action
    }
  };

//******REDUCER******
const initialState = {
  prompt: "",
  framework: "",
  isStreaming: false,
  streamedContent: "",
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
        streamedContent: state.streamedContent + action.chunk,
      };

    case COMPLETE_STREAMING:
      return {
        ...state,
        isStreaming: false,
        prompt: state.streamedContent, // Update final prompt with accumulated content
        // streamedContent: "", // Reset streamed content
      };

    default:
      return state;
  }
};

export default promptReducer;
*/

// Action Types
const GET_ENHANCED_PROMPT = "prompt/GET_ENHANCED_PROMPT";
const UPDATE_STREAMING_PROMPT = "prompt/UPDATE_STREAMING_PROMPT";
const COMPLETE_STREAMING = "prompt/COMPLETE_STREAMING";

// 1) New action type for setting chatId:
const SET_CHAT_ID = "prompt/SET_CHAT_ID";

//******ACTIONS******//
export const getEnhancedPrompt = ({ enhancedPrompt, framework }) => ({
  type: GET_ENHANCED_PROMPT,
  enhancedPrompt,
  framework,
});

export const updateStreamingPrompt = chunk => ({
  type: UPDATE_STREAMING_PROMPT,
  chunk,
});

export const completeStreaming = () => ({
  type: COMPLETE_STREAMING,
});

// 2) New action to store the chatId
export const setChatId = chatId => ({
  type: SET_CHAT_ID,
  chatId,
});

//******THUNKS******//
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

          // If the server sends "done" on final chunk:
          if (data.done) {
            console.log("Stream completed");
            eventSource.close();
            dispatch(completeStreaming());
          }
          // If there's text to append:
          else if (data.text) {
            accumulatedResponse += data.text;
            console.log("Accumulated response:", accumulatedResponse);
            dispatch(updateStreamingPrompt(data.text));
          }

          // 3) If there's an SSE "metadata" event containing chatId:
          //    The server might send { event: "metadata", data: { chatId: "...", ... } }
          if (data.event === "metadata" && data.data?.chatId) {
            dispatch(setChatId(data.data.chatId));
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

            if (parsed.text) {
              dispatch(updateStreamingPrompt(parsed.text));
            } else if (parsed.done) {
              dispatch(completeStreaming());
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

//******REDUCER******//
const initialState = {
  prompt: "",
  framework: "",
  isStreaming: false,
  streamedContent: "",
  chatId: "",
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
        streamedContent: state.streamedContent + action.chunk,
      };

    case COMPLETE_STREAMING:
      return {
        ...state,
        isStreaming: false,
        prompt: state.streamedContent, // Update final prompt with accumulated content
        // streamedContent: "", // If you want to reset
      };

    // 7) Handle chatId
    case SET_CHAT_ID:
      return {
        ...state,
        chatId: action.chatId,
      };

    default:
      return state;
  }
};

export default promptReducer;
