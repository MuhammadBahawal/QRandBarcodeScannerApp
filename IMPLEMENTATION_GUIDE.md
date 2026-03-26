# QR Code Logo Feature - Implementation Guide

## Quick Start

### 1. Install Dependencies

The following packages have been added to `package.json`:
- `expo-image-picker` - Pick images from device gallery
- `expo-file-system` - File system operations

Run the following command to install:

```bash
npm install
# or
yarn install
```

After installation, you may need to rebuild the expo project:

```bash
expo prebuild --clean
```

### 2. File Structure

New files created:

```
src/
├── components/
│   ├── QRLogoCustomizer.jsx          # Manual logo upload component
│   ├── PlatformLogoSelector.jsx      # Auto-detection component
│   └── CodePreviewCard.jsx           # Updated with logo rendering
├── screens/
│   └── GenerateQRScreen.jsx          # Updated with logo features
└── utils/
    ├── platformDetection.js          # Platform URL detection
    └── qrLogoUtils.js               # Logo utility functions
```

### 3. Component Integration

The GenerateQRScreen has been updated to include:
- QRLogoCustomizer component
- PlatformLogoSelector component
- Enhanced CodePreviewCard with logo support
- Logo state management

## API Reference

### QRLogoCustomizer Component

```jsx
import QRLogoCustomizer from './components/QRLogoCustomizer';

<QRLogoCustomizer
  onLogoSelected={(logoConfig) => {}}
  onLogoRemoved={() => {}}
  qrCodeSize={220}
  currentLogo={null}
  style={{}}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onLogoSelected | Function | - | Callback when logo is selected with config |
| onLogoRemoved | Function | - | Callback when logo is removed |
| qrCodeSize | Number | 220 | QR code size for logo calculations |
| currentLogo | Object | null | Current logo configuration |
| style | Object | {} | Additional styles for container |

**Callback Data:**
```javascript
// onLogoSelected callback receives:
{
  uri: 'file://...',
  size: 55,
  x: 82.5,
  y: 82.5,
  width: 55,
  height: 55,
  borderRadius: 27.5,
  originalDimensions: {
    width: 1080,
    height: 1080
  }
}
```

### PlatformLogoSelector Component

```jsx
import PlatformLogoSelector from './components/PlatformLogoSelector';

<PlatformLogoSelector
  url="https://instagram.com/username"
  onPlatformLogoSelected={(logoConfig) => {}}
  onPlatformLogoRemoved={() => {}}
  qrCodeSize={220}
  enabled={true}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| url | String | '' | URL to detect platform from |
| onPlatformLogoSelected | Function | - | Callback when platform logo selected |
| onPlatformLogoRemoved | Function | - | Callback when removed |
| qrCodeSize | Number | 220 | QR code size |
| enabled | Boolean | true | Enable auto-detection on mount |
| style | Object | {} | Additional styles |

**Auto-Detection Result:**
```javascript
// Component detects and automatically applies logos from:
- Instagram: https://instagram.com/...
- Facebook: https://facebook.com/... or https://m.facebook.com/...
- TikTok: https://tiktok.com/... or https://vm.tiktok.com/...
- Twitter/X: https://twitter.com/... or https://x.com/...
- YouTube: https://youtube.com/... or https://youtu.be/...
- LinkedIn: https://linkedin.com/...
- Pinterest: https://pinterest.com/...
- Snapchat: https://snapchat.com/...
```

### CodePreviewCard Component Enhancement

```jsx
<CodePreviewCard
  ref={previewRef}
  type="qr"
  value={qrValue}
  logoConfig={logoConfig}
  qrForegroundColor="#111827"
  qrBackgroundColor="#FFFFFF"
  showMeta={false}
  placeholderText="QR preview"
  onError={(error) => console.error(error)}
/>
```

**New Prop:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| logoConfig | Object | null | Logo configuration object with URI and positioning |

**Logo Configuration Structure:**
```javascript
{
  uri: string,              // Image file URI
  size: number,             // Logo size in pixels
  x: number,                // X-coordinate (center)
  y: number,                // Y-coordinate (center)
  width: number,            // Logo width
  height: number,           // Logo height
  borderRadius: number,     // Border radius for circular shape
  originalDimensions: {
    width: number,
    height: number
  },
  platformId?: string,      // Optional platform identifier
  platformName?: string,    // Optional platform name
  platformColor?: string,   // Optional platform brand color
  type: 'custom' | 'platform'
}
```

## Utility Functions

### platformDetection Module

#### detectPlatformFromUrl(url: string): string | null

Detects social platform from URL.

