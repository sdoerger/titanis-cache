import lzString from "lz-string";

function isEmpty(data: any): boolean {
  if (data == null) return true; // Handles null & undefined
  if (typeof data === 'string') return data.trim().length === 0;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === 'object') return Object.keys(data).length === 0;
  return false;
}

export const safeParseJson = (str: string | undefined | null): any | null => {
  if (typeof str !== "string" || !str.trim()) return null; // Handle null, undefined, and empty strings

  try {
    return JSON.parse(str);
  } catch (error) {
    console.error("❌ Failed to parse JSON:", error);
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
        lastUpdate: new Date().toISOString(),
        data: !isEmpty(data)
          ? lzString.compress(JSON.stringify(data))
          : storageData?.[storeName]?.[dataKey]?.data || {},
      },
    },
  });
}

export interface TitanisCache<T> {
  loadCache: () => T | null;
  saveCache: (data: T) => void;
  removeKeyFromCache: () => void;
  clearCache: () => void;
  loadOrFetch: (fetchFunc: () => Promise<T>) => Promise<T>
}

interface LocalStorageCacheConfig<T> {
  storageKey: string; // New Root Key for all store data
  storeName: string;
  dataKey: string;
  cacheExpiration: (lastUpdate: string | null | undefined) => boolean;
}

export function createTitanisCache<T>(
  config: LocalStorageCacheConfig<T>
): TitanisCache<T> {

  function loadCache(): T | null {
    const storedData =
      safeParseJson(localStorage.getItem(config.storageKey)) || {}; // 🔥 Load from root storageKey
    const storeData = storedData[config.storeName] || {};

    if (!config.dataKey) return null;

    const lastUpdate = storeData[config.dataKey]?.lastUpdate;
    const isExpired = lastUpdate ? config.cacheExpiration(lastUpdate) : true;

    const storageIsEmpty = isEmpty(storeData?.[config.dataKey]?.data);

    if (!isExpired && !storageIsEmpty) {
      const decompressedData = lzString.decompress(storeData[config.dataKey].data);
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

  async function loadOrFetch(fetchFunc: () => T | Promise<T>): Promise<T> {

    // === Load from Cache ===
    const cachedData = loadCache();
    if (cachedData) {
      return cachedData
    }

    // Get new data
    const data = await fetchFunc()

    // === Save Cache ===
    saveCache(data);

    return data
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
    loadOrFetch,
    removeKeyFromCache,
    clearCache,
  };
}
