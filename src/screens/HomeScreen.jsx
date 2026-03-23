import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, shadows } from '../constants/appTheme';
import { useAppData } from '../context/AppContext';
import { formatHistoryDate, truncateText } from '../utils/appUtils';

const actionCards = [
  {
    key: 'QRScanner',
    title: 'Scan QR',
    subtitle: 'Instant camera scan',
    icon: (
      <MaterialCommunityIcons name="qrcode-scan" size={30} color={palette.primary} />
    ),
  },
  {
    key: 'BarcodeScanner',
    title: 'Scan Barcode',
    subtitle: 'UPC, EAN, CODE',
    icon: (
      <MaterialCommunityIcons name="barcode-scan" size={30} color={palette.primary} />
    ),
  },
  {
    key: 'GenerateQR',
    title: 'Generate QR',
    subtitle: 'Custom content',
    icon: <Feather name="plus-square" size={28} color={palette.primary} />,
  },
  {
    key: 'GenerateBarcode',
    title: 'Generate Barcode',
    subtitle: 'Many formats',
    icon: <MaterialCommunityIcons name="barcode" size={30} color={palette.primary} />,
  },
];

export default function HomeScreen({ navigation }) {
  const { insights, isHydrated } = useAppData();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>QR & Barcode Hub</Text>
              <Text style={styles.subtitle}>Fast scans, clean history, better workflow</Text>
            </View>

            <TouchableOpacity
              style={styles.settingsButton}
              activeOpacity={0.88}
              onPress={() => navigation.getParent().navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={21} color="#334155" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.insightCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('History')}
          >
            <View style={styles.insightLeft}>
              <View style={styles.insightIconWrap}>
                <MaterialCommunityIcons name="chart-box-outline" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.insightTextWrap}>
                <Text style={styles.insightLabel}>TODAY</Text>
                <Text style={styles.insightValue}>
                  {isHydrated
                    ? `${insights.scannedToday} scans, ${insights.generatedToday} generated`
                    : 'Loading analytics...'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#D5D9FF" />
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>{isHydrated ? insights.qrCount : '--'}</Text>
              <Text style={styles.statsLabel}>Total QR</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>{isHydrated ? insights.barcodeCount : '--'}</Text>
              <Text style={styles.statsLabel}>Total Barcodes</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>{isHydrated ? insights.totalItems : '--'}</Text>
              <Text style={styles.statsLabel}>All Entries</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {actionCards.map((card) => (
              <TouchableOpacity
                key={card.key}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.getParent().navigate(card.key)}
              >
                <View style={styles.cardIcon}>{card.icon}</View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.recentCard}>
            <View style={styles.recentTop}>
              <Text style={styles.recentTitle}>Recent activity</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('History')}
                activeOpacity={0.85}
              >
                <Text style={styles.recentLink}>View all</Text>
              </TouchableOpacity>
            </View>

            {insights.latestItem ? (
              <View style={styles.recentBody}>
                <View style={styles.recentBadge}>
                  <Text style={styles.recentBadgeText}>
                    {insights.latestItem.codeFamily === 'qr' ? 'QR' : 'BARCODE'}
                  </Text>
                </View>
                <Text style={styles.recentValue}>
                  {truncateText(insights.latestItem.value, 80)}
                </Text>
                <Text style={styles.recentMeta}>
                  {insights.latestItem.source.toUpperCase()} .{' '}
                  {formatHistoryDate(insights.latestItem.createdAt)}
                </Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>
                No history yet. Start with Scan QR or Generate QR.
              </Text>
            )}
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 26,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
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
  insightCard: {
    marginTop: 20,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.floating,
  },
  insightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  insightIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
  },
  insightTextWrap: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 11,
    letterSpacing: 0.9,
    color: '#C7CCFF',
    fontWeight: '700',
  },
  insightValue: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 21,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '31.6%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems: 'center',
    ...shadows.card,
  },
  statsNumber: {
    fontSize: 19,
    fontWeight: '800',
    color: palette.text,
  },
  statsLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: palette.textMuted,
  },
  grid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    ...shadows.card,
  },
  cardIcon: {
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
  },
  cardSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: palette.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  recentCard: {
    marginTop: 4,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadows.card,
  },
  recentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.text,
  },
  recentLink: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
  recentBody: {
    marginTop: 10,
  },
  recentBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  recentBadgeText: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  recentValue: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: palette.text,
    fontWeight: '600',
  },
  recentMeta: {
    marginTop: 6,
    fontSize: 12,
    color: palette.textMuted,
    fontWeight: '500',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
    color: palette.textMuted,
    fontWeight: '500',
  },
});
