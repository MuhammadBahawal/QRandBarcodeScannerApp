# Advanced QR Code Generation with Logo Customization

## Overview

This feature provides advanced QR code generation with intelligent logo customization capabilities for the Skanora mobile application. Users can create highly customizable QR codes with optional logos from their device gallery or automatically detected platform logos from social media URLs.

## Features

### 1. **Core QR Code Generation**
- Generate QR codes from URLs, text, contact info, and custom content
- Full color customization (foreground & background colors)
- Support for content up to 1800 characters
- Real-time QR code preview

### 2. **Manual Logo Upload**
- Upload custom logos from device gallery
- Image validation and processing
- Adjustable logo size (15-35% of QR code)
- Circular logo rendering with white background for visibility
- Logo removal functionality

### 3. **Platform Auto-Detection**
Automatically detects well-known social media platforms from URLs:
- **Instagram** - Photo sharing
- **Facebook** - Social network
- **TikTok** - Short-form video
- **Twitter/X** - Microblogging
- **YouTube** - Video sharing
- **LinkedIn** - Professional network
- **Pinterest** - Visual discovery
- **Snapchat** - Messaging and stories

### 4. **Smart Logo Management**
- Auto-logo application with toggle enable/disable
- Platform logos can be overridden by custom uploads
- Custom logos take priority over platform logos
- Error correction level automatically adjusted based on logo size
- Intelligent logo sizing to maintain QR code scannability

### 5. **Export & Sharing**
- Export QR code as PNG with logo embedded
- Share QR code image directly from the app
- Save QR code to device media library
- High-resolution output (maintained during capture)
- SVG export support (foundation)

## Architecture

### Directory Structure
```
src/
├── components/
│   ├── QRLogoCustomizer.jsx          # Manual logo upload UI
│   ├── PlatformLogoSelector.jsx      # Auto-detection UI
│   └── CodePreviewCard.jsx           # Enhanced with logo rendering
├── screens/
│   └── GenerateQRScreen.jsx          # Main QR generation screen
└── utils/
    ├── platformDetection.js          # Platform URL detection
    └── qrLogoUtils.js               # Logo processing utilities
```

### Key Components

#### 1. **QRLogoCustomizer Component**
Manages manual logo upload and customization.

```jsx
<QRLogoCustomizer
  onLogoSelected={(logoConfig) => setLogoConfig(logoConfig)}
  onLogoRemoved={() => setLogoConfig(null)}
  qrCodeSize={220}
  currentLogo={logoConfig}
/>
```

**Props:**
- `onLogoSelected` - Callback when logo is selected
- `onLogoRemoved` - Callback when logo is removed
- `qrCodeSize` - Size of QR code for calculations
- `currentLogo` - Current logo configuration

**Features:**
- Image picker integration
- Logo size adjustment (15%, 25%, 35%)
- Error correction level display
- Visual preview of selected logo

#### 2. **PlatformLogoSelector Component**
Handles platform detection and auto-logo insertion.

```jsx
<PlatformLogoSelector
  url={qrValue}
  onPlatformLogoSelected={(logoConfig) => setPlatformLogo(logoConfig)}
  onPlatformLogoRemoved={() => setPlatformLogo(null)}
  qrCodeSize={220}
/>
```

**Props:**
- `url` - URL to analyze for platform detection
- `onPlatformLogoSelected` - Callback when platform logo selected
- `onPlatformLogoRemoved` - Callback when removed
- `qrCodeSize` - Size of QR code

**Features:**
- Real-time URL analysis
- Visual detection feedback
- Selectable platform grid
- Auto-enable with toggle

#### 3. **Enhanced CodePreviewCard**
Extended to render logos on top of QR codes.

```jsx
<CodePreviewCard
  ref={previewRef}
  type="qr"
  value={qrValue}
  logoConfig={activeLogoConfig}
  qrForegroundColor={fgColor}
  qrBackgroundColor={bgColor}
/>
```

**New Props:**
- `logoConfig` - Logo configuration object with URI and positioning

