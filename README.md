<p align="center">
  <a href="https://npmjs.com/package/titanis-cache" target="_blank" rel="noopener noreferrer">
    <img width="230" src="https://ik.imagekit.io/vrfrbvdn0j/sddev/Titanis_Cache_Box.svg?updatedAt=1742227335331" alt="Titanis Cache">
  </a>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/titanis-cache"><img src="https://badgen.net/npm/v/titanis-cache" alt="npm package"></a>
</p>
<br/>

# **Titanis Cache**  

A lightweight **LocalStorage caching solution** with built-in **compression & expiration**.  
Reduce API requests and improve performance by caching structured JSON in the browser.  

## 🚀 **Features**  
✅ **Efficient Storage:** Stores JSON data in **compressed format** (LZ-String)  
✅ **Flexible Expiration:** Supports **hourly, daily, or custom expiration** logic  
✅ **Organized Storage:** Uses **nested structure** to avoid LocalStorage clutter  

---

## 📦 **Installation**  
```sh
npm install titanis-cache
```

## Usage Example

```javascript
import { createTitanisCache } from 'titanis-cache';

// ✅ Define a cache instance
const animalData = createTitanisCache({
  storageKey: 'AppCache',  // 🔹 LocalStorage key where all cached data is stored
  storeName: 'AnimalData', // 🔹 Sub-key inside storageKey (groups related data)
  dataKey: 'sessionInfo',  // 🔹 The actual data & lastUpdate timestamp are stored here
  cacheExpiration: (lastUpdate) => olderToday(lastUpdate), // 🔹 Defines expiration logic
});

// ✅ Try to load data from cache
const cachedAnimalData = animalData.loadCache();

if (cachedAnimalData) {
  console.log("✅ Using cached data!", cachedAnimalData);
} else {
  console.log("⚠️ No valid cache, fetching new data...");

  // If no valid cache, fetch new data and save it
  const response = await fetch("https://api.publicapis.org/entries?category=Animals");
  const res = await response.json();

  animalData.saveCache(res); // ✅ Cache the fresh API response
}
```


## API Reference

### Cache Configuration
| Property	| Type	| Description |
| ---	| ---	| --- |
| storageKey |	string |	Top-level LocalStorage key. All data is stored inside this. |
| storeName |	string |	Sub-key inside storageKey to group related data. |
| dataKey |	string |	Holds the actual cached data & lastUpdate timestamp. |
| cacheExpiration |	(lastUpdate: string) => boolean	| Function that determines if cache is expired (based on lastUpdate). |


## Example: Custom Expiration Logic
You can customize cacheExpiration to set different expiration rules:

```javascript
const cache = createTitanisCache({
  storageKey: "AppCache",
  storeName: "WeatherData",
  dataKey: "forecast",
  cacheExpiration: (lastUpdate) => {
    return dayjs(lastUpdate).isBefore(dayjs().subtract(6, 'hours')); // 🔥 Expires after 6 hours
  }
});
```

## Clearing & Managing Cache

Remove a Specific Cached Key

```javascript
cache.removeKeyFromCache(); // 🔥 Deletes only the dataKey inside storeName
```

Clear an Entire Storage Group

```javascript
cache.clearCache(); // 🔥 Deletes all data stored under storageKey
```
