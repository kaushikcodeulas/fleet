import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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
      // console.log(response.data)
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
