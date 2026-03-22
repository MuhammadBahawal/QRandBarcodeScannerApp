import React from 'react';

import CodeScannerScreen from '../components/CodeScannerScreen';

export default function QRScannerScreen({ navigation }) {
  return <CodeScannerScreen navigation={navigation} mode="qr" />;
}
