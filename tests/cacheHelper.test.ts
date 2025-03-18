import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTitanisCache } from "../src/index";

// ✅ Clear Storage Before Each Test
beforeEach(() => {
  localStorage.clear();
});

// Helper function to simulate expiration
function isBeforeToday(dateString: string | null | undefined): boolean {
  if(!dateString) return false
  const parsedDate = new Date(dateString); // Convert to Date object
  const today = new Date();

  // Set time to midnight to compare only the date part
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  return parsedDate < today; // ✅ Returns true if before today
}



describe("LocalStorage Cache Helper", () => {
  it("should manually save and load cached data", () => {
    const cache = createTitanisCache({
      storageKey: "TestStorage",
      storeName: "TestStore",
      dataKey: "testData",
      cacheExpiration: isBeforeToday,
    });

    cache.saveCache({ message: "Hello, Cache!" });

    const loadedData = cache.loadCache();

    expect(loadedData).toEqual({ message: "Hello, Cache!" });
  });

  it("should return cached data via loadOrFetch", async () => {
    const cache = createTitanisCache({
      storageKey: "TestStorage",
      storeName: "TestStore",
      dataKey: "testData",
      cacheExpiration: isBeforeToday,
    });

    // Mock cached data
    cache.saveCache({ message: "Hello, Cache!" });

    // Mock fetch function (should NOT be called if cache works)
    const fetchFunc = vi.fn().mockResolvedValue({ message: "New Data" });

    // Call loadOrFetch()
    const loadedData = await cache.loadOrFetch(fetchFunc);
    

    // Expect cached data to be returned
    expect(loadedData).toEqual({ message: "Hello, Cache!" });

    // Ensure fetch function was NEVER called (because cache existed)
    expect(fetchFunc).not.toHaveBeenCalled();
  });

  it("should return new data via loadOrFetch", async () => {
    const cache = createTitanisCache({
      storageKey: "TestStorage",
      storeName: "TestStore",
      dataKey: "testData",
      cacheExpiration: isBeforeToday,
    });

    // Mock fetch function (should NOT be called if cache works)
    const fetchFunc = vi.fn().mockResolvedValue({ message: "Hello fetched Data" });

    // Call loadOrFetch()
    const loadedData = await cache.loadOrFetch(fetchFunc);

    const loadedCachedData = cache.loadCache();
     
    // Expect cached data to be returned
    expect(loadedData).toEqual({ message: "Hello fetched Data" });

    // Ensure fetch function was NEVER called (because cache existed)
    expect(fetchFunc).toHaveBeenCalled();
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
      cacheExpiration: isBeforeToday,
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
      cacheExpiration: isBeforeToday,
    });

    const cache2 = createTitanisCache({
      storageKey: "TestStorage",
      storeName: "Store2",
      dataKey: "key2",
      cacheExpiration: isBeforeToday,
    });

    cache1.saveCache({ message: "Data 1" });
    cache2.saveCache({ message: "Data 2" });

    cache1.clearCache(); // Should remove only Store1

    expect(cache1.loadCache()).toBeNull();
    expect(cache2.loadCache()).not.toBeNull(); // Store2 should still exist
  });
});
