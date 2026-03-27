import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionButtons from '../components/ActionButtons';
import CodePreviewCard from '../components/CodePreviewCard';
import ScreenHeader from '../components/ScreenHeader';
import { palette, shadows } from '../constants/appTheme';
import { useAppData } from '../context/AppContext';
import useCodeExportActions from '../hooks/useCodeExportActions';
import { analyzePlatformUrl, getPlatformLogoSpec } from '../utils/platformDetection';
import {
  buildProfileQrValue,
  captureProfileImageFromCamera,
  pickProfileImageFromGallery,
  resolveProfileImageUri,
} from '../utils/profileQrUtils';
import { createLogoConfig, pickImageFromGallery, validateImageFile } from '../utils/qrLogoUtils';

const QR_COLOR_OPTIONS = ['#111827', '#4F46E5', '#0F766E', '#B91C1C', '#334155'];
const BG_COLOR_OPTIONS = ['#FFFFFF', '#EEF2FF', '#ECFEFF', '#FDF2F8', '#F8FAFC'];

const TEMPLATE_VALUES = [
  { label: 'Website', value: 'https://example.com' },
  { label: 'Text', value: 'Hello from my QR Scanner app' },
  { label: 'Email', value: 'mailto:hello@example.com' },
  { label: 'Instagram', value: 'https://instagram.com/username' },
  { label: 'Facebook', value: 'https://facebook.com/username' },
  { label: 'Twitter', value: 'https://twitter.com/username' },
  { label: 'TikTok', value: 'https://tiktok.com/@username' },
  { label: 'LinkedIn', value: 'https://linkedin.com/in/username' },
];

const PROFILE_EMPTY_STATE = {
  name: '',
  phone: '',
  email: '',
  address: '',
  bio: '',
  website: '',
  socialLinks: '',
  imageUri: '',
  imageDataUri: '',
};

