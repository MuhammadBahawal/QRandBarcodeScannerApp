import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';

import {
  getBarcodeFormatLabel,
  normalizeBarcodeFormat,
} from '../constants/barcodeFormats';
import { palette } from '../constants/appTheme';

const CodePreviewCard = forwardRef(function CodePreviewCard(
  {
    type,
    value,
    barcodeFormat,
    qrForegroundColor = '#111827',
    qrBackgroundColor = '#FFFFFF',
    showMeta = true,
    placeholderText = 'Add content to preview your code',
    style,
    previewStyle,
    onError,
    logoConfig = null,
  },
  ref
) {
  const shotRef = useRef(null);
  const [previewWidth, setPreviewWidth] = useState(320);
  const [renderError, setRenderError] = useState('');
  const safeValue = String(value || '').trim();
  const codeType = type === 'barcode' ? 'barcode' : 'qr';
  const normalizedFormat = useMemo(
    () => normalizeBarcodeFormat(barcodeFormat),
    [barcodeFormat]
  );
  const qrSize = Math.min(220, Math.max(160, previewWidth - 54));
  const barcodeWidth = Math.min(340, Math.max(220, previewWidth - 34));

  useEffect(() => {
    setRenderError('');
  }, [safeValue, normalizedFormat, codeType]);

  useImperativeHandle(ref, () => ({
    capture: (options = {}) =>
      shotRef.current?.capture({
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        ...options,
      }),
  }));

  return (
    <View style={[styles.card, style]}>
      <View
        style={[styles.previewBox, previewStyle]}
        onLayout={(event) => setPreviewWidth(event.nativeEvent.layout.width)}
      >
        <ViewShot
          ref={shotRef}
          options={{ format: 'png', quality: 1, result: 'tmpfile' }}
          style={[
            styles.captureArea,
            codeType === 'qr'
              ? { backgroundColor: qrBackgroundColor }
              : styles.barcodeCaptureArea,
          ]}
        >
          {safeValue && !renderError ? (
            codeType === 'qr' ? (
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={safeValue}
                  size={qrSize}
                  color={qrForegroundColor}
                  backgroundColor={qrBackgroundColor}
                  onError={(error) => {
                    setRenderError(error?.message || 'Could not render this QR code.');
                    onError?.(error);
                  }}
                />
                {logoConfig && (
                  <View
                    style={[
                      styles.logoOverlayContainer,
                      {
                        width: qrSize,
                        height: qrSize,
                        position: 'absolute',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.logoBackground,
                        {
                          width: (logoConfig.width || 52) + 6,
                          height: (logoConfig.height || 52) + 6,
                          borderRadius: logoConfig.type === 'platform' ? ((logoConfig.width || 52) + 6) / 2 : 0,
                          backgroundColor: logoConfig.type === 'platform' ? (logoConfig.backgroundColor || qrBackgroundColor) : 'transparent',
                        },
                      ]}
                    />

                    {logoConfig.uri ? (
                      <Image
                        source={{ uri: logoConfig.uri }}
                        style={[
                          styles.logoImage,
                          {
                            width: logoConfig.width || 52,
                            height: logoConfig.height || 52,
                            borderRadius: (logoConfig.width || 52) / 2,
                          },
                        ]}
                        resizeMode="cover"
                      />
                    ) : logoConfig.iconName ? (
                      <FontAwesome5
                        name={logoConfig.iconName}
                        size={logoConfig.width || 40}
                        color={logoConfig.iconColor || '#FFFFFF'}
                      />
                    ) : null}
                  </View>
                )}
              </View>
            ) : (
              <Barcode
                value={safeValue}
                format={normalizedFormat}
                maxWidth={barcodeWidth}
                height={90}
                text={safeValue}
                textStyle={styles.barcodeText}
                onError={(error) => {
                  setRenderError(error?.message || 'Could not render this barcode.');
                  onError?.(error);
                }}
              />
            )
          ) : (
            <View style={styles.placeholderWrap}>
              <MaterialCommunityIcons
                name={codeType === 'qr' ? 'qrcode' : 'barcode'}
                size={56}
                color="#CBD5E1"
              />
              <Text style={styles.placeholderText}>
                {renderError || placeholderText}
              </Text>
            </View>
          )}
        </ViewShot>
      </View>

      {showMeta ? (
        <View style={styles.metaWrap}>
          <Text style={styles.metaTitle}>
            {codeType === 'qr' ? 'QR Code' : getBarcodeFormatLabel(normalizedFormat)}
          </Text>
          <Text style={styles.metaSubtitle}>
            {safeValue ? 'Ready for share or save image' : 'Waiting for input'}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  previewBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    minHeight: 210,
    backgroundColor: '#FFFFFF',
  },
  captureArea: {
    minHeight: 210,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  barcodeCaptureArea: {
    backgroundColor: '#FFFFFF',
  },
  barcodeText: {
    marginTop: 10,
    fontSize: 12,
    textAlign: 'center',
    color: '#334155',
  },
  placeholderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  placeholderText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metaWrap: {
    marginTop: 10,
  },
  metaTitle: {
    fontSize: 14,
    color: palette.text,
    fontWeight: '800',
  },
  metaSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: palette.textMuted,
    fontWeight: '500',
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoOverlayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  logoBackground: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  logoImage: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default CodePreviewCard;
