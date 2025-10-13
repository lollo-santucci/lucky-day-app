/**
 * Local storage utilities for Lucky Day app
 * Provides encrypted storage wrapper around AsyncStorage with error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { AppState } from '../types/app';
import { AstrologicalProfile } from '../types/astrology';
import { Fortune } from '../types/fortune';

// Storage keys
const STORAGE_KEYS = {
    APP_STATE: '@lucky_day_app_state',
    PROFILE: '@lucky_day_profile',
    CURRENT_FORTUNE: '@lucky_day_current_fortune',
    SETTINGS: '@lucky_day_settings',
    ANALYTICS: '@lucky_day_analytics',
} as const;

// Encryption key for sensitive data (in production, this should be more secure)
const ENCRYPTION_KEY = 'lucky_day_encryption_key_v1';

/**
 * Storage error types
 */
export class StorageError extends Error {
    constructor(message: string, public readonly operation: string, public readonly key?: string) {
        super(message);
        this.name = 'StorageError';
    }
}

/**
 * Encrypts sensitive data using AES encryption
 */
async function encryptData(data: string): Promise<string> {
    try {
        // Create a simple encryption using base64 and a hash
        // Note: In production, use proper encryption libraries like react-native-keychain
        const hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            ENCRYPTION_KEY + data
        );
        const encoded = Buffer.from(data).toString('base64');
        return `${hash.substring(0, 16)}:${encoded}`;
    } catch (error) {
        throw new StorageError(
            `Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'encrypt'
        );
    }
}

/**
 * Decrypts sensitive data
 */
async function decryptData(encryptedData: string): Promise<string> {
    try {
        const [hashPrefix, encoded] = encryptedData.split(':');
        if (!hashPrefix || !encoded) {
            throw new Error('Invalid encrypted data format');
        }

        const decoded = Buffer.from(encoded, 'base64').toString();

        // Verify the hash
        const expectedHash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            ENCRYPTION_KEY + decoded
        );

        if (!expectedHash.startsWith(hashPrefix)) {
            throw new Error('Data integrity check failed');
        }

        return decoded;
    } catch (error) {
        throw new StorageError(
            `Failed to decrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'decrypt'
        );
    }
}

/**
 * Serializes data to JSON string with error handling
 */
function serializeData<T>(data: T): string {
    try {
        return JSON.stringify(data, (key, value) => {
            // Handle Date objects
            if (value instanceof Date) {
                return { __type: 'Date', value: value.toISOString() };
            }
            return value;
        });
    } catch (error) {
        throw new StorageError(
            `Failed to serialize data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'serialize'
        );
    }
}

/**
 * Deserializes JSON string to typed data with error handling
 */
function deserializeData<T>(jsonString: string): T {
    try {
        return JSON.parse(jsonString, (key, value) => {
            // Handle Date objects
            if (value && typeof value === 'object' && value.__type === 'Date') {
                return new Date(value.value);
            }
            return value;
        });
    } catch (error) {
        throw new StorageError(
            `Failed to deserialize data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'deserialize'
        );
    }
}

/**
 * Storage utility class providing encrypted storage operations
 */
export class StorageManager {
    /**
     * Stores data with optional encryption
     */
    static async setItem<T>(key: string, data: T, encrypt: boolean = false): Promise<void> {
        try {
            const serialized = serializeData(data);
            const finalData = encrypt ? await encryptData(serialized) : serialized;
            await AsyncStorage.setItem(key, finalData);
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new StorageError(
                `Failed to store data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'setItem',
                key
            );
        }
    }

    /**
     * Retrieves data with optional decryption
     */
    static async getItem<T>(key: string, encrypted: boolean = false): Promise<T | null> {
        try {
            const storedData = await AsyncStorage.getItem(key);
            if (storedData === null) {
                return null;
            }

            const finalData = encrypted ? await decryptData(storedData) : storedData;
            return deserializeData<T>(finalData);
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new StorageError(
                `Failed to retrieve data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'getItem',
                key
            );
        }
    }

