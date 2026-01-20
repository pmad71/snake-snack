import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

import { StartScreen } from './src/screens/StartScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { HowToPlayScreen } from './src/screens/HowToPlayScreen';
import { Screen, GameMode, Difficulty } from './src/types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('START');
  const [lastScore, setLastScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');

  const handleStart = useCallback((mode: GameMode, diff: Difficulty) => {
    setGameMode(mode);
    setDifficulty(diff);
    setCurrentScreen('GAME');
  }, []);

  const handleGameOver = useCallback((score: number, newHighScore: boolean) => {
    setLastScore(score);
    setIsNewHighScore(newHighScore);
    setCurrentScreen('GAME_OVER');
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentScreen('GAME');
  }, []);

  const handleMenu = useCallback(() => {
    setCurrentScreen('START');
  }, []);

  const handleHowToPlay = useCallback(() => {
    setCurrentScreen('HOW_TO_PLAY');
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'START':
        return <StartScreen onStart={handleStart} onHowToPlay={handleHowToPlay} />;
      case 'GAME':
        return (
          <GameScreen
            onGameOver={handleGameOver}
            onBack={handleMenu}
            mode={gameMode}
            difficulty={difficulty}
          />
        );
      case 'GAME_OVER':
        return (
          <GameOverScreen
            score={lastScore}
            isNewHighScore={isNewHighScore}
            onRestart={handleRestart}
            onMenu={handleMenu}
          />
        );
      case 'HOW_TO_PLAY':
        return <HowToPlayScreen onBack={handleMenu} />;
      default:
        return <StartScreen onStart={handleStart} onHowToPlay={handleHowToPlay} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
