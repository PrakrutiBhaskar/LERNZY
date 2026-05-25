import AsyncStorage from '@react-native-async-storage/async-storage';
import { getObject, setObject, getBoolean, setBoolean } from '../../src/utils/storage';

describe('Storage Utilities', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  interface UserProfile {
    name: string;
    age: number;
  }

  function isUserProfile(data: any): data is UserProfile {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.name === 'string' &&
      typeof data.age === 'number'
    );
  }

  it('should save and retrieve an object successfully', async () => {
    const profile: UserProfile = { name: 'Gopal', age: 8 };
    await setObject('user_profile', profile);

    const retrieved = await getObject<UserProfile>('user_profile');
    expect(retrieved).toEqual(profile);
  });

  it('should validate parsed object shape and return null if shape is invalid', async () => {
    // Save an invalid shape (age as string instead of number)
    await AsyncStorage.setItem('user_profile', JSON.stringify({ name: 'Gopal', age: 'eight' }));

    // Try retrieving with the validation guard
    const retrieved = await getObject<UserProfile>('user_profile', isUserProfile);
    expect(retrieved).toBeNull();
  });

  it('should validate parsed object shape and return data if shape is valid', async () => {
    const profile: UserProfile = { name: 'Gopal', age: 8 };
    await setObject('user_profile', profile);

    const retrieved = await getObject<UserProfile>('user_profile', isUserProfile);
    expect(retrieved).toEqual(profile);
  });

  it('should support boolean settings', async () => {
    await setBoolean('is_onboarded', true);
    expect(await getBoolean('is_onboarded')).toBe(true);

    await setBoolean('is_onboarded', false);
    expect(await getBoolean('is_onboarded')).toBe(false);
  });
});
