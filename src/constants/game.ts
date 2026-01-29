import { Dimensions } from 'react-native';
import { GameConfig, PowerUpConfig, DifficultyConfig, Difficulty } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CELL_SIZE = Math.floor(SCREEN_WIDTH / 13);
export const GRID_WIDTH = 12;
export const GRID_HEIGHT = 18;

export const GAME_CONFIG: GameConfig = {
  gridWidth: GRID_WIDTH,
  gridHeight: GRID_HEIGHT,
  cellSize: CELL_SIZE,
  initialSpeed: 250,
  speedIncrement: 2,
  minSpeed: 80,
};

export const COLORS = {
  background: '#0a0a0a',
  grid: 'rgba(0, 255, 136, 0.08)',
  gridBorder: 'rgba(0, 255, 136, 0.15)',

  snakeHead: '#00ff88',
  snakeTail: '#004422',
  snakeGlow: 'rgba(0, 255, 136, 0.5)',

  food: '#ff0066',
  foodGlow: 'rgba(255, 0, 102, 0.6)',

  particle: ['#00ff88', '#00ffcc', '#88ff00', '#ffff00', '#ff8800'],

  neonGreen: '#00ff88',
  neonPink: '#ff0066',
  neonBlue: '#00ccff',
  neonPurple: '#cc00ff',

  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.6)',

  buttonPrimary: '#00ff88',
  buttonSecondary: '#ff0066',
};

export const INITIAL_SNAKE = [
  { x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2), id: 0 },
  { x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) + 1, id: 1 },
  { x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) + 2, id: 2 },
];

export const STORAGE_KEYS = {
  highScore: '@snake_high_score',
  soundEnabled: '@snake_sound_enabled',
  musicEnabled: '@snake_music_enabled',
};

export const POWER_UPS: PowerUpConfig[] = [
  {
    type: 'SLOW',
    duration: 5000,
    color: '#00ccff',
    icon: '🐌',
    name: 'Spowolnienie',
    chance: 0.12,
  },
  {
    type: 'DOUBLE_SCORE',
    duration: 8000,
    color: '#ff66cc',
    icon: '💎',
    name: 'Podwójne pkt',
    chance: 0.12,
  },
  {
    type: 'TRIM',
    duration: 0,
    color: '#cc66ff',
    icon: '✂️',
    name: 'Skrócenie',
    chance: 0.12,
  },
  {
    type: 'GHOST',
    duration: 5000,
    color: '#aaaaff',
    icon: '👻',
    name: 'Duch',
    chance: 0.12,
  },
  {
    type: 'MAGNET',
    duration: 6000,
    color: '#ff5555',
    icon: '🧲',
    name: 'Magnes',
    chance: 0.10,
  },
  {
    type: 'SHIELD',
    duration: 5000,
    color: '#ffdd00',
    icon: '🛡️',
    name: 'Tarcza',
    chance: 0.22,
  },
  {
    type: 'TURBO',
    duration: 4000,
    color: '#ff8800',
    icon: '⚡',
    name: 'Turbo',
    chance: 0.10,
  },
  {
    type: 'MULTI_FOOD',
    duration: 8000,
    color: '#ffaa00',
    icon: '🍕',
    name: 'Multi-Food',
    chance: 0.10,
  },
];

export const POWER_UP_SPAWN_CHANCE = 0.25;
export const POWER_UP_LIFETIME = 10000;

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    name: 'Łatwy',
    initialSpeed: 350,
    speedIncrement: 1,
    minSpeed: 150,
  },
  NORMAL: {
    name: 'Normalny',
    initialSpeed: 250,
    speedIncrement: 2,
    minSpeed: 80,
  },
  HARD: {
    name: 'Trudny',
    initialSpeed: 150,
    speedIncrement: 3,
    minSpeed: 50,
  },
};
