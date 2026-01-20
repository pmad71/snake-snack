import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  PanResponder,
} from 'react-native';
import { GameBoard } from '../components/GameBoard';
import { useGameLogic } from '../hooks/useGameLogic';
import { detectSwipe } from '../hooks/useSwipeControls';
import { COLORS } from '../constants/game';
import { soundManager } from '../utils/sounds';
import { getMusicEnabled, setMusicEnabled as saveMusicEnabled } from '../utils/storage';
import { Direction, GameMode, Difficulty } from '../types';

interface GameScreenProps {
  onGameOver: (score: number, isNewHighScore: boolean) => void;
  onBack: () => void;
  mode?: GameMode;
  difficulty?: Difficulty;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  onGameOver,
  onBack,
  mode = 'CLASSIC',
  difficulty = 'NORMAL',
}) => {
  const {
    snake,
    food,
    gameState,
    score,
    particles,
    isNewHighScore,
    powerUp,
    activePowerUp,
    activePowerUpRemaining,
    startGame,
    pauseGame,
    resumeGame,
    changeDirection,
  } = useGameLogic({ mode, difficulty });

  const touchStart = useRef({ x: 0, y: 0 });
  const gameStateRef = useRef(gameState);
  const changeDirectionRef = useRef(changeDirection);
  const [musicEnabled, setMusicEnabled] = useState(true);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    changeDirectionRef.current = changeDirection;
  }, [changeDirection]);

  useEffect(() => {
    soundManager.initialize();
    getMusicEnabled().then((enabled) => {
      setMusicEnabled(enabled);
      soundManager.setMusicEnabled(enabled);
    });
    startGame();

    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, [startGame]);

  const toggleMusic = async () => {
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    soundManager.setMusicEnabled(newValue);
    await saveMusicEnabled(newValue);
    if (newValue && gameState === 'PLAYING') {
      soundManager.startBackgroundMusic();
    }
  };

  useEffect(() => {
    if (gameState === 'GAME_OVER') {
      setTimeout(() => {
        onGameOver(score, isNewHighScore);
      }, 500);
    }
  }, [gameState, score, isNewHighScore, onGameOver]);

  const handleSwipe = (direction: Direction) => {
    if (gameStateRef.current === 'PLAYING') {
      changeDirectionRef.current(direction);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        touchStart.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };
      },
      onPanResponderRelease: (evt) => {
        const direction = detectSwipe(
          touchStart.current.x,
          touchStart.current.y,
          evt.nativeEvent.pageX,
          evt.nativeEvent.pageY,
          30
        );
        if (direction && gameStateRef.current === 'PLAYING') {
          changeDirectionRef.current(direction);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.musicButton} onPress={toggleMusic}>
            <Text style={styles.musicButtonText}>{musicEnabled ? '🎵' : '🔇'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pauseButton}
            onPress={gameState === 'PLAYING' ? pauseGame : resumeGame}
          >
            <Text style={styles.pauseButtonText}>
              {gameState === 'PAUSED' ? '▶' : '❚❚'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.gameContainer} {...panResponder.panHandlers}>
        <GameBoard
          snake={snake}
          food={food}
          particles={particles}
          score={score}
          isPaused={gameState === 'PAUSED'}
          powerUp={powerUp}
          activePowerUp={activePowerUp}
          activePowerUpRemaining={activePowerUpRemaining}
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    fontSize: 16,
    color: COLORS.neonGreen,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  musicButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.neonPurple,
    backgroundColor: 'rgba(204, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicButtonText: {
    fontSize: 18,
  },
});
