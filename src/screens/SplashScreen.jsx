import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SplashScreen({ navigation }) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(progressAnim, {
        toValue: 0.58,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.delay(300),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();

    const handleNavigation = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

        setTimeout(() => {
          if (hasSeenOnboarding === 'true') {
            navigation.replace('Home');
          } else {
            navigation.replace('Onboarding');
          }
        }, 2500);
      } catch (error) {
        setTimeout(() => {
          navigation.replace('Onboarding');
        }, 2500);
      }
    };

    handleNavigation();
  }, [navigation, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoBox}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={34}
            color="#5B4CF0"
          />
        </View>

        <Text style={styles.title}>
          QR & Barcode{'\n'}
          <Text style={styles.highlight}>Generator Scanner</Text>
        </Text>

        <Text style={styles.subtitle}>PREMIUM UTILITY APP</Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        <Text style={styles.loadingText}>INITIALIZING...</Text>
      </View>

      <Text style={styles.footerText}>V 2.1.0 • SECURE & FAST</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 110,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#F2F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8E86FF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E6E1FF',
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  highlight: {
    color: '#5B4CF0',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  progressTrack: {
    width: 150,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    marginTop: 54,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#5B4CF0',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#C0C4CC',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#C4C7CF',
    marginBottom: 8,
  },
});