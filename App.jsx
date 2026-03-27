import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppState, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/context/AppContext';
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
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsConditionsScreen from './src/screens/TermsConditionsScreen';
import PermissionsScreen from './src/screens/PermissionsScreen';
import ContactSupportScreen from './src/screens/ContactSupportScreen';
import { palette } from './src/constants/appTheme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Hide Android system navigation bar.
async function hideAndroidNavigationBar() {
  if (Platform.OS !== 'android') return;

  await Promise.allSettled([
    NavigationBar.setVisibilityAsync('hidden'),
    NavigationBar.setBehaviorAsync('overlay-swipe'),
  ]);
}

function MainTabsNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      detachInactiveScreens={false}
      screenOptions={({ route }) => ({
        headerShown: false,
        animationEnabled: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          borderTopColor: '#E2E8F0',
          backgroundColor: '#FFFFFF',
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
          height: 60 + (Platform.OS === 'ios' ? insets.bottom : 0),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name="home-outline" size={size} color={color} />;
          }

          if (route.name === 'ScanOptions') {
            return (
              <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />
            );
          }

          return (
            <MaterialCommunityIcons name="history" size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', unmountOnBlur: false }}
      />
      <Tab.Screen
        name="ScanOptions"
        component={ScanOptionsScreen}
        options={{ tabBarLabel: 'Scan', unmountOnBlur: false }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: 'History', unmountOnBlur: false }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  // Hide system navigation bar on mount and whenever app comes to foreground.
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    // Hide immediately on mount.
    hideAndroidNavigationBar();

    // Re-hide every time the app comes back to the foreground.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        hideAndroidNavigationBar();
      }
    });

    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer
          onReady={hideAndroidNavigationBar}
          onStateChange={hideAndroidNavigationBar}
        >
          <StatusBar style="dark" translucent backgroundColor="transparent" />
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="MainTabs" component={MainTabsNavigator} options={{ animation: 'none' }} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
            <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
            <Stack.Screen
              name="GenerateQR"
              component={GenerateQRScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="GenerateBarcode"
              component={GenerateBarcodeScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{ animation: 'none' }}
            />
            <Stack.Screen
              name="TermsConditions"
              component={TermsConditionsScreen}
              options={{ animation: 'none' }}
            />
            <Stack.Screen
              name="Permissions"
              component={PermissionsScreen}
              options={{ animation: 'none' }}
            />
            <Stack.Screen
              name="ContactSupport"
              component={ContactSupportScreen}
              options={{ animation: 'none' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
