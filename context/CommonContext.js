import React, { useContext, useState, useRef, useEffect } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CommonContext = React.createContext();

export const CommonContextProvider = ({ children }) => {
  // Navigation & PiP State
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const [navParams, setNavParams] = useState(null);

  const activeNavController = useRef(null);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    isNavigatingRef.current = isNavigating;
  }, [isNavigating]);

  // Auto-enable PiP mode when application goes to background or is minimized while turn-by-turn navigation is active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (isNavigatingRef.current) {
          setIsPipMode(true);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  function dateFormat(inputDate) {
    if (!inputDate) return 'N/A';
    const dateObj = new Date(inputDate.replace(" ", "T"));

    const day = dateObj.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const hour = dateObj.getHours() % 12 || 12;
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = dateObj.getHours() >= 12 ? 'PM' : 'AM';

    return `${day} ${month}, ${year} ${hour}:${minutes} ${ampm}`;
  }

  async function getItem(key) {
    try {
      const response = await AsyncStorage.getItem(key);
      return JSON.parse(response);
    } catch (error) {
      return undefined;
    }
  }

  const startNavigationGlobal = (controller, params) => {
    activeNavController.current = controller;
    setNavParams(params);
    isNavigatingRef.current = true;
    setIsNavigating(true);
  };

  const stopNavigationGlobal = async () => {
    try {
      if (activeNavController.current) {
        await activeNavController.current.stopGuidance();
      }
    } catch (e) {
      console.log("Error stopping guidance globally:", e);
    }
    activeNavController.current = null;
    isNavigatingRef.current = false;
    setIsNavigating(false);
    setIsPipMode(false);
    setNavParams(null);
  };

  const enterPipMode = () => {
    setIsPipMode(true);
  };

  const exitPipMode = () => {
    setIsPipMode(false);
  };

  return (
    <CommonContext.Provider
      value={{
        dateFormat,
        getItem,
        isNavigating,
        isPipMode,
        navParams,
        activeNavController,
        startNavigationGlobal,
        stopNavigationGlobal,
        enterPipMode,
        exitPipMode,
        setIsNavigating,
        setIsPipMode,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};

export const useCommonContext = () => {
  const value = useContext(CommonContext);
  if (!value) {
    throw new Error("useCommonContext must be wrapped inside a CommonContextProvider");
  }
  return value;
};
