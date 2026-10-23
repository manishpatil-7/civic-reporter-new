import React from 'react';
import { View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatbotProvider } from './context/ChatbotContext';
import AppNavigator from './navigation/AppNavigator';
import AIChatbot from './components/AIChatbot';
import toastConfig from './config/toastConfig';
import './global.css';

LogBox.ignoreAllLogs(true);

export const navigationRef = createNavigationContainerRef();

export default function App() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <ThemeProvider>
          <AuthProvider>
            <ChatbotProvider>
              <NavigationContainer ref={navigationRef}>
                <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                  <ExpoStatusBar style="dark" />
                  <AppNavigator />
                  <AIChatbot />
                  <Toast config={toastConfig} />
                </View>
              </NavigationContainer>
            </ChatbotProvider>
          </AuthProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
