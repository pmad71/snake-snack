import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/game';
import { GameMode, Difficulty } from '../types';
import { submitScore } from '../utils/api';

interface GameOverScreenProps {
  score: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onMenu: () => void;
  playerNickname?: string | null;
  gameMode: GameMode;
  difficulty: Difficulty;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  isNewHighScore,
  onRestart,
  onMenu,
  playerNickname,
  gameMode,
  difficulty,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  const [submitting, setSubmitting] = useState(false);
  const [rankPosition, setRankPosition] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Submit score to leaderboard
    if (playerNickname && score > 0) {
      setSubmitting(true);
      submitScore(playerNickname, score, gameMode, difficulty)
        .then((result) => {
          if (result.success && result.position) {
            setRankPosition(result.position);
          } else {
            setSubmitError(true);
          }
        })
        .catch(() => setSubmitError(true))
        .finally(() => setSubmitting(false));
    }
  }, []);

  const getRankText = () => {
    if (!rankPosition) return null;
    if (rankPosition === 1) return 'JESTEŚ LIDEREM!';
    if (rankPosition <= 3) return `TOP 3 - MIEJSCE ${rankPosition}!`;
    if (rankPosition <= 10) return `TOP 10 - MIEJSCE ${rankPosition}`;
    return `MIEJSCE ${rankPosition} W RANKINGU`;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.gameOverText}>KONIEC GRY</Text>

        <View style={styles.scoreContainer}>
          {isNewHighScore && (
            <View style={styles.newHighScoreBadge}>
              <Text style={styles.newHighScoreText}>NOWY REKORD!</Text>
            </View>
          )}
          <Text style={styles.scoreLabel}>TWÓJ WYNIK</Text>
          <Text
            style={[
              styles.scoreValue,
              isNewHighScore && styles.scoreValueHighlight,
            ]}
          >
            {score}
          </Text>

          {/* Rank position */}
          {submitting ? (
            <View style={styles.rankContainer}>
              <ActivityIndicator size="small" color={COLORS.neonGreen} />
              <Text style={styles.rankLoading}>Zapisywanie wyniku...</Text>
            </View>
          ) : rankPosition ? (
            <View style={styles.rankContainer}>
              <Text
                style={[
                  styles.rankText,
                  rankPosition <= 3 && styles.rankTextTop3,
                ]}
              >
                {getRankText()}
              </Text>
            </View>
          ) : submitError ? (
            <View style={styles.rankContainer}>
              <Text style={styles.rankError}>Nie udało się zapisać wyniku</Text>
            </View>
          ) : null}
        </View>

        <Animated.View
          style={[
            styles.buttonsContainer,
            { opacity: buttonsAnim },
          ]}
        >
          <TouchableOpacity
            style={styles.restartButton}
            onPress={onRestart}
            activeOpacity={0.8}
          >
            <Text style={styles.restartButtonText}>ZAGRAJ PONOWNIE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenu}
            activeOpacity={0.8}
          >
            <Text style={styles.menuButtonText}>MENU GŁÓWNE</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.neonPink,
    letterSpacing: 6,
    marginBottom: 40,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  newHighScoreBadge: {
    backgroundColor: COLORS.neonGreen,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
  },
  newHighScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 2,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 4,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreValueHighlight: {
    color: COLORS.neonGreen,
  },
  rankContainer: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  rankLoading: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.neonBlue,
    letterSpacing: 2,
  },
  rankTextTop3: {
    color: COLORS.neonGreen,
    fontSize: 16,
  },
  rankError: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  restartButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    backgroundColor: COLORS.neonGreen,
    alignItems: 'center',
    marginBottom: 15,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 4,
  },
  menuButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 4,
  },
});
