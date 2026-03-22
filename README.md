# QRandBarcodeScannerApp

A production-ready Expo React Native app for scanning and generating QR codes and barcodes with persistent history and settings.

## Features

- QR scanner with camera permission flow, torch toggle, duplicate-scan lock, and result actions
- Barcode scanner for common formats (`EAN13`, `EAN8`, `UPC`, `CODE128`, `CODE39`, `ITF14`, `CODABAR`)
- QR generator with live preview, templates, and color customization
- Barcode generator with format validation and live preview
- Persistent history with search, filters, copy/delete, and clear-all controls
- Persistent settings:
  - Save history
  - Haptic feedback on scan
  - Auto-open scanned links
  - Confirm before clearing history
  - Default barcode format
- Splash + onboarding flow with onboarding completion storage
- Works on Android, iOS, and Web

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React Navigation (native stack)
- `expo-camera` for scanning
- `react-native-qrcode-svg` for QR generation
- `@kichiyaki/react-native-barcode-generator` for barcode generation
- AsyncStorage for local persistence

## Run Locally

```bash
npm install
npm run start
```

Platform shortcuts:

```bash
npm run android
npm run ios
npm run web
```

## Validation Run

The project passes:

- `npx expo-doctor`
- `npx expo export --platform android`
- `npx expo export --platform web`
