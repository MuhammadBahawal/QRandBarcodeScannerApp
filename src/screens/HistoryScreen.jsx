import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HistoryPreviewModal from '../components/HistoryPreviewModal';
import { palette, shadows } from '../constants/appTheme';
import { useAppData } from '../context/AppContext';
import { formatHistoryDate, truncateText } from '../utils/appUtils';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'scan', label: 'Scanned' },
  { key: 'generated', label: 'Generated' },
];

export default function HistoryScreen({ navigation }) {
  const { history, clearHistory, removeHistoryItem, settings } = useAppData();
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return history.filter((item) => {
      const filterMatch = activeFilter === 'all' || item.source === activeFilter;
      if (!filterMatch) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const valueText = String(item.value || item.content || '').toLowerCase();
      const formatText = String(item.format || '').toLowerCase();
      const familyText = String(item.codeFamily || item.type || '').toLowerCase();

      return (
        valueText.includes(normalizedQuery) ||
        formatText.includes(normalizedQuery) ||
        familyText.includes(normalizedQuery)
      );
    });
  }, [activeFilter, history, query]);

  const askClearHistory = () => {
    if (!history.length) {
      return;
    }

    const runClear = () => {
      setIsModalVisible(false);
      setSelectedItem(null);
      clearHistory();
    };

    if (!settings.confirmBeforeClearHistory) {
      runClear();
      return;
    }

    Alert.alert(
      'Clear history?',
      'This will remove all scanned and generated entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear all', style: 'destructive', onPress: runClear },
      ]
    );
  };

  const handleOpenItem = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const renderItem = ({ item }) => {
    const isQr = (item.type || item.codeFamily) === 'qr';
    const iconName = isQr ? 'qrcode' : 'barcode';
    const badgeText = isQr ? 'QR' : 'BARCODE';

    return (
      <View style={styles.itemCard}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => handleOpenItem(item)}>
          <View style={styles.itemHeader}>
            <View style={styles.itemLeft}>
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons
                  name={iconName}
                  size={20}
                  color={palette.primary}
                />
              </View>
              <View style={styles.itemInfo}>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeText}</Text>
                  </View>
                  <Text style={styles.metaText}>
                    {item.source.toUpperCase()} . {item.format}
                  </Text>
                </View>
                <Text style={styles.valueText}>{truncateText(item.value, 100)}</Text>
                <Text style={styles.timeText}>{formatHistoryDate(item.createdAt)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.smallAction}
            onPress={async () => {
              await Clipboard.setStringAsync(item.value);
              Alert.alert('Copied', 'Value copied to clipboard.');
            }}
            activeOpacity={0.86}
          >
            <Feather name="copy" size={15} color={palette.primary} />
            <Text style={styles.smallActionText}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallAction}
            onPress={() => {
              if (selectedItem?.id === item.id) {
                setIsModalVisible(false);
                setSelectedItem(null);
              }
              removeHistoryItem(item.id);
            }}
            activeOpacity={0.86}
          >
            <Feather name="trash-2" size={15} color={palette.danger} />
            <Text style={[styles.smallActionText, { color: palette.danger }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>History</Text>
            <Text style={styles.subtitle}>Tap any item to preview and export image</Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={askClearHistory}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={18} color={history.length ? '#B91C1C' : '#94A3B8'} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search history"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.filterRow}>
          {filters.map((filter) => {
            const isActive = filter.key === activeFilter;

            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterButton, isActive && styles.filterButtonActive]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.86}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="history" size={56} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No history yet</Text>
              <Text style={styles.emptyText}>
                Start scanning or generating codes to build your timeline.
              </Text>
              <TouchableOpacity
                style={styles.emptyAction}
                onPress={() => navigation.navigate('GenerateQR')}
                activeOpacity={0.88}
              >
                <Text style={styles.emptyActionText}>Generate QR</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <HistoryPreviewModal
          visible={isModalVisible}
          item={selectedItem}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedItem(null);
          }}
        />
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
    lineHeight: 20,
    color: palette.textMuted,
    fontWeight: '500',
  },
  clearButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...shadows.card,
  },
  searchBox: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8E1EE',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: palette.text,
    fontWeight: '500',
  },
  filterRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#E8EDF5',
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 22,
  },
  itemCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 10,
    ...shadows.card,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    color: palette.primary,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  valueText: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text,
    fontWeight: '600',
  },
  timeText: {
    marginTop: 6,
    fontSize: 12,
    color: palette.textMuted,
    fontWeight: '500',
  },
  actionRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  smallAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBE4F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  smallActionText: {
    marginLeft: 6,
    fontSize: 12,
    color: palette.primary,
    fontWeight: '700',
  },
  emptyWrap: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 20,
    color: palette.text,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: palette.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyAction: {
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: palette.primary,
    paddingHorizontal: 16,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
