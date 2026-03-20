import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const actionCards = [
  {
    id: '1',
    title: 'Scan QR',
    subtitle: 'Instant capture',
    iconType: 'MaterialCommunityIcons',
    iconName: 'qrcode-scan',
    screen: 'QRScanner',
  },
  {
    id: '2',
    title: 'Scan\nBarcode',
    subtitle: 'UPC & EAN',
    iconType: 'MaterialCommunityIcons',
    iconName: 'barcode-scan',
    screen: 'BarcodeScanner',
  },
  {
    id: '3',
    title: 'Generate QR',
    subtitle: 'Custom styles',
    iconType: 'Feather',
    iconName: 'plus-square',
    screen: 'GenerateQR',
  },
  {
    id: '4',
    title: 'Gen Barcode',
    subtitle: 'Universal codes',
    iconType: 'MaterialCommunityIcons',
    iconName: 'barcode',
    screen: 'GenerateBarcode',
  },
];

const RenderCardIcon = ({ iconType, iconName }) => {
  if (iconType === 'Feather') {
    return <Feather name={iconName} size={34} color="#4F46F8" />;
  }

  return <MaterialCommunityIcons name={iconName} size={34} color="#4F46F8" />;
};

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Hello, ready to scan?</Text>
              <Text style={styles.subtitle}>Welcome back to QR & Barcode Pro</Text>
            </View>

            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.insightCard} activeOpacity={0.9}>
            <View style={styles.insightLeft}>
              <View style={styles.magicIconWrap}>
                <MaterialCommunityIcons
                  name="magic-staff"
                  size={22}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.insightTextWrap}>
                <Text style={styles.insightLabel}>QUICK INSIGHT</Text>
                <Text style={styles.insightValue}>3 codes generated today</Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={24} color="#D7D4FF" />
          </TouchableOpacity>

          <View style={styles.grid}>
            {actionCards.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.cardIconBox}>
                  <RenderCardIcon
                    iconType={item.iconType}
                    iconName={item.iconName}
                  />
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomTabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home" size={24} color="#4F46F8" />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>HOME</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ScanOptions')}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#94A3B8" />
            <Text style={styles.tabLabel}>SCAN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('History')}
          >
            <MaterialCommunityIcons name="history" size={24} color="#94A3B8" />
            <Text style={styles.tabLabel}>HISTORY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F3F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F3F6',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 10 : 6,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 14,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    fontWeight: '500',
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  insightCard: {
    minHeight: 108,
    borderRadius: 54,
    backgroundColor: '#4F46F8',
    paddingHorizontal: 22,
    paddingVertical: 18,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#4F46F8',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 7,
  },
  insightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  insightTextWrap: {
    flex: 1,
  },
  magicIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C9C6FF',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 16,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#CBD5E1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 5,
    minHeight: 185,
  },
  cardIconBox: {
    width: 92,
    height: 92,
    borderRadius: 24,
    backgroundColor: '#ECEBFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomTabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 84,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    width: 70,
    alignItems: 'center',
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#4F46F8',
  },
});