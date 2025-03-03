// import { configureStore } from "@reduxjs/toolkit";
// import promptReducer from "./features/prompt";

// // Logging Middleware
// const loggerMiddleware = store => next => action => {
//   console.group(action.type);
//   console.log("%c Previous State:", "color: gray", store.getState());
//   console.log("%c Action:", "color: blue", action);
//   const result = next(action);
//   console.log("%c Next State:", "color: green", store.getState());
//   console.groupEnd();
//   return result;
// };

// const store = configureStore({
//   reducer: {
//     prompt: promptReducer,
//   },
//   middleware: getDefaultMiddleware => getDefaultMiddleware().concat(loggerMiddleware),
//   devTools: process.env.NODE_ENV !== "production", // Ensure devTools flag is set
// });

// export default store;
// import { configureStore } from "@reduxjs/toolkit";
// import { devToolsEnhancer } from "@redux-devtools/extension";
// import promptReducer from "./features/prompt";

// const store = configureStore({
//   reducer: {
//     prompt: promptReducer,
//   },
//   enhancers: [devToolsEnhancer()],
// });

// export default store;

// import { configureStore } from "@reduxjs/toolkit";
// import { devToolsEnhancer } from "@redux-devtools/extension";
// import promptReducer from "./features/prompt";

// const store = configureStore({
//   reducer: {
//     prompt: promptReducer,
//   },
//   enhancers: [devToolsEnhancer()],
// });

// console.log("Redux Store Created:", store);
// export default store;
