import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { COLORS } from '../constants/game';

interface GameOverScreenProps {
  score: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  isNewHighScore,
  onRestart,
  onMenu,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

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
  }, [fadeAnim, scaleAnim, buttonsAnim]);

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
