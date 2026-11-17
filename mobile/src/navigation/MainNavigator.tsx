import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Screens
import HomeScreen from '../screens/dashboard/HomeScreen';
import MyDocumentsScreen from '../screens/documents/MyDocumentsScreen';
import DocumentCategoriesScreen from '../screens/documents/DocumentCategoriesScreen';
import UploadDocumentScreen from '../screens/documents/UploadDocumentScreen';
import AIAnalysisScreen from '../screens/documents/AIAnalysisScreen';
import DocumentDetailsScreen from '../screens/documents/DocumentDetailsScreen';
import DocumentPreviewScreen from '../screens/documents/DocumentPreviewScreen';
import AISummaryScreen from '../screens/documents/AISummaryScreen';
import SearchScreen from '../screens/documents/SearchScreen';
import ExpiryTrackerScreen from '../screens/expiry/ExpiryTrackerScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import { MainTabParamList, DocumentStackParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const DocStack = createNativeStackNavigator<DocumentStackParamList>();

const DocumentsStack: React.FC = () => (
  <DocStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.white },
      headerTintColor: colors.textPrimary,
      headerShadowVisible: false,
    }}
  >
    <DocStack.Screen name="MyDocuments" component={MyDocumentsScreen} options={{ title: 'My Documents' }} />
    <DocStack.Screen name="DocumentCategories" component={DocumentCategoriesScreen} options={{ title: 'Categories' }} />
    <DocStack.Screen name="DocumentDetails" component={DocumentDetailsScreen} options={{ title: 'Document Details' }} />
    <DocStack.Screen name="DocumentPreview" component={DocumentPreviewScreen} options={{ title: 'Preview' }} />
    <DocStack.Screen name="AIAnalysis" component={AIAnalysisScreen} options={{ title: 'AI Analysis' }} />
    <DocStack.Screen name="AISummary" component={AISummaryScreen} options={{ title: 'AI Summary' }} />
    <DocStack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
    <DocStack.Screen name="UploadDocument" component={UploadDocumentScreen} options={{ title: 'Upload Document' }} />
  </DocStack.Navigator>
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: 'view-dashboard',
            Documents: 'file-multiple',
            Upload: 'cloud-upload',
            Expiry: 'calendar-clock',
            Profile: 'account-circle',
          };
          return (
            <MaterialCommunityIcons name={icons[route.name] as any} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.borderLight,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Documents" component={DocumentsStack} options={{ title: 'Documents' }} />
      <Tab.Screen name="Upload" component={UploadDocumentScreen} options={{ title: 'Upload' }} />
      <Tab.Screen name="Expiry" component={ExpiryTrackerScreen} options={{ title: 'Expiry' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
