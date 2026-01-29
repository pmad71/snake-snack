export interface Position {
  x: number;
  y: number;
}

export interface SnakeSegment extends Position {
  id: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type Screen = 'START' | 'GAME' | 'GAME_OVER' | 'HOW_TO_PLAY';

export type GameMode = 'CLASSIC' | 'INFINITE';
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface DifficultyConfig {
  name: string;
  initialSpeed: number;
  speedIncrement: number;
  minSpeed: number;
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  initialSpeed: number;
  speedIncrement: number;
  minSpeed: number;
}

// Power-ups
export type PowerUpType = 'SLOW' | 'DOUBLE_SCORE' | 'TRIM' | 'GHOST' | 'MAGNET' | 'SHIELD' | 'TURBO' | 'MULTI_FOOD';

export interface PowerUp extends Position {
  type: PowerUpType;
  spawnTime: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  endTime: number;
}

export interface PowerUpConfig {
  type: PowerUpType;
  duration: number;
  color: string;
  icon: string;
  name: string;
  chance: number;
}
