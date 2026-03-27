import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, shadows } from '../constants/appTheme';
import { useAppData } from '../context/AppContext';
import { normalizeUrl, truncateText } from '../utils/appUtils';
import { parseProfileQrValue } from '../utils/profileQrUtils';

const modeConfig = {
  qr: {
    title: 'QR Scanner',
    subtitle: 'Place the QR code inside the frame',
    barcodeTypes: ['qr'],
    codeFamily: 'qr',
  },
  barcode: {
    title: 'Barcode Scanner',
    subtitle: 'Place the barcode inside the frame',
    barcodeTypes: [
      'ean13',
      'ean8',
      'upc_a',
      'upc_e',
      'code39',
      'code128',
      'itf14',
      'codabar',
    ],
    codeFamily: 'barcode',
  },
};

export default function CodeScannerScreen({ navigation, mode }) {
  const scannerMode = mode === 'barcode' ? 'barcode' : 'qr';
  const config = modeConfig[scannerMode];
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isTorchEnabled, setIsTorchEnabled] = useState(false);
  const [isScanLocked, setIsScanLocked] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState('');

  const { addHistoryItem, settings } = useAppData();

  const scannerSettings = useMemo(
    () => ({ barcodeTypes: config.barcodeTypes }),
    [config.barcodeTypes]
  );

  useFocusEffect(
    useCallback(() => {
      setIsScanLocked(false);
      setScanResult(null);
      return undefined;
    }, [])
  );

  const handleScanned = async ({ data, type }) => {
    if (isScanLocked) {
      return;
    }

    const value = String(data || '').trim();

    if (!value) {
      return;
    }

    setIsScanLocked(true);

    if (settings.hapticsOnScan) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => { }
      );
    }

    const profileData =
      config.codeFamily === 'qr' ? parseProfileQrValue(value) : null;
    const normalizedUrl = normalizeUrl(value);
    const parsedResult = {
      value,
      type: String(type || 'unknown').toUpperCase(),
      isUrl: Boolean(normalizedUrl),
      normalizedUrl,
      isProfile: Boolean(profileData),
      profileData,
    };

    addHistoryItem({
      source: 'scan',
      codeFamily: config.codeFamily,
      format: parsedResult.type,
      value,
    });

    if (profileData) {
      navigation.navigate('ProfileDetail', {
        profile: profileData,
      });
      return;
    }

    setScanResult(parsedResult);

    if (settings.autoOpenLinks && normalizedUrl) {
      Linking.openURL(normalizedUrl).catch(() => {
        Alert.alert('Could not open link', 'The scanned text is not a valid URL.');
      });
    }
  };

  const handleCopy = async () => {
    if (!scanResult) {
      return;
    }

    await Clipboard.setStringAsync(scanResult.value);
    Alert.alert('Copied', 'Scanned value copied to clipboard.');
  };

  const handleOpenUrl = async () => {
    if (!scanResult?.normalizedUrl) {
      return;
    }

    try {
      await Linking.openURL(scanResult.normalizedUrl);
    } catch (error) {
      Alert.alert('Could not open link', 'Please verify the scanned URL.');
    }
  };

  const handleReset = () => {
    setIsScanLocked(false);
    setScanResult(null);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <TouchableOpacity
          style={[styles.backFloating, { top: Math.max(insets.top + 6, 16) }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={22} color={palette.text} />
        </TouchableOpacity>

        <View style={styles.permissionCard}>
          <MaterialCommunityIcons name="camera-outline" size={40} color={palette.primary} />
          <Text style={styles.permissionTitle}>Camera access is required</Text>
          <Text style={styles.permissionText}>
            Enable camera permission to scan QR codes and barcodes instantly.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestPermission}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryButtonText}>Allow Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={isTorchEnabled}
        onMountError={(event) => setCameraError(event?.nativeEvent?.message || '')}
        barcodeScannerSettings={scannerSettings}
        onBarcodeScanned={isScanLocked ? undefined : handleScanned}
      />

      <View style={[styles.overlay, { paddingTop: Math.max(insets.top + 6, 16) }]}>
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{config.title}</Text>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => setIsTorchEnabled((current) => !current)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isTorchEnabled ? 'flash' : 'flash-off'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.scanFrameWrap}>
          <View style={styles.scanFrame}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
        </View>

        <View style={styles.bottomPanel}>
          {!scanResult ? (
            <Text style={styles.instructionText}>{config.subtitle}</Text>
          ) : (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <MaterialCommunityIcons name="check-circle" size={20} color={palette.success} />
                <Text style={styles.resultTitle}>Code detected</Text>
              </View>

              <Text style={styles.resultType}>{scanResult.type}</Text>
              <Text style={styles.resultValue}>{truncateText(scanResult.value, 160)}</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={handleCopy}
                  activeOpacity={0.88}
                >
                  <Feather name="copy" size={16} color={palette.primary} />
                  <Text style={styles.secondaryActionText}>Copy</Text>
                </TouchableOpacity>

                {scanResult.isUrl ? (
                  <TouchableOpacity
                    style={styles.secondaryAction}
                    onPress={handleOpenUrl}
                    activeOpacity={0.88}
                  >
                    <Feather name="external-link" size={16} color={palette.primary} />
                    <Text style={styles.secondaryActionText}>Open</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.primaryAction}
                onPress={handleReset}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryActionText}>Scan Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {cameraError ? <Text style={styles.errorText}>{cameraError}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(4, 9, 25, 0.32)',
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scanFrameWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 270,
    height: 270,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    backgroundColor: 'transparent',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 34,
    height: 34,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 34,
    height: 34,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 34,
    height: 34,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 34,
    height: 34,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 16,
  },
  bottomPanel: {
    minHeight: 165,
    justifyContent: 'flex-end',
  },
  instructionText: {
    textAlign: 'center',
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...shadows.card,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.text,
    marginLeft: 8,
  },
  resultType: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: palette.textMuted,
  },
  resultValue: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: palette.text,
    fontWeight: '500',
  },
  actionRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  secondaryActionText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
  primaryAction: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: palette.primary,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
    color: '#FECACA',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  permissionCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 26,
    alignItems: 'center',
    ...shadows.card,
  },
  permissionTitle: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
  },
  permissionText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: palette.textMuted,
  },
  primaryButton: {
    marginTop: 22,
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  backFloating: {
    position: 'absolute',
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

