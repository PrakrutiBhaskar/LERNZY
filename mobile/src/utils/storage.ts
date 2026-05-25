import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Gets a string item from AsyncStorage.
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`AsyncStorage.getItem failed for key: ${key}`, error);
    return null;
  }
}

/**
 * Sets a string item in AsyncStorage.
 */
export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`AsyncStorage.setItem failed for key: ${key}`, error);
  }
}

/**
 * Removes an item from AsyncStorage.
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`AsyncStorage.removeItem failed for key: ${key}`, error);
  }
}

/**
 * Gets a boolean flag from AsyncStorage.
 */
export async function getBoolean(key: string, defaultValue: boolean = false): Promise<boolean> {
  const val = await getItem(key);
  if (val === null) return defaultValue;
  return val === 'true';
}

/**
 * Sets a boolean flag in AsyncStorage.
 */
export async function setBoolean(key: string, value: boolean): Promise<void> {
  await setItem(key, value ? 'true' : 'false');
}

/**
 * Gets and parses a JSON object from AsyncStorage.
 * Allows an optional type guard validation function to verify shape correctness at runtime.
 */
export async function getObject<T>(
  key: string,
  validate?: (data: any) => data is T
): Promise<T | null> {
  const val = await getItem(key);
  if (val === null) return null;
  try {
    const parsed = JSON.parse(val);
    if (validate) {
      if (validate(parsed)) {
        return parsed;
      } else {
        console.warn(`AsyncStorage validation failed for key: ${key}. Shape is incorrect.`);
        return null;
      }
    }
    return parsed as T;
  } catch (error) {
    console.error(`AsyncStorage parsing failed for key: ${key}`, error);
    return null;
  }
}

/**
 * Stringifies and saves a JSON object in AsyncStorage.
 */
export async function setObject(key: string, value: any): Promise<void> {
  try {
    const stringified = JSON.stringify(value);
    await setItem(key, stringified);
  } catch (error) {
    console.error(`AsyncStorage stringify failed for key: ${key}`, error);
  }
}
