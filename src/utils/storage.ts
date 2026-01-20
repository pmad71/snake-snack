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
