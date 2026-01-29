import { useState, useCallback, useRef, useEffect } from 'react';
import { Direction, SnakeSegment, Position, GameState, Particle, PowerUp, ActivePowerUp, PowerUpType, GameMode, Difficulty } from '../types';
import { GAME_CONFIG, INITIAL_SNAKE, COLORS, POWER_UPS, POWER_UP_SPAWN_CHANCE, POWER_UP_LIFETIME, DIFFICULTIES } from '../constants/game';
import { lightVibration, gameOverVibration } from '../utils/haptics';
import { soundManager } from '../utils/sounds';
import { updateHighScoreIfNeeded } from '../utils/storage';

const getRandomPosition = (snake: SnakeSegment[], food?: Position, powerUp?: PowerUp | null): Position => {
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * GAME_CONFIG.gridWidth),
      y: Math.floor(Math.random() * GAME_CONFIG.gridHeight),
    };
  } while (
    snake.some((segment) => segment.x === position.x && segment.y === position.y) ||
    (food && food.x === position.x && food.y === position.y) ||
    (powerUp && powerUp.x === position.x && powerUp.y === position.y)
  );
  return position;
};

const getOppositeDirection = (dir: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[dir];
};

const getRandomPowerUpType = (): PowerUpType => {
  const rand = Math.random();
  let cumulative = 0;
  for (const pu of POWER_UPS) {
    cumulative += pu.chance;
    if (rand < cumulative) {
      return pu.type;
    }
  }
  return POWER_UPS[0].type;
};

interface UseGameLogicProps {
  mode?: GameMode;
  difficulty?: Difficulty;
  onShake?: (intensity?: number) => void;
}

