import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getBarcodeFormatLabel,
  normalizeBarcodeFormat,
} from '../constants/barcodeFormats';
import { palette } from '../constants/appTheme';
import useCodeExportActions from '../hooks/useCodeExportActions';
import { formatHistoryDate } from '../utils/appUtils';
import {
  formatProfileDetailsForClipboard,
  parseProfileQrValue,
} from '../utils/profileQrUtils';
import ActionButtons from './ActionButtons';
import CodePreviewCard from './CodePreviewCard';

export default function HistoryPreviewModal({ visible, item, onClose }) {
  const previewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;
  const { loadingAction, shareFromPreviewRef, saveFromPreviewRef } = useCodeExportActions();

  const codeType = item?.type || item?.codeFamily || 'qr';
  const isBarcode = codeType === 'barcode';
  const rawValue = String(item?.value || item?.content || '');
  const parsedDetail = !isBarcode ? parseProfileQrValue(rawValue) : null;
  const detailText = parsedDetail ? formatProfileDetailsForClipboard(parsedDetail) : rawValue;
  const safeFormat = useMemo(
    () => normalizeBarcodeFormat(item?.format),
    [item?.format]
  );

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 18,
          bounciness: 5,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    fadeAnim.setValue(0);
    slideAnim.setValue(18);
  }, [fadeAnim, slideAnim, visible]);

  if (!item) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.modalTitle}>Code Preview</Text>
              <Text style={styles.modalSubtitle}>
                {isBarcode ? getBarcodeFormatLabel(safeFormat) : 'QR Code'} .{' '}
                {formatHistoryDate(item.createdAt)}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.86}>
              <Ionicons name="close" size={22} color={palette.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            <CodePreviewCard
              ref={previewRef}
              type={isBarcode ? 'barcode' : 'qr'}
              value={rawValue}
              barcodeFormat={safeFormat}
              showMeta={false}
            />

            <View style={styles.valueCard}>
              <Text style={styles.valueLabel}>
                {parsedDetail ? 'Shared details' : 'Original content'}
              </Text>
              <Text style={styles.valueText}>{detailText}</Text>
            </View>

            <ActionButtons
              loadingAction={loadingAction}
              onShare={() => shareFromPreviewRef(previewRef, 'Share code from history')}
              onSaveImage={() => saveFromPreviewRef(previewRef)}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.42)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.text,
  },
  modalSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: palette.textMuted,
    fontWeight: '600',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EEF7',
  },
  scrollBody: {
    paddingBottom: 6,
  },
  valueCard: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  valueLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    color: '#64748B',
    fontWeight: '700',
  },
  valueText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: palette.text,
    fontWeight: '600',
  },
});

