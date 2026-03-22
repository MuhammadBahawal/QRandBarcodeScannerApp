import React from 'react';

import CodeScannerScreen from '../components/CodeScannerScreen';

export default function BarcodeScannerScreen({ navigation }) {
  return <CodeScannerScreen navigation={navigation} mode="barcode" />;
}
