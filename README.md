# LocalStorage Cache Helper 🔥

A lightweight LocalStorage caching solution with **compression & expiration** support.

## 🚀 Features

✅ Stores structured JSON with compression (LZ-String)  
✅ Supports cache expiration (hourly, daily, etc.)  
✅ Reduces LocalStorage clutter with a **nested storage structure**

## 📦 Installation

````sh
npm install localstorage-cache-helper

```javascript
import { createLocalStorageCache } from 'localstorage-cache-helper';

const cache = createLocalStorageCache({
  storageKey: 'AppCache',
  storeName: 'UserData',
  dataKey: 'sessionInfo',
  cacheExpiration: (lastUpdate) => olderToday(lastUpdate),
});

cache.saveCache({ user: 'Alice', role: 'admin' });

````
