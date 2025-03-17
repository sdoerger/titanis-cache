import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTitanisCache } from "../src/index";
import dayjs from "dayjs";

// ✅ Clear Storage Before Each Test
beforeEach(() => {
  localStorage.clear();
});

// Helper function to simulate expiration
export function olderToday(lastUpdate: string | null | undefined): boolean {
  if (!lastUpdate) return false; // Guard against null/undefined

  const parsedDate = dayjs(lastUpdate); // Ensure correct format

  return parsedDate.isBefore(dayjs(), 'day'); // Checks if it's before today
}

describe("LocalStorage Cache Helper", () => {
  it("should save and load cached data", () => {
    const cache = createTitanisCache({
      storageKey: "TestStorage",
      storeName: "TestStore",
      dataKey: "testData",
      cacheExpiration: olderToday,
    });

    cache.saveCache({ message: "Hello, Cache!" });

    const loadedData = cache.loadCache();

    expect(loadedData).toEqual({ message: "Hello, Cache!" });
  });

  it("should return null if cache is expired", () => {
    const cache = createTitanisCache({
      storageKey: "TestStorage",
      storeName: "TestStore",
      dataKey: "testData",
      cacheExpiration: () => true, // Always expired
    });

    cache.saveCache({ message: "Old Cache" });

    expect(cache.loadCache()).toBeNull();
  });

  it("should remove a specific key from cache", () => {
    const cache = createTitanisCache({
      storageKey: "TestStorage",
      storeName: "TestStore",
      dataKey: "testData",
      cacheExpiration: olderToday,
    });

    cache.saveCache({ message: "Removable Data" });
    cache.removeKeyFromCache();

    expect(cache.loadCache()).toBeNull();
  });

  it("should clear the entire store from cache", () => {
    const cache1 = createTitanisCache({
      storageKey: "TestStorage",
      storeName: "Store1",
      dataKey: "key1",
      cacheExpiration: olderToday,
    });

    const cache2 = createTitanisCache({
      storageKey: "TestStorage",
      storeName: "Store2",
      dataKey: "key2",
      cacheExpiration: olderToday,
    });

    cache1.saveCache({ message: "Data 1" });
    cache2.saveCache({ message: "Data 2" });

    cache1.clearCache(); // Should remove only Store1

    expect(cache1.loadCache()).toBeNull();
    expect(cache2.loadCache()).not.toBeNull(); // Store2 should still exist
  });
});
