import React, { useEffect } from 'react';
import AppNavigator from '@/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '@/navigation/NavigationService';
import SplashScreen from 'react-native-splash-screen';

import { AppProviders } from '@/providers/AppProviders';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs(); // Ignore all log notifications
if (!__DEV__) {
  ['log', 'warn', 'error', 'info', 'debug'].forEach((method) => {
    (console as Record<string, unknown>)[method] = () => {};
  });
}

const App = () => {
  useEffect(() => {
    const timer = setTimeout(() => SplashScreen?.hide(), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProviders>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AppProviders>
  );
};

export default App;
