import { Audio } from 'expo-av';

class SoundManager {
  private backgroundMusic: Audio.Sound | null = null;
  private initialized = false;
  private musicEnabled = true;

  async initialize() {
    if (this.initialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.initialized = true;
    } catch {
      // Audio mode not available
    }
  }

  async playEatSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/eat.mp3'),
        { shouldPlay: true, volume: 0.6 }
      );
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {
      // Sound not available
    }
  }

  async playGameOverSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/gameover.mp3'),
        { shouldPlay: true, volume: 0.8 }
      );
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {
      // Sound not available
    }
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  async startBackgroundMusic() {
    // Background music disabled in Snack version (file too large)
  }

  async stopBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
      }
    } catch {
      // Ignore errors
    }
  }

  async pauseBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.pauseAsync();
      }
    } catch {
      // Ignore errors
    }
  }
}

export const soundManager = new SoundManager();
