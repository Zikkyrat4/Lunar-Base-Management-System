import { configureStore } from '@reduxjs/toolkit';
import resourcesReducer from './resourcesSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    resources: resourcesReducer,
    auth: authReducer
  }
});

export { store };
