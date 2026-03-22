import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '../constants/appTheme';

const tabs = [
  {
    key: 'Home',
    label: 'HOME',
    renderIcon: (isActive) => (
      <Ionicons name={isActive ? 'home' : 'home-outline'} size={23} color={isActive ? palette.primary : '#94A3B8'} />
    ),
  },
  {
    key: 'ScanOptions',
    label: 'SCAN',
    renderIcon: (isActive) => (
      <MaterialCommunityIcons
        name="qrcode-scan"
        size={23}
        color={isActive ? palette.primary : '#94A3B8'}
      />
    ),
  },
  {
    key: 'History',
    label: 'HISTORY',
    renderIcon: (isActive) => (
      <MaterialCommunityIcons
        name="history"
        size={23}
        color={isActive ? palette.primary : '#94A3B8'}
      />
    ),
  },
];

export default function AppBottomNav({ navigation, currentRoute }) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <View style={[styles.container, { paddingBottom: bottomInset, height: 64 + bottomInset }]}>
      {tabs.map((tab) => {
        const isActive = tab.key === currentRoute;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            activeOpacity={0.85}
            onPress={() => {
              if (!isActive) {
                navigation.navigate(tab.key);
              }
            }}
          >
            {tab.renderIcon(isActive)}
            <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#E6EAF0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  tabItem: {
    alignItems: 'center',
    minWidth: 82,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 0.6,
    fontWeight: '800',
    color: '#94A3B8',
  },
  activeLabel: {
    color: palette.primary,
  },
});

