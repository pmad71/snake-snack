// Sounds disabled in Snack version (audio files not supported)
class SoundManager {
  private musicEnabled = true;

  async initialize() {}

  async playEatSound() {}

  async playGameOverSound() {}

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
  }

  async startBackgroundMusic() {}

  async stopBackgroundMusic() {}

  async pauseBackgroundMusic() {}
}

export const soundManager = new SoundManager();
