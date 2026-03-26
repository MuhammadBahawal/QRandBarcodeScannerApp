import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { palette, shadows } from '../constants/appTheme';
import {
  analyzePlatformUrl,
  getPlatformLogoData,
  PLATFORM_LOGOS,
  createPlatformLogoSvg,
} from '../utils/platformDetection';
import { createLogoConfig, formatLogoForQR } from '../utils/qrLogoUtils';

/**
 * Platform icon mapping
 */
const PLATFORM_ICONS = {
  instagram: 'instagram',
  facebook: 'facebook-f',
  tiktok: 'tiktok',
  twitter: 'twitter',
  youtube: 'youtube',
  linkedin: 'linkedin-in',
  pinterest: 'pinterest-p',
  snapchat: 'snapchat-ghost',
};

export default function PlatformLogoSelector({
  url = '',
  onPlatformLogoSelected,
  onPlatformLogoRemoved,
  qrCodeSize = 220,
  enabled = true,
  style,
}) {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [autoDetectionEnabled, setAutoDetectionEnabled] = useState(enabled);
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize platform analysis
  const platformAnalysis = useMemo(() => {
    return analyzePlatformUrl(url);
  }, [url]);

  const showAutoDetection = platformAnalysis.detected && autoDetectionEnabled;

  const handleSelectPlatform = async (platformId) => {
    try {
      setIsProcessing(true);
      const logoData = getPlatformLogoData(platformId);

      if (!logoData) {
        console.error('Platform logo data not found');
        return;
      }

      // Create logo configuration for the selected platform
      const logoConfig = createLogoConfig(logoData.name, qrCodeSize, {
        width: 200,
        height: 200,
      });

      // Add platform-specific metadata
      const platformLogoConfig = {
        ...logoConfig,
        platformId,
        platformName: logoData.name,
        platformColor: logoData.colors.primary,
        type: 'platform',
      };

      setSelectedPlatform(platformId);
      onPlatformLogoSelected?.(platformLogoConfig);
    } catch (error) {
      console.error('Error selecting platform logo:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePlatformLogo = () => {
    setSelectedPlatform(null);
    onPlatformLogoRemoved?.();
  };

  const handleAutoDetectionToggle = (enabled) => {
    setAutoDetectionEnabled(enabled);

    if (enabled && platformAnalysis.detected) {
      handleSelectPlatform(platformAnalysis.platformId);
    } else {
      handleRemovePlatformLogo();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <View style={styles.titleSection}>
          <MaterialCommunityIcons
            name="auto-fix"
            size={20}
            color={palette.primary}
            style={styles.icon}
          />
          <Text style={styles.sectionTitle}>Auto-Detect Logo</Text>
        </View>
        {showAutoDetection && (
          <Switch
            value={autoDetectionEnabled}
            onValueChange={handleAutoDetectionToggle}
            trackColor={{ false: '#CBD5E1', true: '#A5F3FC' }}
            thumbColor={autoDetectionEnabled ? palette.primary : '#F1F5F9'}
          />
        )}
      </View>

      {!platformAnalysis.detected ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="link-variant"
            size={32}
            color="#CBD5E1"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>Enter a URL to detect the platform</Text>
          <Text style={styles.emptySubtext}>
            Supports Instagram, Facebook, TikTok, Twitter/X, YouTube, LinkedIn, Pinterest, and Snapchat
          </Text>
        </View>
      ) : (
        <View style={styles.detectionResult}>
          <View style={styles.detectedPlatformCard}>
            {isProcessing ? (
              <ActivityIndicator color={palette.primary} />
            ) : (
              <>
                <View
                  style={[
                    styles.platformIconCircle,
                    {
                      backgroundColor: platformAnalysis.logoData?.colors.primary || palette.primary,
                    },
                  ]}
                >
                  <FontAwesome5
                    name={PLATFORM_ICONS[platformAnalysis.platformId] || 'link'}
                    size={24}
                    color="#FFFFFF"
                    solid
                  />
                </View>

                <View style={styles.platformInfo}>
                  <Text style={styles.platformDetectedLabel}>Platform Detected</Text>
                  <Text style={styles.platformName}>
                    {platformAnalysis.logoData?.name || platformAnalysis.platformId}
                  </Text>
                </View>

                {autoDetectionEnabled ? (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={palette.primary}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="circle-outline"
                    size={24}
                    color="#CBD5E1"
                  />
                )}
              </>
            )}
          </View>

          {autoDetectionEnabled && (
            <View style={styles.autoAppliedBadge}>
              <MaterialCommunityIcons name="auto-fix" size={14} color={palette.primary} />
              <Text style={styles.badgeText}>Logo auto-applied</Text>
            </View>
          )}

          {!autoDetectionEnabled && (
            <TouchableOpacity
              style={styles.enableButton}
              onPress={() => handleSelectPlatform(platformAnalysis.platformId)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="plus" size={16} color={palette.primary} />
              <Text style={styles.enableButtonText}>Apply Logo</Text>
            </TouchableOpacity>
          )}

          {autoDetectionEnabled && selectedPlatform === platformAnalysis.platformId && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemovePlatformLogo}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="close" size={16} color="#DC2626" />
              <Text style={styles.removeButtonText}>Remove Logo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Available Platforms</Text>
        <View style={styles.platformGrid}>
          {Object.entries(PLATFORM_LOGOS).map(([platformId, logoData]) => (
            <TouchableOpacity
              key={platformId}
              style={[
                styles.platformGridItem,
                selectedPlatform === platformId && styles.platformGridItemActive,
              ]}
              onPress={() => handleSelectPlatform(platformId)}
              activeOpacity={0.75}
              disabled={isProcessing || !url}
            >
              <View
                style={[
                  styles.gridIconCircle,
                  { backgroundColor: logoData.colors.primary },
                  selectedPlatform === platformId && {
                    borderColor: palette.primary,
                    borderWidth: 2,
                  },
                ]}
              >
                <FontAwesome5
                  name={PLATFORM_ICONS[platformId] || 'link'}
                  size={16}
                  color="#FFFFFF"
                  solid
                />
              </View>
              <Text
                style={[
                  styles.platformGridLabel,
                  selectedPlatform === platformId && styles.platformGridLabelActive,
                ]}
              >
                {logoData.name.split('/')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.tipsSection}>
        <View style={styles.tipItem}>
          <MaterialCommunityIcons
            name="information-outline"
            size={14}
            color={palette.primary}
          />
          <Text style={styles.tipText}>
            Paste any social media URL to auto-detect and apply the platform logo
          </Text>
        </View>
        <View style={styles.tipItem}>
          <MaterialCommunityIcons
            name="information-outline"
            size={14}
            color={palette.primary}
          />
          <Text style={styles.tipText}>
            You can override auto-selected logos manually
          </Text>
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
    marginVertical: 12,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  detectionResult: {
    marginBottom: 16,
  },
  detectedPlatformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  platformIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformInfo: {
    flex: 1,
  },
  platformDetectedLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  autoAppliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: palette.primary,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0F4FF',
    borderWidth: 1.5,
    borderColor: palette.primary,
  },
  enableButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.primary,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  featuresSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  platformGridItem: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  platformGridItemActive: {
    backgroundColor: '#F0F4FF',
    borderColor: palette.primary,
  },
  gridIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  platformGridLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },
  platformGridLabelActive: {
    color: palette.primary,
    fontWeight: '600',
  },
  tipsSection: {
    marginTop: 12,
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
    lineHeight: 16,
  },
});
