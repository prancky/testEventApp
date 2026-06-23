import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type GlobalData = Record<string, unknown>;

// Define the GlobalContextValue type
type GlobalContextValue = {
  setGlobalData: (data: GlobalData) => void;
  clearGlobalData: () => void;
  removeGlobalDataByKey: (key: string) => void;
  globalData: GlobalData;
};

// Initialize the GlobalContext with undefined
const GlobalContext = createContext<GlobalContextValue | undefined>(undefined);

// No default global data available
const defaultGlobalData = {};

// GlobalContextProvider component to wrap children
export const GlobalContextProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [globalDataState, setGlobalDataState] =
    useState<GlobalData>(defaultGlobalData);

  // Function to set global data
  const setGlobalData = useCallback((obj: GlobalData) => {
    setGlobalDataState((prev: GlobalData) => {
      return { ...prev, ...obj };
    });
  }, []);

  // Function to clear all global data
  const clearGlobalData = useCallback(() => {
    setGlobalDataState({});
  }, []);

  // Function to remove a specific key from the global data
  const removeGlobalDataByKey = useCallback((key: string) => {
    setGlobalDataState((prev: GlobalData) => {
      const { [key]: _, ...remainingData } = prev;
      return remainingData;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      setGlobalData,
      clearGlobalData,
      removeGlobalDataByKey,
      globalData: globalDataState,
    }),
    [setGlobalData, clearGlobalData, removeGlobalDataByKey, globalDataState],
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to access the GlobalContext
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error(
      'useGlobalContext must be used within a GlobalContextProvider',
    );
  }
  return context;
};
