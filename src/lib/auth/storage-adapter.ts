import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';

const STORE_KEY = 'auth-storage-key';

const getEncryptionKey = () => {
  let key = SecureStore.getItem(STORE_KEY);
  if (!key) {
    key = Crypto.randomUUID();
    SecureStore.setItem(STORE_KEY, key);
  }
  return key;
};

export const storage = new MMKV({
  id: 'supabase-auth',
  encryptionKey: getEncryptionKey(),
});

export const supabaseStorageAdapter = {
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};
