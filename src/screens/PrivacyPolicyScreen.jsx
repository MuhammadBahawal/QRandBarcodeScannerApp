import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '../constants/appTheme';
import SettingsInfoTemplateScreen from '../components/SettingsInfoTemplateScreen';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SettingsInfoTemplateScreen
      navigation={navigation}
      title="Privacy Policy"
      description="This placeholder will be replaced with your full privacy policy content and official policy URL."
    >
      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Policy Notice</Text>
        <Text style={styles.noteText}>
          Define what data is collected, how it is used, and how users can contact you for privacy concerns.
        </Text>
      </View>
    </SettingsInfoTemplateScreen>
  );
}

const styles = StyleSheet.create({
  noteBox: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    padding: 12,
  },
  noteTitle: {
    fontSize: 14,
    color: palette.text,
    fontWeight: '800',
  },
  noteText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: palette.textMuted,
    fontWeight: '500',
  },
});

