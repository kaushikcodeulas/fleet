// homeSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { getAllTrips, getFleetDetails, getTripDetails } from './homeThunks';

export const homeSlice = createSlice({
  name: 'home',
  initialState: {
    userData: null,
    details: null,
    fleetDetails: {
      loading: true,
      status: 'loading',
      data: null,
      error: null
    },
    tripDetails: {
      loading: true,
      status: 'loading',
      data: null,
      error: null
    },
    allTrips: {
      loading: true,
      data: [],
      error: null
    }
  },
  reducers: {
    setDriverDetails: (state, action) => {
      state.details = action?.payload?.details;
    //   console.log(state)
    },
    setUserData: (state, action) => {
      state.userData = action?.payload?.details;
    //   console.log(state)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFleetDetails.pending, (state) => {
        state.fleetDetails.status = "loading";
        state.fleetDetails.loading = true;
      })
      .addCase(getFleetDetails.fulfilled, (state, action) => {
        state.fleetDetails.status = "succeeded";
        state.fleetDetails.data = action.payload?.details;
        state.fleetDetails.loading = false;
      })
      .addCase(getFleetDetails.rejected, (state, action) => {
        state.fleetDetails.status = "failed";
        state.fleetDetails.error = action.error.message;
        state.fleetDetails.loading = false;
      })

      // Current Trip
      .addCase(getTripDetails.pending, (state) => {
        state.tripDetails.status = "loading";
        state.tripDetails.loading = true;
      })
      .addCase(getTripDetails.fulfilled, (state, action) => {
        state.tripDetails.status = "succeeded";
        state.tripDetails.data = action.payload?.details;
        state.tripDetails.loading = false;
      })
      .addCase(getTripDetails.rejected, (state, action) => {
        state.tripDetails.status = "failed";
        state.tripDetails.error = action.error.message;
        state.tripDetails.loading = false;
      })

      // All Trip
      .addCase(getAllTrips.pending, (state) => {
        state.allTrips.loading = true;
      })
      .addCase(getAllTrips.fulfilled, (state, action) => {
        // console.log(action.payload)
        state.allTrips.data = action.payload?.trips;
        state.allTrips.loading = false;
      })
      .addCase(getAllTrips.rejected, (state, action) => {
        state.allTrips.error = action.error.message;
        state.allTrips.loading = false;
      });
  },

});

export const { setDriverDetails, setUserData } = homeSlice.actions;

export const homeValue = (state) => state.home;

export default homeSlice.reducer;