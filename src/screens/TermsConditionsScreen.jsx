import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '../constants/appTheme';
import SettingsInfoTemplateScreen from '../components/SettingsInfoTemplateScreen';

export default function TermsConditionsScreen({ navigation }) {
  return (
    <SettingsInfoTemplateScreen
      navigation={navigation}
      title="Terms & Conditions"
      description="This placeholder will contain the complete terms for app usage, limitations, and legal responsibilities."
    >
      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Terms Preview</Text>
        <Text style={styles.noteText}>
          Add terms related to acceptable use, third-party links, disclaimers, and updates.
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

