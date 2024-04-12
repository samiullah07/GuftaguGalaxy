import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./Reducers/UserSlice";
import themeReducer from "./Reducers/ThemeSlice";
export const store = configureStore({
  reducer: {
    userReducer,
    themeReducer,
  },
});
