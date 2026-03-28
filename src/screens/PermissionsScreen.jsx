import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '../constants/appTheme';
import SettingsInfoTemplateScreen from '../components/SettingsInfoTemplateScreen';

const permissionItems = [
  {
    key: 'camera',
    icon: 'camera',
    title: 'Camera Access',
    subtitle: 'Required for scanning QR codes and barcodes.',
  },
  {
    key: 'photos',
    icon: 'image',
    title: 'Photos / Media Access',
    subtitle: 'Required when saving generated code images to gallery.',
  },
];

export default function PermissionsScreen({ navigation }) {
  return (
    <SettingsInfoTemplateScreen
      navigation={navigation}
      title="Permissions"
      description="Manage and review app permissions used for scanning and saving code images."
    >
      <View style={styles.listWrap}>
        {permissionItems.map((item) => (
          <View key={item.key} style={styles.itemRow}>
            <View style={styles.iconWrap}>
              <Feather name={item.icon} size={16} color={palette.primary} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>
    </SettingsInfoTemplateScreen>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  itemRow: {
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  itemTitle: {
    fontSize: 14,
    color: palette.text,
    fontWeight: '800',
  },
  itemSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: palette.textMuted,
    fontWeight: '500',
  },
});

