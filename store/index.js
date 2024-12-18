import { configureStore } from "@reduxjs/toolkit";
import promptReducer from './features/prompt';
// import endpointsReducer from './features/endpoints';

const store = configureStore({
  reducer: {
    prompt: promptReducer,
    // endpoints: endpointsReducer,
  },
});

export default store;
