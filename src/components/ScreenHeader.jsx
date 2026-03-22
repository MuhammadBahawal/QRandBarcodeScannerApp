import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '../constants/appTheme';

export default function ScreenHeader({
  title,
  onBack,
  rightNode = null,
  compactTop = false,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.row,
        {
          paddingTop: compactTop ? 8 : Math.max(insets.top, 10),
        },
      ]}
    >
      {onBack ? (
        <TouchableOpacity style={styles.iconButton} onPress={onBack} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={22} color={palette.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightWrap}>
        {rightNode || <View style={styles.iconPlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F7',
  },
  iconPlaceholder: {
    width: 42,
    height: 42,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  rightWrap: {
    width: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

