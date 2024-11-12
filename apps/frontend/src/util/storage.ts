// utils/storage.ts
export const storage = {
    get: <T>(key: string): T | null => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error(`Error getting ${key} from storage:`, error);
        return null;
      }
    },
    
    set: (key: string, value: unknown): void => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting ${key} in storage:`, error);
      }
    },
    
    remove: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing ${key} from storage:`, error);
      }
    }
  };