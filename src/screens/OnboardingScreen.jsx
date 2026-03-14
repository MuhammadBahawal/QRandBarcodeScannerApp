import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding Screen</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Home')}
      >
        <Text style={styles.buttonText}>Go To Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5B4CF0',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});