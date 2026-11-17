import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DocumentProvider } from './src/context/DocumentContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { notificationService } from './src/services/notificationService';

/**
 * Inner component that runs after auth context is available.
 * Registers for push notifications once the user is authenticated.
 */
const AppInner: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Register for push notifications (non-blocking, only on physical device)
      notificationService.registerForPushNotifications().catch(() => {
        // Silently ignore — user may not have granted permission or running in emulator
      });
    }
  }, [isAuthenticated, isLoading]);

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <DocumentProvider>
            <AppInner />
          </DocumentProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
