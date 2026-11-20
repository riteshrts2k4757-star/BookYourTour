// LocalStorage persistence utility for demo state management

export function getStoredData<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(`sarthi_${key}`);
    return item ? JSON.parse(item) : defaultVal;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`sarthi_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export function resetAllDemoData(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sarthi_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  } catch (err) {
    console.error('Error resetting demo data:', err);
  }
}

