import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { StartScreen } from './src/screens/StartScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { HowToPlayScreen } from './src/screens/HowToPlayScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { MultiplayerMenuScreen } from './src/screens/MultiplayerMenuScreen';
import { MultiplayerLobbyScreen } from './src/screens/MultiplayerLobbyScreen';
import { MultiplayerGameScreen } from './src/screens/MultiplayerGameScreen';
import { MultiplayerResultScreen } from './src/screens/MultiplayerResultScreen';
import { NicknameModal } from './src/components/NicknameModal';
import { Screen, GameMode, Difficulty, MultiplayerState } from './src/types';
import { COLORS } from './src/constants/game';
import { getNickname, setNickname as saveNickname } from './src/utils/storage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('START');
  const [lastScore, setLastScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [nickname, setNickname] = useState<string | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);

  // Multiplayer state
  const [multiplayerRoomCode, setMultiplayerRoomCode] = useState<string | null>(null);
  const [multiplayerPlayers, setMultiplayerPlayers] = useState<string[]>([]);
  const [multiplayerIsHost, setMultiplayerIsHost] = useState(false);
  const [multiplayerWinner, setMultiplayerWinner] = useState<string | null>(null);
  const [multiplayerScores, setMultiplayerScores] = useState<{nickname: string, score: number}[]>([]);
  const [multiplayerGameOverReason, setMultiplayerGameOverReason] = useState<string | null>(null);

  useEffect(() => {
    getNickname().then((nick) => {
      if (nick) {
        setNickname(nick);
      } else {
        setShowNicknameModal(true);
      }
    });
  }, []);

  const handleNicknameSubmit = async (nick: string) => {
    await saveNickname(nick);
    setNickname(nick);
    setShowNicknameModal(false);
  };

  const handleStart = (mode: GameMode, diff: Difficulty) => {
    setGameMode(mode);
    setDifficulty(diff);
    setCurrentScreen('GAME');
  };

  const handleGameOver = (score: number, isHighScore: boolean, position: number | null) => {
    setLastScore(score);
    setIsNewHighScore(isHighScore);
    setLeaderboardPosition(position);
    setCurrentScreen('GAME_OVER');
  };

  const handleRestart = () => {
    setCurrentScreen('GAME');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('START');
  };

  const handleHowToPlay = () => {
    setCurrentScreen('HOW_TO_PLAY');
  };

  const handleLeaderboard = () => {
    setCurrentScreen('LEADERBOARD');
  };

  const handleMultiplayer = () => {
    setCurrentScreen('MULTIPLAYER_MENU');
  };

  // Multiplayer handlers
  const handleMultiplayerJoinLobby = (roomCode: string, players: string[], isHost: boolean) => {
    setMultiplayerRoomCode(roomCode);
    setMultiplayerPlayers(players);
    setMultiplayerIsHost(isHost);
    setCurrentScreen('MULTIPLAYER_LOBBY');
  };

  const handleMultiplayerStartGame = () => {
    setCurrentScreen('MULTIPLAYER_GAME');
  };

  const handleMultiplayerGameOver = (winner: string, scores: {nickname: string, score: number}[], reason: string) => {
    setMultiplayerWinner(winner);
    setMultiplayerScores(scores);
    setMultiplayerGameOverReason(reason);
    setCurrentScreen('MULTIPLAYER_RESULT');
  };

  const handleMultiplayerRematch = () => {
    setCurrentScreen('MULTIPLAYER_LOBBY');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'START':
        return (
          <StartScreen
            onStart={handleStart}
            onHowToPlay={handleHowToPlay}
            onLeaderboard={handleLeaderboard}
            onMultiplayer={handleMultiplayer}
          />
        );
      case 'GAME':
        return (
          <GameScreen
            onGameOver={handleGameOver}
            onExit={handleBackToMenu}
            mode={gameMode}
            difficulty={difficulty}
            nickname={nickname || 'Player'}
          />
        );
      case 'GAME_OVER':
        return (
          <GameOverScreen
            score={lastScore}
            isNewHighScore={isNewHighScore}
            onRestart={handleRestart}
            onMenu={handleBackToMenu}
            mode={gameMode}
            difficulty={difficulty}
            leaderboardPosition={leaderboardPosition}
          />
        );
      case 'HOW_TO_PLAY':
        return <HowToPlayScreen onBack={handleBackToMenu} />;
      case 'LEADERBOARD':
        return <LeaderboardScreen onBack={handleBackToMenu} />;
      case 'MULTIPLAYER_MENU':
        return (
          <MultiplayerMenuScreen
            nickname={nickname || 'Player'}
            onBack={handleBackToMenu}
            onJoinLobby={handleMultiplayerJoinLobby}
          />
        );
      case 'MULTIPLAYER_LOBBY':
        return (
          <MultiplayerLobbyScreen
            roomCode={multiplayerRoomCode || ''}
            players={multiplayerPlayers}
            isHost={multiplayerIsHost}
            nickname={nickname || 'Player'}
            onBack={() => setCurrentScreen('MULTIPLAYER_MENU')}
            onGameStart={handleMultiplayerStartGame}
            onPlayersUpdate={setMultiplayerPlayers}
          />
        );
      case 'MULTIPLAYER_GAME':
        return (
          <MultiplayerGameScreen
            nickname={nickname || 'Player'}
            roomCode={multiplayerRoomCode || ''}
            onGameOver={handleMultiplayerGameOver}
            onExit={() => setCurrentScreen('MULTIPLAYER_MENU')}
          />
        );
      case 'MULTIPLAYER_RESULT':
        return (
          <MultiplayerResultScreen
            winner={multiplayerWinner || ''}
            scores={multiplayerScores}
            gameOverReason={multiplayerGameOverReason || ''}
            playerNickname={nickname || 'Player'}
            onRematch={handleMultiplayerRematch}
            onMenu={handleBackToMenu}
          />
        );
      default:
        return (
          <StartScreen
            onStart={handleStart}
            onHowToPlay={handleHowToPlay}
            onLeaderboard={handleLeaderboard}
            onMultiplayer={handleMultiplayer}
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
        onSave={handleNicknameSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
