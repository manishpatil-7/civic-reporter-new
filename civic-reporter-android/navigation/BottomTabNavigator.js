import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Map, Camera, FileText, Shield, User } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SubmitScreen from '../screens/SubmitScreen';
import MyComplaintsScreen from '../screens/MyComplaintsScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { user, isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F1F5F9',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />

      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Map size={size || 22} color={color} />,
        }}
      />

      {/* Elevated Report Center Button */}
      <Tab.Screen
        name="SubmitTab"
        component={SubmitScreen}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#059669',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Platform.OS === 'ios' ? 20 : 16,
                shadowColor: '#059669',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 6,
                elevation: 6,
                borderWidth: 3,
                borderColor: '#FFFFFF',
              }}
            >
              <Camera size={24} color="#FFFFFF" />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: 4,
          },
        }}
      />

      <Tab.Screen
        name="MyComplaintsTab"
        component={MyComplaintsScreen}
        options={{
          tabBarLabel: 'My Reports',
          tabBarIcon: ({ color, size }) => <FileText size={size || 22} color={color} />,
        }}
      />

      {isAdmin ? (
        <Tab.Screen
          name="AdminTab"
          component={AdminScreen}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color, size }) => <Shield size={size || 22} color={color} />,
          }}
        />
      ) : (
        <Tab.Screen
          name="AccountTab"
          component={user ? MyComplaintsScreen : LoginScreen}
          options={{
            tabBarLabel: user ? 'Account' : 'Sign In',
            tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />,
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
