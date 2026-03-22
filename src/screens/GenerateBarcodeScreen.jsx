import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
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
import {
  BARCODE_FORMATS,
  sanitizeBarcodeInput,
  validateBarcodeValue,
} from '../constants/barcodeFormats';
import { palette, shadows } from '../constants/appTheme';
import { useAppData } from '../context/AppContext';
import useCodeExportActions from '../hooks/useCodeExportActions';

export default function GenerateBarcodeScreen({ navigation }) {
  const { addHistoryItem, settings } = useAppData();
  const [selectedFormat, setSelectedFormat] = useState(
    settings.defaultBarcodeFormat || BARCODE_FORMATS[0].key
  );
  const [value, setValue] = useState('');
  const [generatorError, setGeneratorError] = useState('');
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const previewRef = useRef(null);
  const { loadingAction, shareFromPreviewRef, saveFromPreviewRef } = useCodeExportActions();

  const trimmedValue = value.trim();
  const validation = useMemo(
    () => validateBarcodeValue(selectedFormat, trimmedValue),
    [selectedFormat, trimmedValue]
  );
  const canGenerate = validation.isValid;

  const persistGeneratedBarcode = () => {
    if (!canGenerate) {
      return null;
    }

    return addHistoryItem({
      source: 'generated',
      codeFamily: 'barcode',
      format: selectedFormat,
      value: trimmedValue,
    });
  };

  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
    setValue((current) => sanitizeBarcodeInput(format, current));
    setGeneratorError('');
  };

  const handleValueChange = (nextValue) => {
    setValue(sanitizeBarcodeInput(selectedFormat, nextValue));
    setGeneratorError('');
  };

  const handleCopy = async () => {
    if (!trimmedValue) {
      Alert.alert('No value', 'Please enter a barcode value first.');
      return;
    }

    await Clipboard.setStringAsync(trimmedValue);
    Alert.alert('Copied', 'Barcode value copied to clipboard.');
  };

  const handleSaveToHistory = () => {
    Keyboard.dismiss();

    if (!canGenerate) {
      Alert.alert('Invalid value', validation.error || 'Please check barcode value.');
      return;
    }

    const historyItem = persistGeneratedBarcode();

    if (!historyItem && !settings.saveHistory) {
      Alert.alert(
        'History disabled',
        'Turn on "Save history" in Settings if you want generated data stored.'
      );
      return;
    }

    Alert.alert('Saved', 'Barcode value has been added to history.');
  };

  const handleShare = async () => {
    Keyboard.dismiss();

    if (!canGenerate) {
      Alert.alert('Cannot share', validation.error || 'Please enter a valid value first.');
      return;
    }

    persistGeneratedBarcode();
    await shareFromPreviewRef(previewRef, 'Share barcode image');
  };

  const handleSaveImage = async () => {
    Keyboard.dismiss();

    if (!canGenerate) {
      Alert.alert('Cannot save image', validation.error || 'Please enter a valid value first.');
      return;
    }

    persistGeneratedBarcode();
    await saveFromPreviewRef(previewRef);
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
        <ScreenHeader
          title="Generate Barcode"
          onBack={() => navigation.goBack()}
          compactTop
        />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          >
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Barcode format</Text>

                <View style={styles.formatList}>
                  {BARCODE_FORMATS.map((format) => {
                    const isSelected = format.key === selectedFormat;

                    return (
                      <TouchableOpacity
                        key={format.key}
                        style={[styles.formatButton, isSelected && styles.formatButtonActive]}
                        onPress={() => handleFormatSelect(format.key)}
                        activeOpacity={0.88}
                      >
                        <Text
                          style={[styles.formatLabel, isSelected && styles.formatLabelActive]}
                        >
                          {format.label}
                        </Text>
                        <Text
                          style={[styles.formatHint, isSelected && styles.formatHintActive]}
                        >
                          {format.hint}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.inputHeader}>
                  <Text style={styles.sectionTitle}>Value</Text>
                  <TouchableOpacity
                    style={styles.dismissKeyboardChip}
                    activeOpacity={0.85}
                    onPress={Keyboard.dismiss}
                  >
                    <Feather name="chevron-down" size={14} color="#334155" />
                    <Text style={styles.dismissKeyboardText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Enter barcode value"
                  placeholderTextColor="#94A3B8"
                  value={value}
                  onChangeText={handleValueChange}
                  autoCapitalize={selectedFormat === 'CODE39' ? 'characters' : 'none'}
                  autoCorrect={false}
                  maxLength={90}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                    persistGeneratedBarcode();
                  }}
                />
                <Text
                  style={[
                    styles.validationText,
                    (validation.error || generatorError) && styles.validationError,
                  ]}
                >
                  {generatorError || validation.error || 'Ready to save or share.'}
                </Text>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Preview</Text>
                {isPreviewReady ? (
                  <CodePreviewCard
                    ref={previewRef}
                    type="barcode"
                    value={trimmedValue}
                    barcodeFormat={selectedFormat}
                    showMeta={false}
                    placeholderText="Enter a value to preview barcode"
                    onError={(error) => setGeneratorError(error?.message || 'Barcode error')}
                  />
                ) : (
                  <View style={styles.previewBootWrap}>
                    <Text style={styles.previewBootText}>Preparing barcode preview...</Text>
                  </View>
                )}

                <ActionButtons
                  loadingAction={loadingAction}
                  disabled={!canGenerate}
                  onShare={handleShare}
                  onSaveImage={handleSaveImage}
                />
              </View>

              <View style={styles.actionCard}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleCopy}
                  activeOpacity={0.88}
                >
                  <Feather name="copy" size={16} color={palette.primary} />
                  <Text style={styles.secondaryText}>Copy Value</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    Keyboard.dismiss();
                    setValue('');
                    setGeneratorError('');
                  }}
                  activeOpacity={0.88}
                >
                  <Feather name="trash-2" size={16} color={palette.primary} />
                  <Text style={styles.secondaryText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, !canGenerate && styles.primaryButtonDisabled]}
                  onPress={handleSaveToHistory}
                  activeOpacity={0.9}
                  disabled={!canGenerate}
                >
                  <Text style={styles.primaryText}>Save to History</Text>
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
    backgroundColor: palette.background,
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 34,
  },
  sectionCard: {
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text,
  },
  formatList: {
    marginTop: 10,
    gap: 10,
  },
  formatButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#F8FAFC',
  },
  formatButtonActive: {
    borderColor: '#A5B4FC',
    backgroundColor: '#EEF2FF',
  },
  formatLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.text,
  },
  formatLabelActive: {
    color: '#3730A3',
  },
  formatHint: {
    marginTop: 2,
    fontSize: 12,
    color: palette.textMuted,
    fontWeight: '500',
  },
  formatHintActive: {
    color: '#4F46E5',
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
  input: {
    borderWidth: 1,
    borderColor: '#D5DEEA',
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 14,
    fontSize: 15,
    color: palette.text,
    backgroundColor: '#F8FAFC',
  },
  validationText: {
    marginTop: 10,
    fontSize: 13,
    color: '#0F766E',
    fontWeight: '600',
  },
  validationError: {
    color: palette.warning,
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
  actionCard: {
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
  secondaryText: {
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
  primaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
