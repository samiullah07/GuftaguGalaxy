import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "User",
  initialState: {
    user: {},
  },
  reducers: {
    addUser: (state, action) => {
      state.user = {
        name: action.payload.name,
        email: action.payload.email,
        photoURL: action.payload.photoURL,
        uid: action.payload.uid,
        authenticat: action.payload.authenticat,
      };
    },
    updateUser: (state, action) => {
      state.user = {
        name: action.payload.name,
        email: action.payload.email,
        photoURL: action.payload.photoURL,
        uid: action.payload.uid,
        authenticat: action.payload.authenticat,
      };
    },
    removeUser: (state, action) => {
      state.user = {};
    },
  },
});

export const { addUser, updateUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
