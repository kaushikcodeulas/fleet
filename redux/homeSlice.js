// homeSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const homeSlice = createSlice({
  name: 'home',
  initialState: {
    details: null,
  },
  reducers: {
    setDriverDetails: (state, action) => {
      state.value = action?.payload?.details;
    //   console.log(state)
    }
  },
});

export const { setDriverDetails } = homeSlice.actions;

export const homeValue = (state) => state.home.value;

export default homeSlice.reducer;