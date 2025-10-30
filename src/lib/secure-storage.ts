// Безопасная система хранения токенов с шифрованием
// Работает как на localhost, так и в production

interface StorageOptions {
  encrypt?: boolean;
  ttl?: number; // время жизни в миллисекундах
}

class SecureStorage {
  private static instance: SecureStorage;
  private isClient = false;
  private encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'lead-schem-dev-key-2024';

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isClient = true;
    }
  }

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  // Простое шифрование (в production использовать более сложный алгоритм)
  private encrypt(text: string): string {
    if (!this.isClient) return text;
    
    try {
      // Простое XOR шифрование для демонстрации
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        );
      }
      return btoa(result); // Base64 encode
    } catch (error) {
      console.error('Encryption error:', error);
      return text;
    }
  }

  private decrypt(encryptedText: string): string {
    if (!this.isClient) return encryptedText;
    
    try {
      const text = atob(encryptedText); // Base64 decode
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        );
      }
      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText;
    }
  }

  // Безопасное сохранение с проверкой SSR
  setItem(key: string, value: unknown, options: StorageOptions = {}): boolean {
    if (!this.isClient) {
      console.warn('SecureStorage: Cannot access storage on server side');
      return false;
    }

    try {
      const { encrypt = true, ttl } = options;
      
      const data = {
        value: encrypt ? this.encrypt(JSON.stringify(value)) : value,
        timestamp: Date.now(),
        ttl: ttl || 7 * 24 * 60 * 60 * 1000, // 7 дней по умолчанию
        encrypted: encrypt
      };

      localStorage.setItem(`secure_${key}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('SecureStorage: Error setting item:', error);
      return false;
    }
  }

  // Безопасное получение с проверкой SSR и TTL
  getItem(key: string): unknown {
    if (!this.isClient) {
      return null;
    }

    try {
      const item = localStorage.getItem(`secure_${key}`);
      if (!item) return null;

      const data = JSON.parse(item);
      
      // Проверяем TTL
      if (Date.now() - data.timestamp > data.ttl) {
        this.removeItem(key);
        return null;
      }

      if (data.encrypted) {
        return JSON.parse(this.decrypt(data.value));
      }
      
      return data.value;
    } catch (error) {
      console.error('SecureStorage: Error getting item:', error);
      return null;
    }
  }

  // Безопасное удаление
  removeItem(key: string): boolean {
    if (!this.isClient) {
      return false;
    }

    try {
      localStorage.removeItem(`secure_${key}`);
      return true;
    } catch (error) {
      console.error('SecureStorage: Error removing item:', error);
      return false;
    }
  }

  // Очистка всех зашифрованных данных
  clear(): boolean {
    if (!this.isClient) {
      return false;
    }

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('secure_')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('SecureStorage: Error clearing storage:', error);
      return false;
    }
  }

  // Проверка доступности
  isAvailable(): boolean {
    return this.isClient;
  }
}

// Singleton instance
export const secureStorage = SecureStorage.getInstance();

// Специализированные методы для токенов
export const tokenStorage = {
  // Access token - без TTL, JWT сам управляет валидностью
  setAccessToken: (token: string) => 
    secureStorage.setItem('accessToken', token, { encrypt: true, ttl: 24 * 60 * 60 * 1000 }), // 24 часа (только для хранения)
  
  getAccessToken: () => 
    secureStorage.getItem('accessToken'),
  
  removeAccessToken: () => 
    secureStorage.removeItem('accessToken'),

  // Refresh token
  setRefreshToken: (token: string) => 
    secureStorage.setItem('refreshToken', token, { encrypt: true, ttl: 7 * 24 * 60 * 60 * 1000 }), // 7 дней
  
  getRefreshToken: () => 
    secureStorage.getItem('refreshToken'),
  
  removeRefreshToken: () => 
    secureStorage.removeItem('refreshToken'),

  // User data (менее критично, можно не шифровать)
  setUser: (user: unknown) => 
    secureStorage.setItem('user', user, { encrypt: false, ttl: 24 * 60 * 60 * 1000 }), // 24 часа
  
  getUser: () => 
    secureStorage.getItem('user'),
  
  removeUser: () => 
    secureStorage.removeItem('user'),

  // Очистка всех токенов
  clearAll: () => {
    secureStorage.removeItem('accessToken');
    secureStorage.removeItem('refreshToken');
    secureStorage.removeItem('user');
    return true;
  },

  // Проверка аутентификации
  isAuthenticated: () => {
    const token = secureStorage.getItem('accessToken');
    return !!token;
  }
};

export default secureStorage;
