import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { WalletProvider } from './src/contexts/WalletContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WalletProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