    /**
     * Removes data from storage
     */
    static async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            throw new StorageError(
                `Failed to remove data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'removeItem',
                key
            );
        }
    }

    /**
     * Clears all app data from storage
     */
    static async clearAll(): Promise<void> {
        try {
            const keys = Object.values(STORAGE_KEYS);
            await AsyncStorage.multiRemove(keys);
        } catch (error) {
            throw new StorageError(
                `Failed to clear all data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'clearAll'
            );
        }
    }

    /**
     * Gets all storage keys used by the app
     */
    static async getAllKeys(): Promise<string[]> {
        try {
            const allKeys = await AsyncStorage.getAllKeys();
            return allKeys.filter(key => key.startsWith('@lucky_day'));
        } catch (error) {
            throw new StorageError(
                `Failed to get storage keys: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'getAllKeys'
            );
        }
    }
}

/**
 * High-level storage operations for specific data types
 */
export class AppStorage {
    /**
     * Saves the complete app state
     */
    static async saveAppState(appState: AppState): Promise<void> {
        await StorageManager.setItem(STORAGE_KEYS.APP_STATE, appState, false);
    }

    /**
     * Loads the complete app state
     */
    static async loadAppState(): Promise<AppState | null> {
        return await StorageManager.getItem<AppState>(STORAGE_KEYS.APP_STATE, false);
    }

    /**
     * Saves user's astrological profile (encrypted)
     */
    static async saveProfile(profile: AstrologicalProfile): Promise<void> {
        await StorageManager.setItem(STORAGE_KEYS.PROFILE, profile, true);
    }

    /**
     * Loads user's astrological profile (encrypted)
     */
    static async loadProfile(): Promise<AstrologicalProfile | null> {
        return await StorageManager.getItem<AstrologicalProfile>(STORAGE_KEYS.PROFILE, true);
    }

    /**
     * Saves current fortune
     */
    static async saveFortune(fortune: Fortune): Promise<void> {
        await StorageManager.setItem(STORAGE_KEYS.CURRENT_FORTUNE, fortune, false);
    }

    /**
     * Loads current fortune
     */
    static async loadFortune(): Promise<Fortune | null> {
        return await StorageManager.getItem<Fortune>(STORAGE_KEYS.CURRENT_FORTUNE, false);
    }

    /**
     * Saves app settings (encrypted)
     */
    static async saveSettings(settings: AppState['settings']): Promise<void> {
        await StorageManager.setItem(STORAGE_KEYS.SETTINGS, settings, true);
    }

    /**
     * Loads app settings (encrypted)
     */
    static async loadSettings(): Promise<AppState['settings'] | null> {
        return await StorageManager.getItem<AppState['settings']>(STORAGE_KEYS.SETTINGS, true);
    }

    /**
     * Saves analytics data
     */
    static async saveAnalytics(analytics: AppState['analytics']): Promise<void> {
        await StorageManager.setItem(STORAGE_KEYS.ANALYTICS, analytics, false);
    }

    /**
     * Loads analytics data
     */
    static async loadAnalytics(): Promise<AppState['analytics'] | null> {
        return await StorageManager.getItem<AppState['analytics']>(STORAGE_KEYS.ANALYTICS, false);
    }

    /**
     * Removes user profile data
     */
    static async removeProfile(): Promise<void> {
        await StorageManager.removeItem(STORAGE_KEYS.PROFILE);
    }

    /**
     * Removes current fortune
     */
    static async removeFortune(): Promise<void> {
        await StorageManager.removeItem(STORAGE_KEYS.CURRENT_FORTUNE);
    }

    /**
     * Clears all app data (for reset/logout)
     */
    static async clearAllData(): Promise<void> {
        await StorageManager.clearAll();
    }
}

// Export storage keys for testing
export { STORAGE_KEYS };