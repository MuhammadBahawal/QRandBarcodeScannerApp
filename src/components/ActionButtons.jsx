import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette } from '../constants/appTheme';

export default function ActionButtons({
  onShare,
  onSaveImage,
  loadingAction = null,
  disabled = false,
  style,
}) {
  const shareLoading = loadingAction === 'share';
  const saveLoading = loadingAction === 'save';
  const isDisabled = disabled || shareLoading || saveLoading;

  return (
    <View style={[styles.row, style]}>
      <TouchableOpacity
        style={[styles.button, styles.shareButton, isDisabled && styles.disabled]}
        activeOpacity={0.88}
        onPress={onShare}
        disabled={isDisabled}
      >
        {shareLoading ? (
          <ActivityIndicator size="small" color={palette.primary} />
        ) : (
          <>
            <Feather name="share-2" size={16} color={palette.primary} />
            <Text style={styles.buttonText}>Share</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.saveButton, isDisabled && styles.disabled]}
        activeOpacity={0.88}
        onPress={onSaveImage}
        disabled={isDisabled}
      >
        {saveLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <MaterialCommunityIcons name="content-save-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Image</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    height: 46,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  saveButton: {
    backgroundColor: palette.primary,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    color: palette.primary,
    fontWeight: '700',
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});

