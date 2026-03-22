import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, shadows } from '../constants/appTheme';

const scanCards = [
  {
    key: 'QRScanner',
    title: 'QR Scanner',
    subtitle: 'Scan links, text, contact cards and more',
    icon: 'qrcode-scan',
  },
  {
    key: 'BarcodeScanner',
    title: 'Barcode Scanner',
    subtitle: 'Scan product and inventory barcodes',
    icon: 'barcode-scan',
  },
];

export default function ScanOptionsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Scan Center</Text>
              <Text style={styles.subtitle}>Choose the scanner mode you need</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={21} color="#334155" />
            </TouchableOpacity>
          </View>

          <View style={styles.cardGroup}>
            {scanCards.map((card) => (
              <TouchableOpacity
                key={card.key}
                style={styles.scanCard}
                onPress={() => navigation.navigate(card.key)}
                activeOpacity={0.9}
              >
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name={card.icon} size={30} color={palette.primary} />
                </View>
                <View style={styles.cardTextWrap}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Pro tip</Text>
            <Text style={styles.tipText}>
              Keep the code inside the frame and avoid glare for faster detection.
            </Text>
          </View>
        </ScrollView>
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
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: palette.textMuted,
    fontWeight: '500',
  },
  settingsButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...shadows.card,
  },
  cardGroup: {
    marginTop: 24,
    gap: 12,
  },
  scanCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginRight: 12,
  },
  cardTextWrap: {
    flex: 1,
    paddingRight: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    color: palette.textMuted,
    fontWeight: '500',
  },
  tipCard: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadows.card,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: palette.text,
  },
  tipText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: palette.textMuted,
    fontWeight: '500',
  },
});
