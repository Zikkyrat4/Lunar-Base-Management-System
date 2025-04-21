import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: !!localStorage.getItem('token'),
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  },
  reducers: {
    loginRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      localStorage.removeItem('token');
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    loadUser(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
    }
  }
});

export const { 
  loginRequest, 
  loginSuccess, 
  loginFailure, 
  logout, 
  loadUser 
} = authSlice.actions;

export const login = (username, password) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/login`,
      new URLSearchParams({
        username,
        password
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    dispatch(loginSuccess({
      user: { username },
      token: response.data.access_token
    }));
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.detail || 'Login failed'));
  }
};

export const checkAuth = () => async (dispatch, getState) => {
  const { token } = getState().auth;
  if (token) {
    try {
      // Здесь можно добавить запрос для проверки токена
      // или получения данных пользователя
      dispatch(loadUser({ username: 'user' })); // Замените на реальные данные
    } catch (error) {
      dispatch(logout());
    }
  }
};

export default authSlice.reducer;