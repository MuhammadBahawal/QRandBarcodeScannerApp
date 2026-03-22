import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { BARCODE_FORMATS } from '../constants/barcodeFormats';
import { createId } from '../utils/appUtils';

const STORAGE_KEYS = {
  history: 'qr_barcode_history_v1',
  settings: 'qr_barcode_settings_v1',
};

const HISTORY_LIMIT = 300;

const defaultSettings = {
  saveHistory: true,
  hapticsOnScan: true,
  autoOpenLinks: false,
  confirmBeforeClearHistory: true,
  defaultBarcodeFormat: BARCODE_FORMATS[0].key,
};

const AppContext = createContext(null);

function parseJsonValue(rawValue, fallbackValue) {
  if (!rawValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return fallbackValue;
  }
}

function normalizeHistoryItem(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const value = String(item.value ?? item.content ?? '').trim();

  if (!value) {
    return null;
  }

  const codeFamily =
    item.codeFamily === 'barcode' || item.type === 'barcode'
      ? 'barcode'
      : 'qr';
  const source = item.source === 'scan' ? 'scan' : 'generated';
  const rawDate = String(item.createdAt || '').trim();
  const createdAt = Number.isNaN(new Date(rawDate).getTime())
    ? new Date().toISOString()
    : rawDate;

  return {
    id: typeof item.id === 'string' ? item.id : createId(),
    source,
    codeFamily,
    type: codeFamily,
    format:
      String(item.format || '').trim() ||
      (codeFamily === 'barcode' ? BARCODE_FORMATS[0].key : 'QR'),
    value,
    content: value,
    createdAt,
  };
}

function sortByLatest(items) {
  return [...items].sort(
    (first, second) => new Date(second.createdAt) - new Date(first.createdAt)
  );
}

function sanitizeHistory(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return sortByLatest(items.map(normalizeHistoryItem).filter(Boolean)).slice(
    0,
    HISTORY_LIMIT
  );
}

export function AppProvider({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    let isMounted = true;

    const hydrateState = async () => {
      try {
        const [rawHistory, rawSettings] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.history),
          AsyncStorage.getItem(STORAGE_KEYS.settings),
        ]);

        if (!isMounted) {
          return;
        }

        const parsedHistory = sanitizeHistory(parseJsonValue(rawHistory, []));
        const parsedSettings = parseJsonValue(rawSettings, {});

        setHistory(parsedHistory);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.warn('Failed to hydrate app state:', error);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    hydrateState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history)).catch(
      (error) => {
        console.warn('Failed to persist history:', error);
      }
    );
  }, [history, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings)).catch(
      (error) => {
        console.warn('Failed to persist settings:', error);
      }
    );
  }, [settings, isHydrated]);

  const addHistoryItem = useCallback(
    (input) => {
      const value = String(input?.value || '').trim();

      if (!value || !settings.saveHistory) {
        return null;
      }

      const historyItem = {
        id: createId(),
        source: input.source === 'generated' ? 'generated' : 'scan',
        codeFamily: input.codeFamily === 'barcode' ? 'barcode' : 'qr',
        type: input.codeFamily === 'barcode' ? 'barcode' : 'qr',
        format:
          String(input.format || '').trim() ||
          (input.codeFamily === 'barcode'
            ? settings.defaultBarcodeFormat
            : 'QR'),
        value,
        content: value,
        createdAt: new Date().toISOString(),
      };

      setHistory((previous) => {
        const latest = previous[0];

        // Prevent duplicate entries when user taps share/save quickly.
        if (
          latest &&
          latest.source === historyItem.source &&
          latest.codeFamily === historyItem.codeFamily &&
          latest.format === historyItem.format &&
          latest.value === historyItem.value
        ) {
          return previous;
        }

        return sortByLatest([historyItem, ...previous]).slice(0, HISTORY_LIMIT);
      });

      return historyItem;
    },
    [settings.defaultBarcodeFormat, settings.saveHistory]
  );

  const removeHistoryItem = useCallback((id) => {
    setHistory((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const updateSettings = useCallback((partialSettings) => {
    setSettings((previous) => ({
      ...previous,
      ...partialSettings,
    }));
  }, []);

  const insights = useMemo(() => {
    const today = new Date().toDateString();
    let scannedToday = 0;
    let generatedToday = 0;
    let qrCount = 0;
    let barcodeCount = 0;

    history.forEach((item) => {
      if (new Date(item.createdAt).toDateString() === today) {
        if (item.source === 'scan') {
          scannedToday += 1;
        } else {
          generatedToday += 1;
        }
      }

      if (item.codeFamily === 'qr') {
        qrCount += 1;
      } else {
        barcodeCount += 1;
      }
    });

    return {
      totalItems: history.length,
      scannedToday,
      generatedToday,
      qrCount,
      barcodeCount,
      latestItem: history[0] || null,
    };
  }, [history]);

  const contextValue = useMemo(
    () => ({
      isHydrated,
      history,
      settings,
      insights,
      addHistoryItem,
      removeHistoryItem,
      clearHistory,
      updateSettings,
    }),
    [
      addHistoryItem,
      clearHistory,
      history,
      insights,
      isHydrated,
      removeHistoryItem,
      settings,
      updateSettings,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppData must be used within AppProvider');
  }

  return context;
}
