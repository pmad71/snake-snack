import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  PanResponder,
  Animated,
  Alert,
} from 'react-native';
import { MultiplayerGameBoard } from '../components/MultiplayerGameBoard';
import { detectSwipe } from '../hooks/useSwipeControls';
import { COLORS } from '../constants/game';
import { useMultiplayerGame } from '../hooks/useMultiplayerGame';
import { soundManager } from '../utils/sounds';
import { getMusicEnabled, setMusicEnabled as saveMusicEnabled } from '../utils/storage';
import { Direction } from '../types';

interface MultiplayerGameScreenProps {
  nickname: string;
  roomCode: string;
  onGameOver: (winner: string, scores: { nickname: string; score: number }[], reason: string) => void;
  onExit: () => void;
}

export const MultiplayerGameScreen: React.FC<MultiplayerGameScreenProps> = ({
  nickname,
  roomCode,
  onGameOver,
  onExit,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const touchStart = useRef({ x: 0, y: 0 });
  const [musicEnabled, setMusicEnabled] = useState(true);

  const {
    mpState,
    gameState,
    winner,
    gameOverReason,
    finalScores,
    error,
    leaveRoom,
    sendDirection,
    clearError,
  } = useMultiplayerGame(nickname);

  const sendDirectionRef = useRef(sendDirection);
  const mpStateRef = useRef(mpState);

  // Keep refs updated
  useEffect(() => {
    sendDirectionRef.current = sendDirection;
  }, [sendDirection]);

  useEffect(() => {
    mpStateRef.current = mpState;
  }, [mpState]);

  // Initialize music
  useEffect(() => {
    soundManager.initialize();
    getMusicEnabled().then((enabled) => {
      setMusicEnabled(enabled);
      soundManager.setMusicEnabled(enabled);
    });

    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, []);

  // Start/stop music based on game state
  useEffect(() => {
    if (mpState === 'PLAYING' && musicEnabled) {
      soundManager.startBackgroundMusic();
    } else if (mpState === 'GAME_OVER') {
      soundManager.stopBackgroundMusic();
    }
  }, [mpState, musicEnabled]);

  const toggleMusic = async () => {
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    soundManager.setMusicEnabled(newValue);
    await saveMusicEnabled(newValue);
    if (newValue && mpState === 'PLAYING') {
      soundManager.startBackgroundMusic();
    }
  };

  // Handle game over transition
  useEffect(() => {
    console.log('=== MultiplayerGameScreen useEffect ===');
    console.log('mpState:', mpState);
    console.log('winner:', winner);
    console.log('gameOverReason:', gameOverReason);
    console.log('finalScores:', JSON.stringify(finalScores));

    if (mpState === 'GAME_OVER' && finalScores) {
      console.log('=== CALLING onGameOver ===');
      console.log('Passing winner:', winner || '');
      console.log('Passing reason:', gameOverReason || '');
      console.log('Passing scores:', JSON.stringify(finalScores));

      // Trigger shake on game over
      triggerShake(12);
      setTimeout(() => {
        onGameOver(winner || '', finalScores, gameOverReason || '');
      }, 500);
    }
  }, [mpState, winner, gameOverReason, finalScores, onGameOver]);

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert('Błąd', error, [
        {
          text: 'OK',
          onPress: () => {
            clearError();
            onExit();
          },
        },
      ]);
    }
  }, [error, clearError, onExit]);

  const triggerShake = useCallback(
    (intensity = 8) => {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: intensity, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -intensity, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: intensity / 2, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -intensity / 2, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    },
    [shakeAnim]
  );

  const handleLeave = () => {
    Alert.alert('Opuścić grę?', 'Przegrana zostanie zaliczona przeciwnikowi.', [
      { text: 'Nie', style: 'cancel' },
      {
        text: 'Tak, wyjdź',
        style: 'destructive',
        onPress: () => {
          leaveRoom();
          onExit();
        },
      },
    ]);
  };

  const handleSwipe = (direction: Direction) => {
    if (mpStateRef.current === 'PLAYING') {
      sendDirectionRef.current(direction);
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
        if (direction && mpStateRef.current === 'PLAYING') {
          sendDirectionRef.current(direction);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleLeave}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>LIVE</Text>
          </View>

          <TouchableOpacity style={styles.musicButton} onPress={toggleMusic}>
            <Text style={styles.musicButtonText}>{musicEnabled ? '🎵' : '🔇'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View
        style={[styles.gameContainer, { transform: [{ translateX: shakeAnim }] }]}
        {...panResponder.panHandlers}
      >
        {gameState && (
          <MultiplayerGameBoard
            snakes={gameState.snakes}
            food={gameState.food}
            myNickname={nickname}
            boardWidth={gameState.boardWidth || 24}
            boardHeight={gameState.boardHeight || 36}
          />
        )}
      </Animated.View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#ff3333',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3333',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff3333',
    letterSpacing: 2,
  },
  musicButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicButtonText: {
    fontSize: 20,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
});
