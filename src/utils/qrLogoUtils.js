/**
 * QR Code Logo Utilities
 * Handles logo preparation, scaling, and embedding logic
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

/**
 * Request media library permission if needed.
 * @returns {Promise<boolean>} - True if permission granted.
 */
export async function requestMediaLibraryPermissionIfNeeded() {
  try {
    const permissionStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (permissionStatus.status === 'granted') {
      return true;
    }

    const requestResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return requestResult.status === 'granted';
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
}

/**
 * Validates if a file is a valid image
 * @param {string} uri - File URI
 * @returns {Promise<boolean>} - True if valid image
 */
export async function validateImageFile(uri) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      return false;
    }

    // Check if it's likely an image based on file size (>1KB, <50MB)
    const fileSizeInMb = fileInfo.size / (1024 * 1024);
    return fileSizeInMb > 0.01 && fileSizeInMb < 50;
  } catch (error) {
    console.error('Error validating image file:', error);
    return false;
  }
}

/**
 * Requests media library permission and picks an image
 * @returns {Promise<object>} - Image picker result with uri and dimensions, or null if cancelled/failed
 */
export async function pickImageFromGallery() {
  try {
    const permissionGranted = await requestMediaLibraryPermissionIfNeeded();
    if (!permissionGranted) {
      console.warn('Media library permission not granted.');
      return { error: 'permission_denied' };
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      selectionLimit: 1,
    });

    if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
      console.log('Image picker canceled or no assets selected. Nothing to do.');
      return { error: 'picker_canceled' };
    }

    const asset = pickerResult.assets[0];
    if (!asset || !asset.uri) {
      console.error('Selected asset is invalid or missing URI:', asset);
      return { error: 'invalid_asset' };
    }

    console.log('Image selected from gallery (no crop):', asset.uri);

    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: asset.type,
    };
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
}

/**
 * Calculates optimal logo size based on QR code size
 * Logo should be approximately 20-30% of QR code size
 * @param {number} qrCodeSize - Size of QR code in pixels
 * @param {number} logoPercentage - Logo size as percentage of QR code (default 25%)
 * @returns {number} - Optimal logo size in pixels
 */
export function calculateOptimalLogoSize(qrCodeSize, logoPercentage = 25) {
  return Math.round((qrCodeSize * logoPercentage) / 100);
}

/**
 * Creates logo configuration object after validation
 * @param {string} uri - Image URI
 * @param {number} qrCodeSize - QR code size
 * @param {object} dimensions - Image dimensions {width, height}
 * @returns {object} - Logo configuration
 */
export function createLogoConfig(uri, qrCodeSize, dimensions = {}) {
  const logoSize = calculateOptimalLogoSize(qrCodeSize);

  return {
    uri,
    size: logoSize,
    x: (qrCodeSize - logoSize) / 2, // Center horizontally
    y: (qrCodeSize - logoSize) / 2, // Center vertically
    width: logoSize,
    height: logoSize,
    borderRadius: logoSize / 2, // Circular logo
    originalDimensions: dimensions,
  };
}

/**
 * Validates logo configuration
 * @param {object} logoConfig - Logo configuration object
 * @returns {boolean} - True if valid
 */
export function validateLogoConfig(logoConfig) {
  if (!logoConfig) {
    return false;
  }

  const required = ['uri', 'size', 'x', 'y', 'width', 'height'];
  return required.every((key) => logoConfig[key] !== undefined && logoConfig[key] !== null);
}

/**
 * Creates a white background for logo (to improve visibility on dark QR codes)
 * @param {number} size - Logo size
 * @param {number} padding - Padding around logo
 * @returns {object} - Background configuration
 */
export function createLogoBackground(size, padding = 3) {
  return {
    size: size + padding * 2,
    padding,
    color: '#FFFFFF',
    opacity: 1,
  };
}

/**
 * Estimates QR code error correction level needed based on logo size
 * Larger logos require higher error correction
 * @param {number} logoPercentage - Logo size as percentage of QR code
 * @returns {string} - Recommended error correction level ('L', 'M', 'Q', 'H')
 */
