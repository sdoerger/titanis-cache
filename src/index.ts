import { compress, decompress } from "lz-string";

import dayjs from "dayjs";
import isEmpty from "just-is-empty";

export const isJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// Function to safely parse JSON
export const safeParseJson = (str: string | undefined | null): any | null => {
  if (!str) return null;
  if (isJsonString(str)) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error("Unexpected error during JSON parsing:", e);
      return null; // Fallback in case of an unexpected error
    }
  } else {
    console.warn("Invalid JSON string provided.");
    return null;
  }
};

function formatStorageData(
  storageData: any,
  storeName: string,
  dataKey: string,
  data: any
) {
  return JSON.stringify({
    ...storageData,
    [storeName]: {
      ...storageData[storeName], // Preserve other store data
      [dataKey]: {
        lastUpdate: dayjs().toISOString(),
        data: !isEmpty(data)
          ? compress(JSON.stringify(data))
          : storageData?.[storeName]?.[dataKey]?.data || {},
      },
    },
  });
}

interface StorageHelper<T> {
  loadCache: () => T | null;
  saveCache: (data: T) => void;
  removeKeyFromCache: () => void;
  clearCache: () => void;
}

interface LocalStorageCacheConfig {
  storageKey: string; // New Root Key for all store data
  storeName: string;
  dataKey: string;
  cacheExpiration: (lastUpdate: string | null | undefined) => boolean;
}

export function createLocalStorageCache<T>(
  config: LocalStorageCacheConfig
): StorageHelper<T> {
  
  function loadCache(): T | null {
    const storedData =
      safeParseJson(localStorage.getItem(config.storageKey)) || {}; // 🔥 Load from root storageKey
    const storeData = storedData[config.storeName] || {};

    if (!config.dataKey) return null;

    const lastUpdate = storeData[config.dataKey]?.lastUpdate;
    const isExpired = lastUpdate ? config.cacheExpiration(lastUpdate) : true;

    const storageIsEmpty = isEmpty(storeData?.[config.dataKey]?.data);

    if (!isExpired && !storageIsEmpty) {
      const decompressedData = decompress(storeData[config.dataKey].data);
      return safeParseJson(decompressedData) ?? null;
    }

    return null; // Expired or missing
  }

  function saveCache(data: T) {
    if (!config.storageKey) return;

    const existingData =
      safeParseJson(localStorage.getItem(config.storageKey)) || {};
    const formattedData = formatStorageData(
      existingData,
      config.storeName,
      config.dataKey,
      data
    );

    localStorage.setItem(config.storageKey, formattedData);
  }

  function removeKeyFromCache() {
    const existingData =
      safeParseJson(localStorage.getItem(config.storageKey)) || {};
    if (existingData[config.storeName]?.[config.dataKey]) {
      delete existingData[config.storeName][config.dataKey];

      localStorage.setItem(config.storageKey, JSON.stringify(existingData));
    }
  }

  function clearCache() {
    const existingData =
      safeParseJson(localStorage.getItem(config.storageKey)) || {};
    delete existingData[config.storeName];

    localStorage.setItem(config.storageKey, JSON.stringify(existingData));
  }

  return {
    loadCache,
    saveCache,
    removeKeyFromCache,
    clearCache,
  };
}
