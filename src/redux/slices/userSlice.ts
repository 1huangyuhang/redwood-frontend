import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  userInfo: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
  token: string | null;
}

function readStoredUserInfo(): UserState['userInfo'] {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return null;
    return JSON.parse(raw) as UserState['userInfo'];
  } catch {
    return null;
  }
}

const initialState: UserState = {
  userInfo: readStoredUserInfo(),
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token'),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        userInfo: UserState['userInfo'];
        token: string;
      }>
    ) => {
      state.userInfo = action.payload.userInfo;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      if (action.payload.userInfo) {
        localStorage.setItem(
          'userInfo',
          JSON.stringify(action.payload.userInfo)
        );
      }
    },
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
    updateUserInfo: (state, action: PayloadAction<UserState['userInfo']>) => {
      state.userInfo = action.payload;
      if (action.payload) {
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('userInfo');
      }
    },
  },
});

export const { loginSuccess, logout, updateUserInfo } = userSlice.actions;

export default userSlice.reducer;
