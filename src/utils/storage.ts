import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/game';

export const getHighScore = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.highScore);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error reading high score:', error);
    return 0;
  }
};

export const setHighScore = async (score: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.highScore, score.toString());
  } catch (error) {
    console.error('Error saving high score:', error);
  }
};

export const updateHighScoreIfNeeded = async (score: number): Promise<boolean> => {
  const currentHighScore = await getHighScore();
  if (score > currentHighScore) {
    await setHighScore(score);
    return true;
  }
  return false;
};

export const getMusicEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.musicEnabled);
    return value !== 'false';
  } catch (error) {
    return true;
  }
};

export const setMusicEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.musicEnabled, enabled.toString());
  } catch (error) {
    console.error('Error saving music setting:', error);
  }
};

export const getNickname = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.nickname);
  } catch (error) {
    console.error('Error reading nickname:', error);
    return null;
  }
};

export const setNickname = async (nickname: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.nickname, nickname);
  } catch (error) {
    console.error('Error saving nickname:', error);
  }
};

// Coins
export const getCoins = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.coins);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error reading coins:', error);
    return 0;
  }
};

export const setCoins = async (coins: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.coins, coins.toString());
  } catch (error) {
    console.error('Error saving coins:', error);
  }
};

export const addCoins = async (amount: number): Promise<number> => {
  const currentCoins = await getCoins();
  const newTotal = currentCoins + amount;
  await setCoins(newTotal);
  return newTotal;
};

// Skins
const DEFAULT_SKIN = 'neon_green';

export const getOwnedSkins = async (): Promise<string[]> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ownedSkins);
    if (value) {
      return JSON.parse(value);
    }
    return [DEFAULT_SKIN]; // Default skin is always owned
  } catch (error) {
    console.error('Error reading owned skins:', error);
    return [DEFAULT_SKIN];
  }
};

export const addOwnedSkin = async (skinId: string): Promise<void> => {
  try {
    const owned = await getOwnedSkins();
    if (!owned.includes(skinId)) {
      owned.push(skinId);
      await AsyncStorage.setItem(STORAGE_KEYS.ownedSkins, JSON.stringify(owned));
    }
  } catch (error) {
    console.error('Error adding owned skin:', error);
  }
};

export const getActiveSkin = async (): Promise<string> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.activeSkin);
    return value || DEFAULT_SKIN;
  } catch (error) {
    console.error('Error reading active skin:', error);
    return DEFAULT_SKIN;
  }
};

export const setActiveSkin = async (skinId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.activeSkin, skinId);
  } catch (error) {
    console.error('Error saving active skin:', error);
  }
};

export const buySkin = async (skinId: string, price: number): Promise<boolean> => {
  const coins = await getCoins();
  if (coins >= price) {
    await setCoins(coins - price);
    await addOwnedSkin(skinId);
    return true;
  }
  return false;
};
