import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette } from '../constants/appTheme';
import SettingsInfoTemplateScreen from '../components/SettingsInfoTemplateScreen';

export default function ContactSupportScreen({ navigation }) {
  return (
    <SettingsInfoTemplateScreen
      navigation={navigation}
      title="Contact Support"
      description="Need help? This placeholder can be connected to email, in-app chat, or support form."
    >
      <TouchableOpacity style={styles.contactCard} activeOpacity={0.88}>
        <View style={styles.iconWrap}>
          <Feather name="mail" size={16} color={palette.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.contactTitle}>support@example.com</Text>
          <Text style={styles.contactSubtitle}>Response within 24-48 hours</Text>
        </View>
      </TouchableOpacity>
    </SettingsInfoTemplateScreen>
  );
}

const styles = StyleSheet.create({
  contactCard: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    color: palette.text,
    fontWeight: '800',
  },
  contactSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: palette.textMuted,
    fontWeight: '500',
  },
});

