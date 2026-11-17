import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import DocumentDetailsScreen from '../screens/documents/DocumentDetailsScreen';
import DocumentPreviewScreen from '../screens/documents/DocumentPreviewScreen';
import AIAnalysisScreen from '../screens/documents/AIAnalysisScreen';
import AISummaryScreen from '../screens/documents/AISummaryScreen';
import SearchScreen from '../screens/documents/SearchScreen';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading DocuWise..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainNavigator} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: true,
                title: 'Notifications',
                headerStyle: { backgroundColor: colors.white },
                headerTintColor: colors.textPrimary,
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: 'Settings',
                headerStyle: { backgroundColor: colors.white },
                headerTintColor: colors.textPrimary,
              }}
            />
            <Stack.Screen
              name="DocumentDetails"
              component={DocumentDetailsScreen}
              options={{
                headerShown: true,
                title: 'Document Details',
                headerStyle: { backgroundColor: colors.white },
                headerTintColor: colors.textPrimary,
              }}
            />
            <Stack.Screen
              name="DocumentPreview"
              component={DocumentPreviewScreen}
              options={{
                headerShown: true,
                title: 'Preview',
                headerStyle: { backgroundColor: colors.white },
                headerTintColor: colors.textPrimary,
              }}
            />
            <Stack.Screen
              name="AIAnalysis"
              component={AIAnalysisScreen}
              options={{
                headerShown: true,
                title: 'AI Analysis',
                headerStyle: { backgroundColor: colors.white },
                headerTintColor: colors.textPrimary,
              }}
            />
            <Stack.Screen
              name="AISummary"
              component={AISummaryScreen}
              options={{
                headerShown: true,
                title: 'AI Summary',
                headerStyle: { backgroundColor: colors.white },
                headerTintColor: colors.textPrimary,
              }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{
                headerShown: true,
                title: 'Search Documents',
                headerStyle: { backgroundColor: colors.white },
                headerTintColor: colors.textPrimary,
              }}
            />
          </>
        ) : (
          <Stack.Screen name="AuthStack" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
