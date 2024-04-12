import { createSlice } from "@reduxjs/toolkit";
const themeLocal = localStorage.getItem("isTheme");

export const themeSlice = createSlice({
  name: "Theme",
  initialState: {
    theme: themeLocal === "true" ? true : false,
  },
  reducers: {
    isTheme: (state, action) => {
      state.theme = action.payload.flag;
    },
  },
});

export const { isTheme } = themeSlice.actions;
export default themeSlice.reducer;
