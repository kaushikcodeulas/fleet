import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getDashboardSummary = createAsyncThunk(
  'dashboard/fetch',
  async (userToken) => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/dashboard/details`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      return response.data;
    } catch (error) {
      return error;
    }
  }
);

export const getFleetDetails = createAsyncThunk(
  'fleet_details/fetch',
  async (userToken) => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/fleet_details/details`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      return response.data;
    } catch (error) {
      return error;
    }
  }
);

export const getTripDetails = createAsyncThunk(
  'trip/fetch',
  async (userToken) => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/trip/details`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      return response.data;
    } catch (error) {
      return error;
    }
  }
);

export const getAllTrips = createAsyncThunk(
  'alltrip/fetch',
  async (userToken) => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/trip/allTrips`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      return response.data;
    } catch (error) {
      return error;
    }
  }
);

export const getBookedTrips = createAsyncThunk(
  'bookedTrips/fetch',
  async (userToken) => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/trip/bookedTrips`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      return response.data;
    } catch (error) {
      return error;
    }
  }
);

export const updateTripStatus = createAsyncThunk(
  'trip/updateStatus',
  async ({ userToken, trip_id, status, driver_lat, driver_lng }) => {
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/trip/changeTripStatus`, 
        { trip_id, status, driver_lat, driver_lng },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return error;
    }
  }
);
