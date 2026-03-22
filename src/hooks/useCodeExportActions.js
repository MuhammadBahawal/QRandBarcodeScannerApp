import { Alert, Linking } from 'react-native';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  captureCodeImage,
  getMediaLibraryPermissionState,
  requestMediaLibraryPermission,
  saveImageUriToLibrary,
  shareImageUri,
} from '../utils/exportUtils';

const STORAGE_KEYS = {
  mediaExplainerSeen: 'media_library_explainer_seen_v1',
};

export default function useCodeExportActions() {
  const [loadingAction, setLoadingAction] = useState(null);

  const hasSeenMediaExplainer = useCallback(async () => {
    try {
      const rawValue = await AsyncStorage.getItem(STORAGE_KEYS.mediaExplainerSeen);
      return rawValue === 'true';
    } catch (error) {
      return false;
    }
  }, []);

  const markMediaExplainerSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.mediaExplainerSeen, 'true');
    } catch (error) {
      // Intentionally ignored. Permission flow still works without persistence.
    }
  }, []);

  const askBeforePermissionRequest = useCallback(
    () =>
      new Promise((resolve) => {
        let settled = false;
        const finish = (value) => {
          if (settled) {
            return;
          }

          settled = true;
          resolve(value);
        };

        Alert.alert(
          'Allow Photo Access',
          'To save QR/Barcode images to your gallery, this app needs access to Photos/Media.',
          [
            { text: 'Not now', style: 'cancel', onPress: () => finish(false) },
            { text: 'Continue', onPress: () => finish(true) },
          ],
          {
            cancelable: true,
            onDismiss: () => finish(false),
          }
        );
      }),
    []
  );

  const showDeniedPermissionFeedback = useCallback(() => {
    Alert.alert(
      'Photo access required',
      'To save images, allow Photos/Media access from app settings.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings().catch(() => {
              Alert.alert(
                'Settings unavailable',
                'Open device settings manually and allow Photos/Media access for this app.'
              );
            });
          },
        },
      ]
    );
  }, []);

  const showPermissionEnvironmentFeedback = useCallback(() => {
    Alert.alert(
      'Permission unavailable',
      'Photo permission could not be requested in this environment. If you are using Expo Go, test in a development build for full permission behavior.'
    );
  }, []);

  const ensureMediaSavePermission = useCallback(async () => {
    const currentPermission = await getMediaLibraryPermissionState();

    if (currentPermission.granted) {
      return true;
    }

    if (currentPermission.status === 'denied') {
      showDeniedPermissionFeedback();
      return false;
    }

    if (currentPermission.status !== 'undetermined') {
      showDeniedPermissionFeedback();
      return false;
    }

    let shouldRequestSystemPermission = true;
    const alreadyExplained = await hasSeenMediaExplainer();

    if (!alreadyExplained) {
      shouldRequestSystemPermission = await askBeforePermissionRequest();
      await markMediaExplainerSeen();
    }

    if (!shouldRequestSystemPermission) {
      return false;
    }

    const requestedPermission = await requestMediaLibraryPermission();

    if (requestedPermission.granted) {
      return true;
    }

    if (requestedPermission.status === 'undetermined') {
      showPermissionEnvironmentFeedback();
      return false;
    }

    showDeniedPermissionFeedback();
    return false;
  }, [
    askBeforePermissionRequest,
    hasSeenMediaExplainer,
    markMediaExplainerSeen,
    showPermissionEnvironmentFeedback,
    showDeniedPermissionFeedback,
  ]);

  const shareFromPreviewRef = useCallback(async (previewRef, title = 'Share code image') => {
    try {
      setLoadingAction('share');
      const imageUri = await captureCodeImage(previewRef);
      await shareImageUri(imageUri, title);
    } catch (error) {
      Alert.alert('Share failed', error?.message || 'Unable to share this image right now.');
    } finally {
      setLoadingAction(null);
    }
  }, []);

  const saveFromPreviewRef = useCallback(async (previewRef) => {
    try {
      setLoadingAction('save');

      const hasPermission = await ensureMediaSavePermission();

      if (!hasPermission) {
        return;
      }

      const imageUri = await captureCodeImage(previewRef);
      await saveImageUriToLibrary(imageUri);
      Alert.alert('Saved', 'Image has been saved to your photo gallery.');
    } catch (error) {
      if (error?.code === 'permission_denied') {
        showDeniedPermissionFeedback();
      } else {
        Alert.alert('Save failed', error?.message || 'Unable to save image right now.');
      }
    } finally {
      setLoadingAction(null);
    }
  }, [ensureMediaSavePermission, showDeniedPermissionFeedback]);

  return {
    loadingAction,
    shareFromPreviewRef,
    saveFromPreviewRef,
  };
}
