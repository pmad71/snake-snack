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

export type Screen =
  | 'START'
  | 'GAME'
  | 'GAME_OVER'
  | 'HOW_TO_PLAY'
  | 'LEADERBOARD'
  | 'SHOP'
  | 'MULTIPLAYER_MENU'
  | 'MULTIPLAYER_LOBBY'
  | 'MULTIPLAYER_GAME'
  | 'MULTIPLAYER_RESULT';

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
  duration: number;      // ms (0 = natychmiastowy)
  color: string;
  icon: string;
  name: string;
  chance: number;        // szansa pojawienia się (0-1)
}

// Leaderboard
export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  mode: GameMode;
  difficulty: Difficulty;
  date: string;
}

// Multiplayer
export type MultiplayerState =
  | 'IDLE'
  | 'CONNECTING'
  | 'IN_QUEUE'
  | 'IN_LOBBY'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'GAME_OVER';

export interface MultiplayerPlayer {
  nickname: string;
  isYou?: boolean;
}

export interface MultiplayerSnakeSegment extends Position {
  id: string;
}

export interface MultiplayerSnake {
  nickname: string;
  segments: MultiplayerSnakeSegment[];
  alive: boolean;
  score: number;
  color: string;
  direction: Direction;
}

export interface MultiplayerGameState {
  snakes: MultiplayerSnake[];
  food: Position | null;
  powerUp: PowerUp | null;
  state: string;
}

export interface MultiplayerGameResult {
  winner: string | null;
  reason: string;
  scores: Array<{ nickname: string; score: number; alive: boolean }>;
}

// Skins
export interface SnakeSkin {
  id: string;
  name: string;
  price: number;
  colors: [string, string]; // [headColor, tailColor]
  description: string;
}
