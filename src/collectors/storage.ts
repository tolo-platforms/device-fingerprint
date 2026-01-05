/**
 * Detect available storage APIs
 */
export function collectStorageSignals() {
  return {
    sessionStorage: hasSessionStorage(),
    localStorage: hasLocalStorage(),
    indexedDB: hasIndexedDB(),
  };
}

function hasSessionStorage(): boolean {
  try {
    const key = "__tolo_test__";
    sessionStorage.setItem(key, key);
    sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function hasLocalStorage(): boolean {
  try {
    const key = "__tolo_test__";
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function hasIndexedDB(): boolean {
  try {
    return !!window.indexedDB;
  } catch {
    return false;
  }
}
