// NavigationContext.js
import React, { createContext, useState, useContext } from 'react';

const NavContext = createContext();

export const NavProvider = ({ children }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isNavActive, setIsNavActive] = useState(false); // Only show map when navigating

  return (
    <NavContext.Provider value={{ isMinimized, setIsMinimized, isNavActive, setIsNavActive }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNavOverlay = () => useContext(NavContext);