```javascript
import { detectPlatformFromUrl } from './utils/platformDetection';

const platformId = detectPlatformFromUrl('https://instagram.com/myprofile');
// Returns: 'instagram'

const noMatch = detectPlatformFromUrl('https://google.com');
// Returns: null
```

#### getPlatformLogoData(platformId: string): Object | null

Retrieves platform metadata and colors.

```javascript
import { getPlatformLogoData } from './utils/platformDetection';

const logoData = getPlatformLogoData('instagram');
// Returns:
// {
//   name: 'Instagram',
//   colors: {
//     primary: '#E4405F',
//     secondary: '#405DE6'
//   }
// }
```

#### analyzePlatformUrl(url: string): Object

Complete platform analysis with metadata.

```javascript
import { analyzePlatformUrl } from './utils/platformDetection';

const analysis = analyzePlatformUrl('https://tiktok.com/@myprofile');
// Returns:
// {
//   detected: true,
//   platformId: 'tiktok',
//   logoData: { name: 'TikTok', colors: {...} },
//   platformName: 'TikTok'
// }
```

#### getAvailablePlatforms(): string[]

Returns list of supported platforms.

```javascript
import { getAvailablePlatforms } from './utils/platformDetection';

const platforms = getAvailablePlatforms();
// Returns: ['instagram', 'facebook', 'tiktok', 'twitter', 'youtube', 'linkedin', 'pinterest', 'snapchat']
```

### qrLogoUtils Module

#### pickImageFromGallery(): Promise<Object>

Opens image picker and returns selected image.

```javascript
import { pickImageFromGallery } from './utils/qrLogoUtils';

try {
  const result = await pickImageFromGallery();
  // Returns: { uri, width, height, type }
} catch (error) {
  console.error('Error picking image:', error);
}
```

#### validateImageFile(uri: string): Promise<boolean>

Validates if file is a valid image.

```javascript
import { validateImageFile } from './utils/qrLogoUtils';

const isValid = await validateImageFile(imageUri);
// Returns: true or false
```

#### calculateOptimalLogoSize(qrCodeSize: number, logoPercentage?: number): number

Calculates logo size based on QR code dimensions.

```javascript
import { calculateOptimalLogoSize } from './utils/qrLogoUtils';

const logoSize = calculateOptimalLogoSize(220, 25); // 25% of 220
// Returns: 55
```

#### createLogoConfig(uri: string, qrCodeSize: number, dimensions?: Object): Object

Creates complete logo configuration.

```javascript
import { createLogoConfig } from './utils/qrLogoUtils';

const logoConfig = createLogoConfig('file://...', 220, {
  width: 1080,
  height: 1080
});
```

#### estimateRequiredErrorCorrectionLevel(logoPercentage?: number): string

Recommends error correction level based on logo size.

```javascript
import { estimateRequiredErrorCorrectionLevel } from './utils/qrLogoUtils';

const level = estimateRequiredErrorCorrectionLevel(25);
// Returns: 'Q' (Quartile)
// 0-15%: 'M' (Medium)
// 15-25%: 'Q' (Quartile)
// 25%+: 'H' (High)
```

#### validateQrScannabilityWithLogo(qrValue: string, logoPercentage?: number): Object

Validates QR code scannability with logo.

```javascript
import { validateQrScannabilityWithLogo } from './utils/qrLogoUtils';

const validation = validateQrScannabilityWithLogo(
  'https://long.url.com/with/many/parameters',
  25
);
// Returns:
// {
//   scannable: true/false,
//   warnings: ['Large content may reduce reliability...'],
//   recommendations: {
//     maxLogoPercentage: 30,
//     errorCorrectionLevel: 'Q'
//   }
// }
```

#### formatLogoForQR(uri: string, qrCodeSize: number, type?: string): Object

Formats logo data for QR rendering.

```javascript
import { formatLogoForQR } from './utils/qrLogoUtils';

const formattedLogo = formatLogoForQR(imageUri, 220, 'custom');
// Returns formatted object ready for rendering
```

#### getLogoSizeRecommendations(qrCodeSize: number): Object

Gets recommended logo sizes.

```javascript
import { getLogoSizeRecommendations } from './utils/qrLogoUtils';

const recommendations = getLogoSizeRecommendations(220);
// Returns:
// {
//   minimum: 33,
//   optimal: 55,
//   maximum: 77,
//   current: 55
// }
```

## State Management

### GenerateQRScreen State Variables