**Logo Rendering:**
- Absolute positioned overlay
- White background circle for contrast
- Proper shadow for depth
- High z-index layering

### Utility Functions

#### platformDetection.js

**detectPlatformFromUrl(url)**
- Analyzes URL and returns platform identifier
- Supports 8 major social platforms
- Returns null if not detected

**getPlatformLogoData(platformId)**
- Returns platform information
- Includes color scheme and metadata

**analyzePlatformUrl(url)**
- Complete URL analysis
- Returns platform detection result with metadata

```javascript
const result = analyzePlatformUrl('https://www.instagram.com/username');
// Returns:
// {
//   detected: true,
//   platformId: 'instagram',
//   logoData: { name: 'Instagram', colors: {...} },
//   platformName: 'Instagram'
// }
```

#### qrLogoUtils.js

**calculateOptimalLogoSize(qrCodeSize, logoPercentage = 25)**
- Computes ideal logo size based on QR code dimensions
- Default 25% of QR code size

**createLogoConfig(uri, qrCodeSize, dimensions)**
- Creates logo configuration object
- Includes positioning (centered)
- Includes sizing information

**createSvgLogoDataUrl(size, initials, bgColor, fgColor)**
- Creates fallback SVG logo
- Useful if image loading fails

**formatLogoForQR(uri, qrCodeSize, type)**
- Formats logo data for QRCode component
- Includes border and positioning

**estimateRequiredErrorCorrectionLevel(logoPercentage)**
- Recommends error correction level based on logo size
- Small logos: 'M' (Medium)
- Medium logos: 'Q' (Quartile)
- Large logos: 'H' (High)

**validateQrScannabilityWithLogo(qrValue, logoPercentage)**
- Validates QR code scannability with logo
- Returns warnings and recommendations

```javascript
const validation = validateQrScannabilityWithLogo(
  'https://instagram.com/username',
  25
);
// Returns:
// {
//   scannable: true,
//   warnings: [],
//   recommendations: {
//     maxLogoPercentage: 35,
//     errorCorrectionLevel: 'Q'
//   }
// }
```

## Usage Guide

### Basic QR Generation with Custom Logo

1. **Enter QR Value**
   - Type URL, text, or any content
   - Content can be up to 1800 characters

2. **Add Logo**
   - Tap "Upload Logo from Gallery"
   - Select image from device
   - Adjust size using presets (Small/Medium/Large)

3. **Generate & Export**
   - Preview updates automatically
   - Tap "Share" to send QR code
   - Tap "Save Image" to store in media library

### Platform Auto-Detection

1. **Paste Social Media URL**
   - Example: `https://instagram.com/username`
   - Or: `https://www.tiktok.com/@username`

2. **Logo Auto-Applies**
   - Platform detected automatically
   - Logo applied with toggle switch
   - Can be disabled if needed

3. **Override with Custom Logo**
   - Upload custom logo anytime
   - Custom logo takes priority over platform logo
   - Both can coexist but custom is displayed

## Logo Configuration Object

```javascript
{
  uri: string,              // Image URI
  size: number,             // Logo size in pixels
  x: number,                // X position (centered)
  y: number,                // Y position (centered)
  width: number,            // Logo width
  height: number,           // Logo height
  borderRadius: number,     // For circular logo
  originalDimensions: {     // Original image dimensions
    width: number,
    height: number
  },
  platformId?: string,      // For platform logos
  platformName?: string,    // For platform logos
  platformColor?: string,   // Platform brand color
  type: 'custom' | 'platform'
}
```

## Best Practices

### Logo Selection
- **Size**: Keep between 15-35% of QR code size
- **Aspect Ratio**: Square images work best for circular logos
- **Contrast**: Use logos with good contrast against white background
- **Complexity**: Simpler logos maintain scannability better

### QR Code Content
- **URL Length**: Under 1000 characters recommended with logos
- **Error Correction**: Automatically adjusted based on logo size
- **Colors**: High contrast between foreground and background

