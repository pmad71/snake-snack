import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

import { StartScreen } from './src/screens/StartScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { HowToPlayScreen } from './src/screens/HowToPlayScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { NicknameModal } from './src/components/NicknameModal';
import { Screen, GameMode, Difficulty } from './src/types';
import { getNickname, setNickname as saveNickname } from './src/utils/storage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('START');
  const [lastScore, setLastScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [playerNickname, setPlayerNickname] = useState<string | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);

  // Load nickname on app start
  useEffect(() => {
    getNickname().then((nick) => {
      if (nick) {
        setPlayerNickname(nick);
      } else {
        setShowNicknameModal(true);
      }
    });
  }, []);

  const handleSaveNickname = useCallback(async (nickname: string) => {
    await saveNickname(nickname);
    setPlayerNickname(nickname);
    setShowNicknameModal(false);
  }, []);

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

  const handleLeaderboard = useCallback(() => {
    setCurrentScreen('LEADERBOARD');
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'START':
        return (
          <StartScreen
            onStart={handleStart}
            onHowToPlay={handleHowToPlay}
            onLeaderboard={handleLeaderboard}
          />
        );
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
            playerNickname={playerNickname}
            gameMode={gameMode}
            difficulty={difficulty}
          />
        );
      case 'HOW_TO_PLAY':
        return <HowToPlayScreen onBack={handleMenu} />;
      case 'LEADERBOARD':
        return (
          <LeaderboardScreen
            onBack={handleMenu}
            playerNickname={playerNickname}
          />
        );
      default:
        return (
          <StartScreen
            onStart={handleStart}
            onHowToPlay={handleHowToPlay}
            onLeaderboard={handleLeaderboard}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}
      <NicknameModal
        visible={showNicknameModal}
        onSave={handleSaveNickname}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
