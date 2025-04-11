import { createSlice } from '@reduxjs/toolkit';

export interface AuthState {
  isLoggedIn: boolean;
  currentUser: any;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  currentUser: null,
  loading: false,
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.isLoggedIn = true;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
    }
  }
});

export const { setCurrentUser, clearCurrentUser } = authSlice.actions;

export default authSlice.reducer;
