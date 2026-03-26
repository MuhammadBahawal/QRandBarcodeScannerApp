import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { palette, shadows } from '../constants/appTheme';
import {
  pickImageFromGallery,
  validateImageFile,
  createLogoConfig,
  getLogoSizeRecommendations,
  estimateRequiredErrorCorrectionLevel,
} from '../utils/qrLogoUtils';

export default function QRLogoCustomizer({ 
  onLogoSelected, 
  onLogoRemoved, 
  qrCodeSize = 220,
  currentLogo = null,
  style,
}) {
  const [logo, setLogo] = useState(currentLogo);
  const [isLoading, setIsLoading] = useState(false);
  const [logoEnabled, setLogoEnabled] = useState(!!currentLogo);
  const [logoSizePercentage, setLogoSizePercentage] = useState(25);

  const logoSizeRecommendations = getLogoSizeRecommendations(qrCodeSize);
  const errorCorrectionLevel = estimateRequiredErrorCorrectionLevel(logoSizePercentage);

  const handlePickLogo = async () => {
    try {
      setIsLoading(true);
      const pickedImage = await pickImageFromGallery();

      if (pickedImage) {
        const isValid = await validateImageFile(pickedImage.uri);

        if (!isValid) {
          Alert.alert('Invalid Image', 'Please select a valid image file.');
          return;
        }

        const logoConfig = createLogoConfig(pickedImage.uri, qrCodeSize, {
          width: pickedImage.width,
          height: pickedImage.height,
        });

        setLogo(logoConfig);
        setLogoEnabled(true);
        onLogoSelected?.(logoConfig);
      }
    } catch (error) {
      console.error('Error picking logo:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoEnabled(false);
    onLogoRemoved?.();
  };

  const handleLogoToggle = (enabled) => {
    setLogoEnabled(enabled);
    if (enabled && logo) {
      onLogoSelected?.(logo);
    } else if (!enabled) {
      onLogoRemoved?.();
    }
  };

  const handleLogoSizeChange = (newSize) => {
    if (newSize >= 0 && newSize <= 100) {
      setLogoSizePercentage(newSize);
      if (logo) {
        const updatedConfig = createLogoConfig(logo.uri, qrCodeSize);
        setLogo(updatedConfig);
        onLogoSelected?.(updatedConfig);
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <View style={styles.titleSection}>
          <MaterialCommunityIcons 
            name="image-plus" 
            size={20} 
            color={palette.primary} 
            style={styles.icon}
          />
          <Text style={styles.sectionTitle}>Add Logo to QR</Text>
        </View>
        {logo && (
          <Switch
            value={logoEnabled}
            onValueChange={handleLogoToggle}
            trackColor={{ false: '#CBD5E1', true: '#A5F3FC' }}
            thumbColor={logoEnabled ? palette.primary : '#F1F5F9'}
          />
        )}
      </View>

      {!logo ? (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handlePickLogo}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={palette.primary} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="cloud-upload"
                size={32}
                color={palette.primary}
              />
              <Text style={styles.uploadText}>Upload Logo from Gallery</Text>
              <Text style={styles.uploadSubtext}>JPG, PNG • Square aspect ratio recommended</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <ScrollView 
          style={styles.logoPreviewSection}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewCard}>
            <View style={styles.logoPreview}>
              <Image
                source={{ uri: logo.uri }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.logoInfoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Logo Size</Text>
                <Text style={styles.infoValue}>
                  {logoSizePercentage}% ({Math.round((qrCodeSize * logoSizePercentage) / 100)}px)
                </Text>
              </View>

              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Adjust Size</Text>
                <View style={styles.sizePresetRow}>
                  <TouchableOpacity
                    style={[
                      styles.sizePreset,
                      logoSizePercentage === 15 && styles.sizePresetActive,
                    ]}
                    onPress={() => handleLogoSizeChange(15)}
                  >
                    <Text
                      style={[
                        styles.sizePresetText,
                        logoSizePercentage === 15 && styles.sizePresetTextActive,
                      ]}
                    >
                      Small
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sizePreset,
                      logoSizePercentage === 25 && styles.sizePresetActive,
                    ]}
                    onPress={() => handleLogoSizeChange(25)}
                  >
                    <Text
                      style={[
                        styles.sizePresetText,
                        logoSizePercentage === 25 && styles.sizePresetTextActive,
                      ]}
                    >
                      Medium
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sizePreset,
                      logoSizePercentage === 35 && styles.sizePresetActive,
                    ]}
                    onPress={() => handleLogoSizeChange(35)}
                  >
                    <Text
                      style={[
                        styles.sizePresetText,
                        logoSizePercentage === 35 && styles.sizePresetTextActive,
                      ]}
                    >
                      Large
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.errorCorrectionRow}>
                <View style={styles.correctionInfo}>
                  <MaterialCommunityIcons 
                    name="shield-check" 
                    size={16} 
                    color={palette.primary}
                  />
                  <Text style={styles.correctionLabel}>Error Correction</Text>
                </View>
                <Text style={styles.correctionLevel}>{errorCorrectionLevel} (High)</Text>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveLogo}
                activeOpacity={0.85}
              >
                <Feather name="trash-2" size={16} color="#DC2626" />
                <Text style={styles.removeButtonText}>Remove Logo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      <View style={styles.tipsSection}>
        <View style={styles.tipItem}>
          <MaterialCommunityIcons 
            name="information-outline" 
            size={14} 
            color={palette.primary}
          />
          <Text style={styles.tipText}>Logo should be 15-35% of QR code size</Text>
        </View>
        <View style={styles.tipItem}>
          <MaterialCommunityIcons 
            name="information-outline" 
            size={14} 
            color={palette.primary}
          />
          <Text style={styles.tipText}>Square images work best for circular logos</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: palette.primary,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FF',
    minHeight: 160,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  logoPreviewSection: {
    marginVertical: 12,
  },
  previewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  logoPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    ...shadows.card,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoInfoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  sizePresetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizePreset: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  sizePresetActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  sizePresetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  sizePresetTextActive: {
    color: '#FFFFFF',
  },
  errorCorrectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  correctionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  correctionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  correctionLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.primary,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    gap: 6,
    marginTop: 8,
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  tipsSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
});