```javascript
const [value, setValue] = useState('');              // QR content
const [fgColor, setFgColor] = useState(...);          // Foreground color
const [bgColor, setBgColor] = useState(...);          // Background color
const [renderError, setRenderError] = useState('');   // Render errors
const [logoConfig, setLogoConfig] = useState(null);   // Custom logo
const [platformLogo, setPlatformLogo] = useState(null); // Auto-detected logo

// Computed: Which logo to use (custom takes priority)
const activeLogoConfig = logoConfig || platformLogo;
```

## Styling Reference

### QRLogoCustomizer Styles
- `uploadButton` - Dashed border upload area
- `logoPreview` - Logo preview container
- `sizePreset` - Size selection buttons
- `removeButton` - Delete logo button

### PlatformLogoSelector Styles
- `detectedPlatformCard` - Platform detection card
- `platformGrid` - Grid of available platforms
- `platformGridItem` - Individual platform button
- `autoAppliedBadge` - Auto-applied notification

### CodePreviewCard Logo Styles
- `logoOverlayContainer` - Logo container overlay
- `logoBackground` - White background circle
- `logoImage` - Actual logo image

## Permissions Required

The feature requires the following permissions:

**Android:**
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

**iOS:**
```xml
<!-- Info.plist -->
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos to upload logos for your QR codes</string>
```

These are handled automatically by expo-image-picker and expo-media-library.

## Performance Optimization

### Image Optimization
- Maximum file size: 50MB
- Minimum file size: 1KB
- Supported formats: JPEG, PNG, GIF, WebP
- Aspect ratio: Square images recommended

### Memory Management
- Images are validated before processing
- Temporary files cleaned up after use
- Efficient re-rendering with React.useMemo

### Render Performance
- Logo rendering uses absolute positioning
- ViewShot optimization for fast captures
- Lazy loading of preview component

## Troubleshooting

### Common Issues

**Issue: "Cannot pick image" error**
```javascript
// Solution: Check permissions
import * as ImagePicker from 'expo-image-picker';

const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
if (status !== 'granted') {
  // Request permission or show error
}
```

**Issue: Logo not rendering**
```javascript
// Verify logo config has required fields
const requiredFields = ['uri', 'size', 'x', 'y', 'width', 'height'];
const isValid = requiredFields.every(
  field => logoConfig[field] !== undefined
);
```

**Issue: QR code not scannable**
```javascript
// Use validation function
const validation = validateQrScannabilityWithLogo(qrValue, logoSize);
if (!validation.scannable) {
  // Show warnings and recommendations
  console.warn(validation.warnings);
}
```

## Development Workflow

### Adding a New Platform

1. **Update PLATFORM_LOGOS in platformDetection.js:**
```javascript
export const PLATFORM_LOGOS = {
  // ... existing platforms
  newplatform: {
    name: 'New Platform',
    colors: {
      primary: '#HEXCOLOR',
      secondary: '#HEXCOLOR2'
    }
  }
};
```

2. **Add detection pattern:**
```javascript
const PLATFORM_PATTERNS = {
  // ... existing patterns
  newplatform: [
    /^https?:\/\/(www\.)?newplatform\.com\//i,
    /newplatform\.com/i,
  ]
};
```

3. **Add icon mapping in PlatformLogoSelector:**
```javascript
const PLATFORM_ICONS = {
  // ... existing icons
  newplatform: 'icon-name', // From FontAwesome5
};
```

### Testing

```javascript
// Test platform detection
import { analyzePlatformUrl } from './utils/platformDetection';

const testUrls = [
  'https://instagram.com/user',
  'https://tiktok.com/@user',
  'https://example.com'
];

testUrls.forEach(url => {
  const result = analyzePlatformUrl(url);
  console.log(`${url} -> ${result.platformId}`);
});
```

## Integration Example

```jsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import GenerateQRScreen from './screens/GenerateQRScreen';

export default function QRGeneratorApp() {
  return (
    <View style={styles.container}>
      <GenerateQRScreen 
        navigation={{
          goBack: () => {}
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
```

## Next Steps

1. Test the feature on various devices
2. Verify permissions work correctly
3. Test platform auto-detection with real URLs
4. Optimize performance on slower devices
5. Add custom platform support
6. Implement logo caching for frequently used logos
7. Add analytics tracking for logo usage

## Support & Resources

- [Expo Image Picker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo File System Documentation](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [React Native QR Code SVG](https://github.com/awesomejerry/react-native-qrcode-svg)
- [expo-media-library Documentation](https://docs.expo.dev/versions/latest/sdk/media-library/)

## Version History

- **v1.0.0** - Initial implementation
  - Manual logo upload
  - Platform auto-detection
  - Logo customization
  - Export/sharing functionality
