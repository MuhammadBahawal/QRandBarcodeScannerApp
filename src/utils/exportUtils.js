import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

const MEDIA_LIBRARY_GRANULAR_PERMISSIONS = ['photo'];

export async function captureCodeImage(previewRef) {
  const target = previewRef?.current;

  if (!target || typeof target.capture !== 'function') {
    throw new Error('Code preview is not ready yet.');
  }

  return target.capture({
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });
}

export async function shareImageUri(uri, dialogTitle = 'Share code image') {
  if (!uri) {
    throw new Error('No image available to share.');
  }

  const sharingAvailable = await Sharing.isAvailableAsync();

  if (sharingAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle,
      UTI: 'public.png',
    });
    return;
  }

  await Share.share({
    title: dialogTitle,
    message: uri,
  });
}

function normalizePermissionResponse(permission) {
  return {
    granted: Boolean(permission?.granted),
    canAskAgain: permission?.canAskAgain !== false,
    status: permission?.status || 'undetermined',
  };
}

export async function getMediaLibraryPermissionState() {
  const currentPermission = await MediaLibrary.getPermissionsAsync(
    false,
    MEDIA_LIBRARY_GRANULAR_PERMISSIONS
  );
  return normalizePermissionResponse(currentPermission);
}

export async function requestMediaLibraryPermission() {
  const requestedPermission = await MediaLibrary.requestPermissionsAsync(
    false,
    MEDIA_LIBRARY_GRANULAR_PERMISSIONS
  );
  return normalizePermissionResponse(requestedPermission);
}

export async function saveImageUriToLibrary(uri) {
  if (!uri) {
    throw new Error('No image available to save.');
  }

  const permissionState = await getMediaLibraryPermissionState();

  if (!permissionState.granted) {
    const permissionError = new Error(
      'Permission denied. Please allow photo access to save images.'
    );
    permissionError.code = 'permission_denied';
    permissionError.canAskAgain = permissionState.canAskAgain;
    throw permissionError;
  }

  await MediaLibrary.createAssetAsync(uri);
}
