import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanOptionsScreen from './src/screens/ScanOptionsScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import BarcodeScannerScreen from './src/screens/BarcodeScannerScreen';
import GenerateQRScreen from './src/screens/GenerateQRScreen';
import GenerateBarcodeScreen from './src/screens/GenerateBarcodeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ScanOptions" component={ScanOptionsScreen} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} />
          <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
          <Stack.Screen name="GenerateQR" component={GenerateQRScreen} />
          <Stack.Screen name="GenerateBarcode" component={GenerateBarcodeScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}