export default function GenerateQRScreen({ navigation }) {
  const [mode, setMode] = useState('value');
  const [value, setValue] = useState('');
  const [profileFields, setProfileFields] = useState(PROFILE_EMPTY_STATE);
  const [fgColor, setFgColor] = useState(QR_COLOR_OPTIONS[0]);
  const [bgColor, setBgColor] = useState(BG_COLOR_OPTIONS[0]);
  const [renderError, setRenderError] = useState('');
  const [isProfileImageFailed, setIsProfileImageFailed] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [customLogo, setCustomLogo] = useState(null);
  const [autoLogo, setAutoLogo] = useState(null);
  const [autoDetectedPlatform, setAutoDetectedPlatform] = useState(null);
  const previewRef = useRef(null);
  const { addHistoryItem, settings } = useAppData();
  const { loadingAction, shareFromPreviewRef, saveFromPreviewRef } = useCodeExportActions();

  const isProfileMode = mode === 'profile';
  const trimmedValue = value.trim();
  const profileQrValue = useMemo(
    () => buildProfileQrValue(profileFields),
    [profileFields]
  );
  const profileImageUri = useMemo(
    () => resolveProfileImageUri(profileFields),
    [profileFields]
  );
  const activeQrValue = isProfileMode ? profileQrValue : trimmedValue;
  const canGenerate = activeQrValue.length > 0 && activeQrValue.length <= 1800;

  // Determine which logo to use: custom takes priority over platform auto-detection
  const activeLogoConfig = useMemo(() => {
    return customLogo || autoLogo;
  }, [customLogo, autoLogo]);

  const statusMessage = useMemo(() => {
    if (!activeQrValue) {
      return isProfileMode
        ? 'Fill at least one detail field to generate a Detail QR.'
        : 'Enter text or URL to generate a QR code.';
    }

    if (activeQrValue.length > 1800) {
      if (isProfileMode && profileImageUri) {
        return 'Detail content is too large for QR. Use a smaller image or fewer fields.';
      }
      return 'QR value is too long. Keep it under 1800 characters.';
    }

    if (renderError) {
      return renderError;
    }

    return 'Your QR code is ready.';
  }, [activeQrValue, isProfileMode, profileImageUri, renderError]);

  useEffect(() => {
    if (isProfileMode || !trimmedValue) {
      setAutoLogo(null);
      setAutoDetectedPlatform(null);
      return;
    }

    const analysis = analyzePlatformUrl(trimmedValue);

    if (analysis.detected && (!customLogo || !customLogo.uri)) {
      const platformSpec = getPlatformLogoSpec(analysis.platformId);

      if (platformSpec) {
        setAutoLogo({
          iconName: platformSpec.iconName,
          iconColor: platformSpec.iconColor,
          backgroundColor: platformSpec.backgroundColor,
          width: 55,
          height: 55,
          platformId: platformSpec.platformId,
          platformName: platformSpec.platformName,
          type: 'platform',
        });
        setAutoDetectedPlatform(platformSpec.platformId);
      }

      return;
    }

    // If an unknown URL or no detection
    setAutoLogo(null);
    setAutoDetectedPlatform(null);
  }, [isProfileMode, trimmedValue, customLogo]);

  const persistGeneratedQr = () => {
    if (!canGenerate) {
      return null;
    }

    return addHistoryItem({
      source: 'generated',
      codeFamily: 'qr',
      format: 'QR',
      value: activeQrValue,
    });
  };

  const handleProfileFieldChange = (field, nextValue) => {
    setRenderError('');
    setProfileFields((previous) => ({
      ...previous,
      [field]: nextValue,
    }));
  };

  const applyProfileImageResult = (result) => {
    if (!result) {
      Alert.alert('Error', 'Unable to process detail image right now.');
      return;
    }

    if (result.error === 'picker_canceled') {
      return;
    }

    if (result.error === 'permission_denied') {
      Alert.alert(
        'Permission Required',
        'Allow photo library access to select an image.'
      );
      return;
    }

    if (result.error === 'camera_permission_denied') {
      Alert.alert(
        'Permission Required',
        'Allow camera access to capture an image.'
      );
      return;
    }

    if (result.error === 'invalid_asset') {
      Alert.alert('Invalid Image', 'Please choose a valid image.');
      return;
    }

    if (result.error === 'picker_failed' || result.error === 'camera_failed') {
      Alert.alert('Error', 'Could not load image. Please try again.');
      return;
    }

    setProfileFields((previous) => ({
      ...previous,
      imageUri: result.imageUri || '',
      imageDataUri: result.imageDataUri || '',
    }));
    setIsProfileImageFailed(false);
  };

  const handlePickProfileImage = async () => {
    const result = await pickProfileImageFromGallery();
    applyProfileImageResult(result);
  };

  const handleCaptureProfileImage = async () => {
    const result = await captureProfileImageFromCamera();
    applyProfileImageResult(result);
  };

  const handleAddLogo = async () => {
    try {
      const pickedImage = await pickImageFromGallery();

      // Handle errors from pickImageFromGallery
      if (pickedImage?.error) {
        if (pickedImage.error === 'permission_denied') {
          Alert.alert(
            'Permission Required',
            'Please allow access to your photo library to add a logo to your QR code.'
          );
        } else if (pickedImage.error === 'picker_canceled') {
          // User cancelled, no need to show alert
          return;
        } else if (pickedImage.error === 'invalid_asset') {
          Alert.alert('Invalid Image', 'The selected image could not be read.');
        }
        return;
      }

      if (!pickedImage?.uri) {
        return;
      }

      const isValid = await validateImageFile(pickedImage.uri);

      if (!isValid) {
        Alert.alert('Invalid image', 'Please select a valid image file.');
        return;
      }

      const newLogoConfig = createLogoConfig(pickedImage.uri, 220, {
        width: pickedImage.width,
        height: pickedImage.height,
      });

      newLogoConfig.type = 'custom';

      setCustomLogo(newLogoConfig);
      setAutoLogo(null);
      setAutoDetectedPlatform(null);
    } catch (error) {
      console.error('Failed to add logo:', error);
      Alert.alert('Error', 'Unable to add logo. Please try again.');
    }
  };

  const handleCopy = async () => {
    if (!activeQrValue) {
      Alert.alert('No value', 'Please enter something before copying.');
      return;
    }

    await Clipboard.setStringAsync(activeQrValue);
    Alert.alert('Copied', 'QR value copied to clipboard.');
  };

  const handleSaveToHistory = () => {
    Keyboard.dismiss();

    if (!canGenerate) {
      Alert.alert('Cannot save', 'Please enter a valid QR value first.');
      return;
    }

    const historyItem = persistGeneratedQr();

    if (!historyItem && !settings.saveHistory) {
      Alert.alert(
        'History disabled',
        'Turn on "Save history" in Settings if you want to store generated codes.'
      );
      return;
    }

    Alert.alert('Saved', 'QR code value has been added to history.');
  };

  const handleShare = async () => {
    Keyboard.dismiss();

    if (!canGenerate) {
      Alert.alert('Cannot share', 'Please enter a valid value before sharing.');
      return;
    }

    persistGeneratedQr();
    await shareFromPreviewRef(previewRef, 'Share QR code image');
  };

  const handleSaveImage = async () => {
    Keyboard.dismiss();

    if (!canGenerate) {
      Alert.alert('Cannot save image', 'Please enter a valid value first.');
      return;
    }

    persistGeneratedQr();
    await saveFromPreviewRef(previewRef);
  };

  const handleClear = () => {
    Keyboard.dismiss();
    setValue('');
    setProfileFields(PROFILE_EMPTY_STATE);
    setIsProfileImageFailed(false);
    setRenderError('');
    setCustomLogo(null);
    setAutoLogo(null);
    setAutoDetectedPlatform(null);
  };

  React.useEffect(() => {
    let isMounted = true;
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        if (isMounted) {
          setIsPreviewReady(true);
        }
      });
    });

    return () => {
      isMounted = false;
      task.cancel?.();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScreenHeader title="Generate QR" onBack={() => navigation.goBack()} compactTop />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            contentContainerStyle={styles.scrollContent}
          >
              <View style={styles.inputCard}>
                <View style={styles.inputHeader}>
                  <Text style={styles.sectionTitle}>{isProfileMode ? 'Details' : 'Value'}</Text>
                  <TouchableOpacity
                    style={styles.dismissKeyboardChip}
                    activeOpacity={0.85}
                    onPress={Keyboard.dismiss}
                  >
                    <Feather name="chevron-down" size={14} color="#334155" />
                    <Text style={styles.dismissKeyboardText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modeRow}>
                  <TouchableOpacity
                    style={[styles.modeChip, !isProfileMode && styles.modeChipActive]}
                    onPress={() => setMode('value')}
                    activeOpacity={0.88}
                  >
                    <Text style={[styles.modeChipText, !isProfileMode && styles.modeChipTextActive]}>
                      Text / URL
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeChip, isProfileMode && styles.modeChipActive]}
                    onPress={() => setMode('profile')}
                    activeOpacity={0.88}
                  >
                    <Text style={[styles.modeChipText, isProfileMode && styles.modeChipTextActive]}>
                      Details
                    </Text>
                  </TouchableOpacity>
                </View>

                {isProfileMode ? (
                  <View>
                    <View style={styles.profileImageSection}>
                      <View style={styles.profileAvatarWrap}>
                        {profileImageUri && !isProfileImageFailed ? (
                          <Image
                            source={{ uri: profileImageUri }}
                            style={styles.profileAvatarImage}
                            onError={() => setIsProfileImageFailed(true)}
                          />
                        ) : (
                          <View style={styles.profileAvatarPlaceholder}>
                            <Feather name="user" size={22} color="#64748B" />
                          </View>
                        )}
                      </View>
                      <View style={styles.profileImageActions}>
                        <TouchableOpacity
                          style={styles.profileImageButton}
                          onPress={handlePickProfileImage}
                          activeOpacity={0.88}
                        >
                          <Feather name="image" size={14} color={palette.primary} />
                          <Text style={styles.profileImageButtonText}>Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.profileImageButton}
                          onPress={handleCaptureProfileImage}
                          activeOpacity={0.88}
                        >
                          <Feather name="camera" size={14} color={palette.primary} />
                          <Text style={styles.profileImageButtonText}>Camera</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TextInput
                      style={styles.profileInput}
                      placeholder="Full name"
                      placeholderTextColor="#94A3B8"
                      value={profileFields.name}
                      onChangeText={(nextValue) => handleProfileFieldChange('name', nextValue)}
                    />
                    <TextInput
                      style={styles.profileInput}
                      placeholder="Phone number"
                      placeholderTextColor="#94A3B8"
                      value={profileFields.phone}
                      onChangeText={(nextValue) => handleProfileFieldChange('phone', nextValue)}
                      keyboardType="phone-pad"
                    />
                    <TextInput
                      style={styles.profileInput}
                      placeholder="Email"
                      placeholderTextColor="#94A3B8"
                      value={profileFields.email}
                      onChangeText={(nextValue) => handleProfileFieldChange('email', nextValue)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={styles.profileInput}
                      placeholder="Address"
                      placeholderTextColor="#94A3B8"
                      value={profileFields.address}
                      onChangeText={(nextValue) => handleProfileFieldChange('address', nextValue)}
                    />
                    <TextInput
                      style={styles.profileInput}
                      placeholder="Website"
                      placeholderTextColor="#94A3B8"
                      value={profileFields.website}
                      onChangeText={(nextValue) => handleProfileFieldChange('website', nextValue)}
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={[styles.profileInput, styles.profileBioInput]}
                      placeholder="Bio"
                      placeholderTextColor="#94A3B8"
                      multiline
                      textAlignVertical="top"
                      value={profileFields.bio}
                      onChangeText={(nextValue) => handleProfileFieldChange('bio', nextValue)}
                    />
                    <TextInput
                      style={[styles.profileInput, styles.profileSocialInput]}
                      placeholder="Social links (one per line)"
                      placeholderTextColor="#94A3B8"
                      multiline
                      textAlignVertical="top"
                      autoCapitalize="none"
                      value={profileFields.socialLinks}
                      onChangeText={(nextValue) => handleProfileFieldChange('socialLinks', nextValue)}
                    />
                    <Text style={styles.profileHint}>
                      Add links like Instagram, LinkedIn, or X. One link per line.
                    </Text>
                  </View>
                ) : (
                  <>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter URL, text, contact info, or anything"
                      placeholderTextColor="#94A3B8"
                      multiline
                      value={value}
                      onChangeText={(nextValue) => {
                        setRenderError('');
                        setValue(nextValue);
                      }}
                      textAlignVertical="top"
                      maxLength={2200}
                      returnKeyType="done"
                      blurOnSubmit
                      onSubmitEditing={() => {
                        Keyboard.dismiss();
                        persistGeneratedQr();
                      }}
                    />

                    <View style={styles.templateRow}>
                      {TEMPLATE_VALUES.map((template) => (
                        <TouchableOpacity
                          key={template.label}
                          style={styles.templateChip}
                          activeOpacity={0.88}
                          onPress={() => setValue(template.value)}
                        >
                          <Text style={styles.templateChipText}>{template.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <View style={styles.charRow}>
                  <Text style={styles.charInfo}>{activeQrValue.length}/1800 recommended</Text>
                </View>
              </View>

              <View style={styles.previewCard}>
                <Text style={styles.sectionTitle}>Preview</Text>
                {isProfileMode ? (
                  <View style={styles.profilePreviewCard}>
                    <View style={styles.profilePreviewAvatarWrap}>
                      {profileImageUri && !isProfileImageFailed ? (
                        <Image
                          source={{ uri: profileImageUri }}
                          style={styles.profilePreviewAvatar}
                          onError={() => setIsProfileImageFailed(true)}
                        />
                      ) : (
                        <View style={styles.profilePreviewPlaceholder}>
                          <Feather name="user" size={20} color="#64748B" />
                        </View>
                      )}
                    </View>
                    <View style={styles.profilePreviewTextWrap}>
                      <Text style={styles.profilePreviewName}>
                        {profileFields.name || 'Detail QR'}
                      </Text>
                      <Text style={styles.profilePreviewSub}>
                        {profileFields.email || profileFields.phone || 'No contact info added yet'}
                      </Text>
                    </View>
                  </View>
                ) : null}
                {isPreviewReady ? (
                  <CodePreviewCard
                    ref={previewRef}
                    type="qr"
                    value={activeQrValue}
                    qrForegroundColor={fgColor}
                    qrBackgroundColor={bgColor}
                    showMeta={false}
                    placeholderText="QR preview appears here"
                    onError={() => setRenderError('Could not render QR for this value.')}
                    logoConfig={activeLogoConfig}
                  />
                ) : (
                  <View style={styles.previewBootWrap}>
                    <Text style={styles.previewBootText}>Preparing QR preview...</Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.statusText,
                    (!canGenerate || renderError) && styles.statusErrorText,
                  ]}
                >
                  {statusMessage}
                </Text>

                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={handleAddLogo}
                  activeOpacity={0.88}
                  disabled={!canGenerate}
                >
                  <Feather name="plus-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.smallButtonText}>Add Logo</Text>
                </TouchableOpacity>

                <ActionButtons
                  loadingAction={loadingAction}
                  disabled={!canGenerate}
                  onShare={handleShare}
                  onSaveImage={handleSaveImage}
                />
              </View>

              <View style={styles.colorCard}>
                <View style={styles.pickerGroup}>
                  <Text style={styles.pickerLabel}>Foreground</Text>
                  <View style={styles.colorRow}>
                    {QR_COLOR_OPTIONS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorDot,
                          { backgroundColor: color },
                          fgColor === color && styles.activeColorDot,
                        ]}
                        onPress={() => setFgColor(color)}
                        activeOpacity={0.85}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.pickerGroup}>
                  <Text style={styles.pickerLabel}>Background</Text>
                  <View style={styles.colorRow}>
                    {BG_COLOR_OPTIONS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorDot,
                          { backgroundColor: color, borderColor: '#CBD5E1', borderWidth: 1 },
                          bgColor === color && styles.activeColorDot,
                        ]}
                        onPress={() => setBgColor(color)}
                        activeOpacity={0.85}
                      />
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.actionPanel}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleCopy}
                  activeOpacity={0.88}
                >
                  <Feather name="copy" size={16} color={palette.primary} />
                  <Text style={styles.secondaryButtonText}>Copy Value</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleClear}
                  activeOpacity={0.88}
                >
                  <Feather name="trash-2" size={16} color={palette.primary} />
                  <Text style={styles.secondaryButtonText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, !canGenerate && styles.primaryButtonDisabled]}
                  onPress={handleSaveToHistory}
                  activeOpacity={0.9}
                  disabled={!canGenerate}
                >
                  <Text style={styles.primaryButtonText}>Save to History</Text>
                </TouchableOpacity>
              </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    backgroundColor: palette.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 34,
  },
  inputCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadows.card,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dismissKeyboardChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#E8EEF8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dismissKeyboardText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#334155',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modeChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#EDF2F7',
  },
  modeChipActive: {
    backgroundColor: '#DBEAFE',
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  modeChipTextActive: {
    color: palette.primary,
  },
  profileImageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#D8E1F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },
  profileAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageActions: {
    marginLeft: 12,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  profileImageButton: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D9E2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  profileImageButtonText: {
    marginLeft: 6,
    fontSize: 12,
    color: palette.primary,
    fontWeight: '700',
  },
  textInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: palette.text,
    lineHeight: 22,
    backgroundColor: '#F8FAFC',
  },
  profileInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: palette.text,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  profileBioInput: {
    minHeight: 74,
  },
  profileSocialInput: {
    minHeight: 82,
  },
  profileHint: {
    marginTop: 2,
    fontSize: 12,
    color: palette.textMuted,
    fontWeight: '600',
  },
  charRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  charInfo: {
    fontSize: 12,
    color: palette.textMuted,
    fontWeight: '600',
  },
  templateRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  templateChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
  },
  templateChipText: {
    fontSize: 12,
    color: palette.primary,
    fontWeight: '700',
  },
  previewCard: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadows.card,
  },
  profilePreviewCard: {
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePreviewAvatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#EEF2F7',
    marginRight: 10,
  },
  profilePreviewAvatar: {
    width: '100%',
    height: '100%',
  },
  profilePreviewPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePreviewTextWrap: {
    flex: 1,
  },
  profilePreviewName: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.text,
  },
  profilePreviewSub: {
    marginTop: 3,
    fontSize: 12,
    color: palette.textMuted,
    fontWeight: '500',
  },
  previewBootWrap: {
    minHeight: 210,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  previewBootText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  statusText: {
    marginTop: 10,
    fontSize: 13,
    color: palette.success,
    fontWeight: '600',
  },
  smallButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  smallButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusErrorText: {
    color: palette.warning,
  },
  colorCard: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadows.card,
  },
  pickerGroup: {
    marginBottom: 14,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.textMuted,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  activeColorDot: {
    borderWidth: 3,
    borderColor: palette.primary,
  },
  actionPanel: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 14,
    ...shadows.card,
  },
  secondaryButton: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9E2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  secondaryButtonText: {
    marginLeft: 8,
    color: palette.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