export const useGameLogic = ({ mode = 'CLASSIC', difficulty = 'NORMAL', onShake }: UseGameLogicProps = {}) => {
  const difficultyConfig = DIFFICULTIES[difficulty];

  const [snake, setSnake] = useState<SnakeSegment[]>([...INITIAL_SNAKE]);
  const [food, setFood] = useState<Position>(() => getRandomPosition(INITIAL_SNAKE));
  const [direction, setDirection] = useState<Direction>('UP');
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(difficultyConfig.initialSpeed);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Power-ups state
  const [powerUp, setPowerUp] = useState<PowerUp | null>(null);
  const [activePowerUp, setActivePowerUp] = useState<ActivePowerUp | null>(null);

  // Multi-food state
  const [extraFoods, setExtraFoods] = useState<Position[]>([]);

  // Combo state
  const [combo, setCombo] = useState(1);
  const comboRef = useRef(1);
  const lastEatTimeRef = useRef(0);
  const COMBO_WINDOW = 3000;
  const MAX_COMBO = 4;

  const directionRef = useRef<Direction>(direction);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextDirectionRef = useRef<Direction | null>(null);
  const segmentIdRef = useRef(INITIAL_SNAKE.length);
  const baseSpeedRef = useRef(difficultyConfig.initialSpeed);
  const scoreMultiplierRef = useRef(1);
  const modeRef = useRef(mode);
  const difficultyRef = useRef(difficulty);
  const onShakeRef = useRef(onShake);

  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    if (!powerUp || gameState !== 'PLAYING') return;

    const checkExpiry = setInterval(() => {
      if (Date.now() - powerUp.spawnTime > POWER_UP_LIFETIME) {
        setPowerUp(null);
      }
    }, 500);

    return () => clearInterval(checkExpiry);
  }, [powerUp, gameState]);

  useEffect(() => {
    if (!activePowerUp || gameState !== 'PLAYING') return;

    const checkExpiry = setInterval(() => {
      if (Date.now() > activePowerUp.endTime) {
        if (activePowerUp.type === 'SLOW' || activePowerUp.type === 'TURBO') {
          setSpeed(baseSpeedRef.current);
        } else if (activePowerUp.type === 'DOUBLE_SCORE') {
          scoreMultiplierRef.current = 1;
        } else if (activePowerUp.type === 'MULTI_FOOD') {
          setExtraFoods([]);
        }
        setActivePowerUp(null);
      }
    }, 100);

    return () => clearInterval(checkExpiry);
  }, [activePowerUp, gameState]);

  const snakeRef = useRef(snake);
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    if (!activePowerUp || activePowerUp.type !== 'MAGNET' || gameState !== 'PLAYING') return;

    const magnetInterval = setInterval(() => {
      if (Date.now() > activePowerUp.endTime) return;

      const currentSnake = snakeRef.current;
      const head = currentSnake[0];

      setFood((currentFood) => {
        let newFoodX = currentFood.x;
        let newFoodY = currentFood.y;

        if (currentFood.x < head.x) newFoodX++;
        else if (currentFood.x > head.x) newFoodX--;

        if (currentFood.y < head.y) newFoodY++;
        else if (currentFood.y > head.y) newFoodY--;

        const overlapsSnake = currentSnake.some((seg, i) =>
          i > 0 && seg.x === newFoodX && seg.y === newFoodY
        );

        if (!overlapsSnake) {
          return { x: newFoodX, y: newFoodY };
        }
        return currentFood;
      });
    }, 300);

    return () => clearInterval(magnetInterval);
  }, [activePowerUp, gameState]);

  const spawnParticles = useCallback((position: Position, color?: string) => {
    const newParticles: Particle[] = [];
    const colors = color ? [color] : COLORS.particle;
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
      const velocity = 2 + Math.random() * 3;
      newParticles.push({
        id: Date.now() + i,
        x: position.x * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2,
        y: position.y * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;

    const animationFrame = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
            life: p.life - 0.03,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(animationFrame);
  }, [particles.length]);

  const applyPowerUp = useCallback((type: PowerUpType, currentSnake: SnakeSegment[], currentFood: Position) => {
    const config = POWER_UPS.find(p => p.type === type);
    if (!config) return currentSnake;

    lightVibration();
    onShakeRef.current?.(6);

    if (type === 'SLOW') {
      setSpeed(prev => {
        baseSpeedRef.current = prev;
        return prev * 2;
      });
      setActivePowerUp({
        type: 'SLOW',
        endTime: Date.now() + config.duration,
      });
    } else if (type === 'DOUBLE_SCORE') {
      scoreMultiplierRef.current = 2;
      setActivePowerUp({
        type: 'DOUBLE_SCORE',
        endTime: Date.now() + config.duration,
      });
    } else if (type === 'TRIM') {
      const trimAmount = Math.floor(currentSnake.length * 0.3);
      const minLength = 3;
      const newLength = Math.max(minLength, currentSnake.length - trimAmount);
      return currentSnake.slice(0, newLength);
    } else if (type === 'GHOST') {
      setActivePowerUp({
        type: 'GHOST',
        endTime: Date.now() + config.duration,
      });
    } else if (type === 'MAGNET') {
      setActivePowerUp({
        type: 'MAGNET',
        endTime: Date.now() + config.duration,
      });
    } else if (type === 'SHIELD') {
      setActivePowerUp({
        type: 'SHIELD',
        endTime: Date.now() + config.duration,
      });
    } else if (type === 'TURBO') {
      setSpeed(prev => {
        baseSpeedRef.current = prev;
        const config = DIFFICULTIES[difficultyRef.current];
        return Math.max(config.minSpeed, Math.floor(prev / 2));
      });
      setActivePowerUp({
        type: 'TURBO',
        endTime: Date.now() + config.duration,
      });
    } else if (type === 'MULTI_FOOD') {
      const newExtraFoods: Position[] = [];
      for (let i = 0; i < 4; i++) {
        const pos = getRandomPosition(currentSnake, currentFood, null);
        while (newExtraFoods.some(f => f.x === pos.x && f.y === pos.y)) {
          pos.x = Math.floor(Math.random() * GAME_CONFIG.gridWidth);
          pos.y = Math.floor(Math.random() * GAME_CONFIG.gridHeight);
        }
        newExtraFoods.push(pos);
      }
      setExtraFoods(newExtraFoods);
      setActivePowerUp({
        type: 'MULTI_FOOD',
        endTime: Date.now() + config.duration,
      });
    }

    return currentSnake;
  }, []);

  const trySpawnPowerUp = useCallback((currentSnake: SnakeSegment[], currentFood: Position) => {
    if (powerUp) return;

    if (Math.random() < POWER_UP_SPAWN_CHANCE) {
      const type = getRandomPowerUpType();
      const position = getRandomPosition(currentSnake, currentFood, null);
      setPowerUp({
        ...position,
        type,
        spawnTime: Date.now(),
      });
    }
  }, [powerUp]);

  const checkCollision = useCallback((head: Position, snakeBody: SnakeSegment[]): boolean => {
    if (
      head.x < 0 ||
      head.x >= GAME_CONFIG.gridWidth ||
      head.y < 0 ||
      head.y >= GAME_CONFIG.gridHeight
    ) {
      return true;
    }

    for (let i = 1; i < snakeBody.length; i++) {
      if (snakeBody[i].x === head.x && snakeBody[i].y === head.y) {
        return true;
      }
    }

    return false;
  }, []);

  const moveSnake = useCallback(() => {
    setSnake((currentSnake) => {
      if (nextDirectionRef.current) {
        directionRef.current = nextDirectionRef.current;
        nextDirectionRef.current = null;
      }

      const currentDirection = directionRef.current;
      const head = currentSnake[0];
      let newHead: Position;

      switch (currentDirection) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      const isGhostActive = activePowerUp?.type === 'GHOST' && Date.now() < activePowerUp.endTime;
      const isShieldActive = activePowerUp?.type === 'SHIELD' && Date.now() < activePowerUp.endTime;
      const isInfiniteMode = modeRef.current === 'INFINITE';

      if (isGhostActive || isShieldActive || isInfiniteMode) {
        if (newHead.x < 0) newHead.x = GAME_CONFIG.gridWidth - 1;
        if (newHead.x >= GAME_CONFIG.gridWidth) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GAME_CONFIG.gridHeight - 1;
        if (newHead.y >= GAME_CONFIG.gridHeight) newHead.y = 0;
      }

      let newSnake: SnakeSegment[] = [
        { ...newHead, id: segmentIdRef.current++ },
        ...currentSnake.slice(0, -1),
      ];

      const wallCollision = !isGhostActive && !isShieldActive && !isInfiniteMode && (
        newHead.x < 0 ||
        newHead.x >= GAME_CONFIG.gridWidth ||
        newHead.y < 0 ||
        newHead.y >= GAME_CONFIG.gridHeight
      );

      const selfCollision = !isShieldActive && currentSnake.some((segment, i) => i > 0 && segment.x === newHead.x && segment.y === newHead.y);

      if (wallCollision || selfCollision) {
        setGameState('GAME_OVER');
        gameOverVibration();
        soundManager.playGameOverSound();
        soundManager.stopBackgroundMusic();
        onShakeRef.current?.(12);

        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
          gameLoopRef.current = null;
        }

        return currentSnake;
      }

      setPowerUp((currentPowerUp) => {
        if (currentPowerUp && newHead.x === currentPowerUp.x && newHead.y === currentPowerUp.y) {
          const config = POWER_UPS.find(p => p.type === currentPowerUp.type);
          spawnParticles(currentPowerUp, config?.color);
          setFood((currentFood) => {
            newSnake = applyPowerUp(currentPowerUp.type, newSnake, currentFood);
            setSnake(newSnake);
            return currentFood;
          });
          return null;
        }
        return currentPowerUp;
      });

      const handleEat = (eatenPos: Position, isMainFood: boolean) => {
        lightVibration();
        soundManager.playEatSound();
        spawnParticles(eatenPos);

        const tail = currentSnake[currentSnake.length - 1];
        newSnake.push({ ...tail, id: segmentIdRef.current++ });

        const timeSince = Date.now() - lastEatTimeRef.current;
        if (timeSince < COMBO_WINDOW && comboRef.current < MAX_COMBO) {
          comboRef.current++;
        } else if (timeSince >= COMBO_WINDOW) {
          comboRef.current = 1;
        }
        lastEatTimeRef.current = Date.now();
        setCombo(comboRef.current);

        setScore((prev) => {
          const points = 10 * scoreMultiplierRef.current * comboRef.current;
          const newScore = prev + points;

          const config = DIFFICULTIES[difficultyRef.current];
          baseSpeedRef.current = Math.max(
            config.minSpeed,
            baseSpeedRef.current - config.speedIncrement
          );

          if (!activePowerUp || (activePowerUp.type !== 'SLOW' && activePowerUp.type !== 'TURBO')) {
            setSpeed(baseSpeedRef.current);
          }

          return newScore;
        });

        if (isMainFood) {
          trySpawnPowerUp(newSnake, eatenPos);
        }
      };

      setExtraFoods((currentExtraFoods) => {
        const eatenIndex = currentExtraFoods.findIndex(
          (f) => f.x === newHead.x && f.y === newHead.y
        );
        if (eatenIndex !== -1) {
          handleEat(currentExtraFoods[eatenIndex], false);
          setSnake(newSnake);
          return currentExtraFoods.filter((_, i) => i !== eatenIndex);
        }
        return currentExtraFoods;
      });

      setFood((currentFood) => {
        if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
          handleEat(currentFood, true);
          return getRandomPosition(newSnake, undefined, powerUp);
        }
        return currentFood;
      });

      return newSnake;
    });
  }, [spawnParticles, applyPowerUp, trySpawnPowerUp, activePowerUp, powerUp]);

  const startGame = useCallback(() => {
    const config = DIFFICULTIES[difficultyRef.current];
    setSnake([...INITIAL_SNAKE]);
    setFood(getRandomPosition(INITIAL_SNAKE));
    setDirection('UP');
    directionRef.current = 'UP';
    nextDirectionRef.current = null;
    setScore(0);
    setSpeed(config.initialSpeed);
    baseSpeedRef.current = config.initialSpeed;
    scoreMultiplierRef.current = 1;
    setGameState('PLAYING');
    setParticles([]);
    setIsNewHighScore(false);
    setPowerUp(null);
    setActivePowerUp(null);
    setExtraFoods([]);
    setCombo(1);
    comboRef.current = 1;
    lastEatTimeRef.current = 0;
    segmentIdRef.current = INITIAL_SNAKE.length;
    soundManager.startBackgroundMusic();
  }, []);

  const pauseGame = useCallback(() => {
    setGameState('PAUSED');
    soundManager.pauseBackgroundMusic();
  }, []);

  const resumeGame = useCallback(() => {
    setGameState('PLAYING');
    soundManager.startBackgroundMusic();
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    const currentDirection = directionRef.current;
    if (newDirection !== getOppositeDirection(currentDirection)) {
      nextDirectionRef.current = newDirection;
      setDirection(newDirection);
    }
  }, []);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, speed, moveSnake]);

  useEffect(() => {
    if (gameState === 'GAME_OVER') {
      updateHighScoreIfNeeded(score).then(setIsNewHighScore);
    }
  }, [gameState, score]);

  const activePowerUpRemaining = activePowerUp
    ? Math.max(0, activePowerUp.endTime - Date.now())
    : 0;

  return {
    snake,
    food,
    direction,
    gameState,
    score,
    speed,
    particles,
    isNewHighScore,
    powerUp,
    activePowerUp,
    activePowerUpRemaining,
    mode,
    difficulty,
    extraFoods,
    combo,
    startGame,
    pauseGame,
    resumeGame,
    changeDirection,
  };
};
