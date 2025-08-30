// Storage cleanup utility for logout
export const clearAllStorageData = () => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear specific storage keys if needed
    const storageKeys = [
      'user-store',
      'quiz-store', 
      'qna-store',
      'quiz-qna-history-store',
      'current-affairs-history-store',
      'topic-history-store',
      'interview-store',
      'auth-token',
      'user-preferences',
      'theme-preference'
    ];
    
    // Remove specific keys from localStorage
    storageKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear IndexedDB if used
    if ('indexedDB' in window) {
      // Clear common IndexedDB databases
      const dbNames = ['user-data', 'app-cache', 'history-data'];
      dbNames.forEach(dbName => {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onerror = () => console.warn(`Failed to delete IndexedDB: ${dbName}`);
      });
    }
    
    // Clear cookies (if any app-specific cookies exist)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    console.log('All storage data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing storage data:', error);
    return false;
  }
};

// Clear specific store data
export const clearStoreData = (storeNames: string[]) => {
  try {
    storeNames.forEach(storeName => {
      localStorage.removeItem(storeName);
      sessionStorage.removeItem(storeName);
    });
    console.log('Specific store data cleared:', storeNames);
    return true;
  } catch (error) {
    console.error('Error clearing specific store data:', error);
    return false;
  }
};

// Clear browser cache (if supported)
export const clearBrowserCache = async () => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Browser cache cleared');
    }
  } catch (error) {
    console.error('Error clearing browser cache:', error);
  }
};

// Complete cleanup function
export const performCompleteCleanup = async () => {
  try {
    // Clear all storage
    clearAllStorageData();
    
    // Clear browser cache
    await clearBrowserCache();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    console.log('Complete cleanup performed successfully');
    return true;
  } catch (error) {
    console.error('Error during complete cleanup:', error);
    return false;
  }
};
