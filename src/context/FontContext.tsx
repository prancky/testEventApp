import React, { createContext, useContext, useMemo } from 'react';

// Define the FontContextValue type
type FontContextValue = {};
// Initialize the FontContext with undefined
const FontContext = createContext<FontContextValue | undefined>(undefined);

// FontContextProvider component to wrap children
export const FontContextProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const fontContextValue = useMemo(() => ({}), []);

  return (
    <FontContext.Provider value={fontContextValue}>
      {children}
    </FontContext.Provider>
  );
};
// Custom hook to access the FontContext
export const useFontContext = () => {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFontContext must be used within a FontContextProvider');
  }
  return context;
};
