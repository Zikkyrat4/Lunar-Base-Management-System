// src/store/resourcesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/resources`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: {
    energy: { current_level: 0, capacity: 100, unit: 'kWh' },
    water: { current_level: 0, capacity: 100, unit: 'liters' },
    oxygen: { current_level: 0, capacity: 100, unit: 'm³' },
    food: { current_level: 0, capacity: 100, unit: 'days' }
  },
  status: 'idle',
  error: null
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    updateResource(state, action) {
      const { resource, value } = action.payload;
      state[resource].current = value;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Обновляем состояние на основе полученных данных
        Object.assign(state, action.payload);
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { updateResource } = resourcesSlice.actions;
export default resourcesSlice.reducer;

// Селекторы
export const selectAllResources = (state) => state.resources;
export const selectResource = (resource) => (state) => state.resources[resource];
export const selectResourcesStatus = (state) => state.resources.status;