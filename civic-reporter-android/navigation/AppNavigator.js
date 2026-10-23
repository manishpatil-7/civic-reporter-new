import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import DetailsScreen from '../screens/DetailsScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import AuthorityLoginScreen from '../screens/authority/AuthorityLoginScreen';
import AuthorityDashboardScreen from '../screens/authority/AuthorityDashboardScreen';
import AuthorityComplaintDetailScreen from '../screens/authority/AuthorityComplaintDetailScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import SubmitScreen from '../screens/SubmitScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MyComplaintsScreen from '../screens/MyComplaintsScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Tabbed Shell */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* Screen Aliases for direct navigation */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Submit" component={SubmitScreen} />
      <Stack.Screen name="MyComplaints" component={MyComplaintsScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />

      {/* Complaint Detail */}
      <Stack.Screen name="Details" component={DetailsScreen} />

      {/* Auth Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

      {/* Authority Portal Screens */}
      <Stack.Screen name="AuthorityLogin" component={AuthorityLoginScreen} />
      <Stack.Screen name="AuthorityDashboard" component={AuthorityDashboardScreen} />
      <Stack.Screen name="AuthorityComplaintDetail" component={AuthorityComplaintDetailScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
