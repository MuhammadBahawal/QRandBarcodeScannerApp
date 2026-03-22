import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, shadows } from '../constants/appTheme';
import ScreenHeader from './ScreenHeader';

export default function SettingsInfoTemplateScreen({
  navigation,
  title,
  description,
  children,
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScreenHeader title={title} onBack={() => navigation.goBack()} compactTop />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.contentCard}>
              {description ? <Text style={styles.description}>{description}</Text> : null}
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  contentCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadows.card,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: palette.textMuted,
    fontWeight: '500',
  },
});
