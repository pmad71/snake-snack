import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { COLORS, DIFFICULTIES } from '../constants/game';
import { getHighScore, getMusicEnabled, setMusicEnabled as saveMusicEnabled } from '../utils/storage';
import { soundManager } from '../utils/sounds';
import { GameMode, Difficulty } from '../types';

interface StartScreenProps {
  onStart: (mode: GameMode, difficulty: Difficulty) => void;
  onHowToPlay: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onHowToPlay }) => {
  const [highScore, setHighScore] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [selectedMode, setSelectedMode] = useState<GameMode>('CLASSIC');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('NORMAL');
  const titleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getHighScore().then(setHighScore);
    getMusicEnabled().then((enabled) => {
      setMusicEnabled(enabled);
      soundManager.setMusicEnabled(enabled);
    });

    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const titleScale = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const buttonTranslate = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const handleStart = () => {
    onStart(selectedMode, selectedDifficulty);
  };

  const toggleMusic = async () => {
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    soundManager.setMusicEnabled(newValue);
    await saveMusicEnabled(newValue);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.musicButton} onPress={toggleMusic}>
        <Text style={styles.musicButtonText}>{musicEnabled ? '🎵' : '🔇'}</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.titleContainer,
            {
              transform: [{ scale: titleScale }],
              opacity: titleAnim,
            },
          ]}
        >
          <Text style={styles.title}>SNAKE</Text>
          <Text style={styles.subtitle}>NEON EDITION</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [{ translateY: buttonTranslate }],
              opacity: buttonAnim,
            },
          ]}
        >
          {/* Mode Selection */}
          <View style={styles.optionSection}>
            <Text style={styles.optionLabel}>TRYB</Text>
            <View style={styles.optionButtons}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedMode === 'CLASSIC' && styles.optionButtonActive,
                ]}
                onPress={() => setSelectedMode('CLASSIC')}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedMode === 'CLASSIC' && styles.optionButtonTextActive,
                ]}>
                  KLASYCZNY
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedMode === 'INFINITE' && styles.optionButtonActiveInfinite,
                ]}
                onPress={() => setSelectedMode('INFINITE')}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedMode === 'INFINITE' && styles.optionButtonTextActiveInfinite,
                ]}>
                  INFINITY
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modeDesc}>
              {selectedMode === 'CLASSIC'
                ? 'Ściany zabijają'
                : 'Ściany nie zabijają'}
            </Text>
          </View>

          {/* Difficulty Selection */}
          <View style={styles.optionSection}>
            <Text style={styles.optionLabel}>TRUDNOŚĆ</Text>
            <View style={styles.optionButtons}>
              {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.difficultyButton,
                    selectedDifficulty === diff && styles.difficultyButtonActive,
                  ]}
                  onPress={() => setSelectedDifficulty(diff)}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    selectedDifficulty === diff && styles.difficultyButtonTextActive,
                  ]}>
                    {DIFFICULTIES[diff].name.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>GRAJ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.howToPlayButton}
            onPress={onHowToPlay}
            activeOpacity={0.8}
          >
            <Text style={styles.howToPlayButtonText}>JAK GRAĆ?</Text>
          </TouchableOpacity>

          {highScore > 0 && (
            <View style={styles.highScoreContainer}>
              <Text style={styles.highScoreLabel}>REKORD</Text>
              <Text style={styles.highScoreValue}>{highScore}</Text>
            </View>
          )}
        </Animated.View>
      </View>

      <Text style={styles.footer}>Przesuń palcem • Jedz i rośnij • Nie rozbij się!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    letterSpacing: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.neonPink,
    letterSpacing: 12,
    marginTop: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  optionSection: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 3,
    marginBottom: 10,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    backgroundColor: 'transparent',
  },
  optionButtonActive: {
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
  },
  optionButtonActiveInfinite: {
    borderColor: COLORS.neonPurple,
    backgroundColor: 'rgba(204, 0, 255, 0.15)',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  optionButtonTextActive: {
    color: COLORS.neonGreen,
  },
  optionButtonTextActiveInfinite: {
    color: COLORS.neonPurple,
  },
  modeDesc: {
    marginTop: 8,
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  difficultyButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    backgroundColor: 'transparent',
  },
  difficultyButtonActive: {
    borderColor: COLORS.neonPink,
    backgroundColor: 'rgba(255, 0, 102, 0.15)',
  },
  difficultyButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  difficultyButtonTextActive: {
    color: COLORS.neonPink,
  },
  startButton: {
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    marginTop: 10,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    letterSpacing: 4,
  },
  howToPlayButton: {
    marginTop: 16,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.neonPink,
    backgroundColor: 'rgba(255, 0, 102, 0.1)',
  },
  howToPlayButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.neonPink,
    letterSpacing: 3,
  },
  highScoreContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  highScoreLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 4,
  },
  highScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.neonPink,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  musicButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.neonPurple,
    backgroundColor: 'rgba(204, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  musicButtonText: {
    fontSize: 20,
  },
});