export function estimateRequiredErrorCorrectionLevel(logoPercentage = 25) {
  // Logo percentage to error correction mapping:
  // Small logos (10-15%): L or M is sufficient
  // Medium logos (15-25%): M or Q recommended
  // Large logos (25-30%): Q or H recommended
  if (logoPercentage <= 15) {
    return 'M'; // Medium error correction
  } else if (logoPercentage <= 25) {
    return 'Q'; // Quartile error correction
  } else {
    return 'H'; // High error correction
  }
}

/**
 * Formats logo data for QRCode component consumption
 * @param {string} uri - Logo image URI
 * @param {number} qrCodeSize - Size of QR code
 * @param {string} type - Logo type ('custom' or 'platform')
 * @returns {object} - Formatted logo object for rendering
 */
export function formatLogoForQR(uri, qrCodeSize, type = 'custom') {
  const logoSize = calculateOptimalLogoSize(qrCodeSize);
  const position = (qrCodeSize - logoSize) / 2;

  return {
    uri,
    width: logoSize,
    height: logoSize,
    x: position,
    y: position,
    type,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  };
}

/**
 * Gets logo size recommendations based on QR code size
 * @param {number} qrCodeSize - Size of QR code
 * @returns {object} - Size recommendations with min/max values
 */
export function getLogoSizeRecommendations(qrCodeSize) {
  const minSize = Math.round(qrCodeSize * 0.15); // 15% minimum
  const optimalSize = Math.round(qrCodeSize * 0.25); // 25% optimal
  const maxSize = Math.round(qrCodeSize * 0.35); // 35% maximum

  return {
    minimum: minSize,
    optimal: optimalSize,
    maximum: maxSize,
    current: optimalSize,
  };
}

/**
 * Creates SVG data URL for a simple circular logo
 * Useful as fallback when image loading fails
 * @param {number} size - Logo size
 * @param {string} initials - Text to display (e.g., 'IG' for Instagram)
 * @param {string} bgColor - Background color
 * @param {string} fgColor - Foreground/text color
 * @returns {string} - SVG data URL
 */
export function createSvgLogoDataUrl(size, initials, bgColor = '#4F46E5', fgColor = '#FFFFFF') {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .logo-bg { fill: ${bgColor}; }
          .logo-text { font-size: ${size * 0.5}px; font-weight: bold; fill: ${fgColor}; 
                       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; }
        </style>
      </defs>
      <circle class="logo-bg" cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/>
      <text class="logo-text" x="50%" y="50%" text-anchor="middle" 
            dominant-baseline="middle">${initials}</text>
    </svg>
  `;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Cleanup logo resources (delete temporary files if needed)
 * @param {object} logoConfig - Logo configuration to clean up
 */
export async function cleanupLogoResources(logoConfig) {
  if (!logoConfig || !logoConfig.uri) {
    return;
  }

  try {
    // Only delete if it's a temporary file from image picker
    if (logoConfig.uri.includes('tmp') || logoConfig.uri.includes('cache')) {
      await FileSystem.deleteAsync(logoConfig.uri, { idempotent: true });
    }
  } catch (error) {
    console.warn('Error cleaning up logo resources:', error);
  }
}

/**
 * Validates QR code scannability with logo
 * Provides warnings based on QR content size and logo size
 * @param {string} qrValue - QR code content
 * @param {number} logoPercentage - Logo size as percentage
 * @returns {object} - Validation result with warnings
 */
export function validateQrScannabilityWithLogo(qrValue, logoPercentage = 25) {
  const contentLength = qrValue.length;
  const warnings = [];
  let scannable = true;

  // Check content size
  if (contentLength > 1000) {
    warnings.push('Large content may reduce reliability with logo');
  }

  // Check logo size
  if (logoPercentage > 35) {
    warnings.push('Logo is larger than recommended (>35%)');
    scannable = false;
  }

  // Check content + logo combined impact
  if (contentLength > 800 && logoPercentage > 25) {
    warnings.push('Combination of large content and logo may reduce scannability');
  }

  return {
    scannable,
    warnings,
    recommendations: {
      maxLogoPercentage: logoPercentage > 35 ? 30 : 35,
      errorCorrectionLevel: estimateRequiredErrorCorrectionLevel(logoPercentage),
    },
  };
}
