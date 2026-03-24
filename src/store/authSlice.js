import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      const userId = action.payload._id || action.payload.id;
      state.currentUser = {
        _id: userId,
        id: userId,
        name: action.payload.name,
        email: action.payload.email,
      };
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logout(state) {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setAuthenticated(state) {
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setCheckAuthComplete(state) {
      state.isLoading = false;
    },
    setCurrentUser(state, action) {
      const userId = action.payload._id || action.payload.id;
      state.currentUser = {
        _id: userId,
        id: userId,
        name: action.payload.name,
        email: action.payload.email,
      };
    },
  },
});

export const {
  login,
  logout,
  setAuthenticated,
  setCheckAuthComplete,
  setCurrentUser,
} = authSlice.actions;
export default authSlice.reducer;
