import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/ScreenHeader';
import { palette, shadows } from '../constants/appTheme';

const APP_VERSION =
  Constants.expoConfig?.version || Constants.nativeAppVersion || '1.0.0';

function SettingsRow({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.86}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={21} color={palette.primary} />
      </View>

      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

function SettingsSection({ title, children }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const handleRateApp = () => {
    Alert.alert(
      'Rate App',
      'Rate flow will be connected to App Store / Play Store listing.'
    );
  };

  const openPrivacyPolicy = async () => {
    const url = 'https://skanora-legal.netlify.app/';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the link.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open the link.');
    }
  };

  const openTermsConditions = async () => {
    const url = 'https://skanora-legal.netlify.app/terms';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the link.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open the link.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScreenHeader title="Settings" onBack={() => navigation.goBack()} compactTop />

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
            <SettingsSection title="Policy & Legal">
              <SettingsRow
                icon="shield-check-outline"
                title="Privacy Policy"
                subtitle="How user data and permissions are handled"
                onPress={openPrivacyPolicy}
              />
              <SettingsRow
                icon="file-document-outline"
                title="Terms & Conditions"
                subtitle="Usage terms and legal notes"
                onPress={openTermsConditions}
              />
            </SettingsSection>

            <SettingsSection title="Permissions">
              <SettingsRow
                icon="lock-check-outline"
                title="Permissions"
                subtitle="Camera Access, Photos / Media Access"
                onPress={() => navigation.navigate('Permissions')}
              />

              <View style={styles.permissionHintWrap}>
                <View style={styles.permissionHintRow}>
                  <Feather name="camera" size={15} color="#475569" />
                  <Text style={styles.permissionHintText}>Camera Access</Text>
                </View>
                <View style={styles.permissionHintRow}>
                  <Feather name="image" size={15} color="#475569" />
                  <Text style={styles.permissionHintText}>Photos / Media Access</Text>
                </View>
              </View>
            </SettingsSection>

            <SettingsSection title="Support">
              <SettingsRow
                icon="headset"
                title="Contact Support"
                subtitle="Get help and report issues"
                onPress={() => navigation.navigate('ContactSupport')}
              />
              <SettingsRow
                icon="star-outline"
                title="Rate App"
                subtitle="Share your feedback"
                onPress={handleRateApp}
              />
              <SettingsRow
                icon="information-outline"
                title="App Version"
                subtitle={`Version ${APP_VERSION}`}
                onPress={() => {
                  Alert.alert('App Version', `You are using version ${APP_VERSION}`);
                }}
              />
            </SettingsSection>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{`QRandBarcode - v${APP_VERSION}`}</Text>
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
    paddingBottom: 28,
  },
  sectionCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
    marginBottom: 14,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3730A3',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  row: {
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  rowTitle: {
    fontSize: 15,
    color: palette.text,
    fontWeight: '800',
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: palette.textMuted,
    fontWeight: '500',
  },
  permissionHintWrap: {
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  permissionHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionHintText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 2,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