### Mobile Responsiveness
- Logo size automatically scales with QR code
- Responsive preview adjusts to device width
- Touch targets are 44pt minimum per iOS guidelines

### Performance Considerations
- Images are validated before processing
- File size limits enforced (1KB - 50MB)
- Memory-efficient image handling
- Lazy loading for preview preparation

## Error Handling

```javascript
// Image validation
try {
  const pickedImage = await pickImageFromGallery();
  const isValid = await validateImageFile(pickedImage.uri);
  
  if (!isValid) {
    Alert.alert('Invalid Image', 'Please select a valid image file.');
    return;
  }
} catch (error) {
  Alert.alert('Error', 'Failed to pick image. Please try again.');
}

// QR code generation
if (canGenerate) {
  // Generate QR with logo
} else {
  Alert.alert('Cannot generate', 'Please enter valid content.');
}
```

## Platform Color Reference

```javascript
const PLATFORM_COLORS = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  tiktok: '#000000',
  twitter: '#000000',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
  pinterest: '#E60023',
  snapchat: '#FFFC00'
};
```

## Dependencies

- `expo-image-picker` - Image selection from gallery
- `expo-file-system` - File operations
- `expo-media-library` - Save to device storage
- `expo-sharing` - Share functionality
- `react-native-qrcode-svg` - QR code generation
- `react-native-view-shot` - Screen capture
- `@expo/vector-icons` - Platform icons

## Troubleshooting

### Logo Not Appearing
- Verify image URI is valid
- Check logo size (should be 15-35% of QR)
- Ensure sufficient error correction level

### QR Code Not Scannable
- Increase error correction level
- Reduce logo size
- Reduce content length
- Increase contrast between colors

### Image Picker Not Working
- Check gallery permissions
- Verify device has image picker support
- Try restarting the app

### Export/Save Issues
- Verify media library permissions
- Check available storage space
- Ensure file format support

## Future Enhancements

1. **Advanced Logo Features**
   - Custom logo styles (square, rounded, diamond)
   - Logo color overlay options
   - Multiple logos support
   - Logo rotation and perspective

2. **Additional Platforms**
   - WhatsApp, Telegram, Discord
   - Custom platform definitions
   - Dynamic brand logo integration

3. **Export Options**
   - SVG export with logo
   - PDF export
   - Batch QR code generation
   - Custom dimensions

4. **Analytics**
   - Track generated QR codes
   - Logo usage statistics
   - Platform popularity metrics

## Testing Checklist

- [ ] Manual logo upload functionality
- [ ] Platform detection accuracy
- [ ] Logo rendering at different sizes
- [ ] QR code scannability with logos
- [ ] Export and sharing functionality
- [ ] Error handling and validation
- [ ] Performance on various devices
- [ ] Memory management
- [ ] Responsive design

## Code Examples

### Complete QR Generation with Logo

```jsx
import React, { useState } from 'react';
import GenerateQRScreen from './screens/GenerateQRScreen';

export default function App() {
  const [qrValue, setQrValue] = useState('https://instagram.com/myprofile');
  const [logo, setLogo] = useState(null);

  return (
    <GenerateQRScreen
      value={qrValue}
      onValueChange={setQrValue}
      logoConfig={logo}
      onLogoChange={setLogo}
    />
  );
}
```

### Using Logo Utilities

```jsx
import {
  detectPlatformFromUrl,
  getPlatformLogoData,
} from './utils/platformDetection';
import {
  calculateOptimalLogoSize,
  createLogoConfig,
} from './utils/qrLogoUtils';

const url = 'https://www.tiktok.com/@username';
const platformId = detectPlatformFromUrl(url);
const logoData = getPlatformLogoData(platformId);

const logoSize = calculateOptimalLogoSize(220); // QR code size
const logoConfig = createLogoConfig(logoUri, 220, {
  width: 200,
  height: 200
});
```

## License

This feature is part of the Skanora QR & Barcode Scanner application.

## Support

For issues or feature requests, please contact the development team or refer to the project repository.
