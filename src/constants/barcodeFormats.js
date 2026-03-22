export const BARCODE_FORMATS = [
  {
    key: 'CODE128',
    label: 'CODE 128',
    hint: 'General-purpose letters and numbers',
  },
  {
    key: 'CODE39',
    label: 'CODE 39',
    hint: 'Uppercase alphanumeric format',
  },
  {
    key: 'EAN13',
    label: 'EAN-13',
    hint: 'Exactly 13 digits',
  },
  {
    key: 'EAN8',
    label: 'EAN-8',
    hint: 'Exactly 8 digits',
  },
  {
    key: 'UPC',
    label: 'UPC',
    hint: 'Exactly 12 digits',
  },
];

const GENERATOR_FORMATS = new Set([
  'CODE39',
  'CODE128',
  'CODE128A',
  'CODE128B',
  'CODE128C',
  'EAN13',
  'EAN8',
  'EAN5',
  'EAN2',
  'UPC',
  'UPCE',
  'ITF14',
  'ITF',
  'MSI',
  'MSI10',
  'MSI11',
  'MSI1010',
  'MSI1110',
  'pharmacode',
  'codabar',
]);

const NUMERIC_ONLY_FORMATS = new Set(['EAN13', 'EAN8', 'UPC']);

const FORMAT_MAP = {
  EAN_13: 'EAN13',
  EAN13: 'EAN13',
  EAN_8: 'EAN8',
  EAN8: 'EAN8',
  UPC: 'UPC',
  UPC_A: 'UPC',
  UPCA: 'UPC',
  UPC_E: 'UPCE',
  UPCE: 'UPCE',
  CODE_128: 'CODE128',
  CODE128: 'CODE128',
  CODE_39: 'CODE39',
  CODE39: 'CODE39',
  ITF_14: 'ITF14',
  ITF14: 'ITF14',
  ITF: 'ITF',
  CODABAR: 'codabar',
};

export function getBarcodeFormatLabel(format) {
  const target = BARCODE_FORMATS.find((item) => item.key === format);
  return target?.label || format;
}

export function normalizeBarcodeFormat(rawFormat, fallbackFormat = 'CODE128') {
  const normalized = String(rawFormat || '').trim();

  if (!normalized) {
    return fallbackFormat;
  }

  const upperNormalized = normalized.toUpperCase();
  const mapped = FORMAT_MAP[upperNormalized] || normalized;

  if (GENERATOR_FORMATS.has(mapped)) {
    return mapped;
  }

  return fallbackFormat;
}

export function sanitizeBarcodeInput(format, input) {
  const value = String(input || '');

  if (NUMERIC_ONLY_FORMATS.has(format)) {
    return value.replace(/\D/g, '');
  }

  if (format === 'CODE39') {
    return value.toUpperCase();
  }

  return value;
}

export function validateBarcodeValue(format, input) {
  const value = String(input || '').trim();

  if (!value) {
    return { isValid: false, error: 'Please enter a value first.' };
  }

  if (format === 'EAN13') {
    if (!/^\d{13}$/.test(value)) {
      return { isValid: false, error: 'EAN-13 requires exactly 13 digits.' };
    }
  }

  if (format === 'EAN8') {
    if (!/^\d{8}$/.test(value)) {
      return { isValid: false, error: 'EAN-8 requires exactly 8 digits.' };
    }
  }

  if (format === 'UPC') {
    if (!/^\d{12}$/.test(value)) {
      return { isValid: false, error: 'UPC requires exactly 12 digits.' };
    }
  }

  if (format === 'CODE39') {
    if (!/^[0-9A-Z $/+%.-]+$/.test(value)) {
      return {
        isValid: false,
        error: 'CODE 39 only supports uppercase letters, numbers, and -.$/+% space',
      };
    }
  }

  if (value.length > 80) {
    return {
      isValid: false,
      error: 'This value is too long. Keep it under 80 characters.',
    };
  }

  return { isValid: true, error: '' };
}
