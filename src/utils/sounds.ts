// Uproszczona wersja dla Snack (bez dźwięków)
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
