import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  Share,
} from 'react-native';
import { COLORS } from '../constants/game';
import { useMultiplayerGame, MultiplayerPlayer } from '../hooks/useMultiplayerGame';

interface MultiplayerLobbyScreenProps {
  roomCode: string;
  players: string[];
  isHost: boolean;
  nickname: string;
  onBack: () => void;
  onGameStart: () => void;
  onPlayersUpdate: (players: string[]) => void;
}

export const MultiplayerLobbyScreen: React.FC<MultiplayerLobbyScreenProps> = ({
  roomCode: initialRoomCode,
  players: initialPlayers,
  isHost,
  nickname,
  onBack,
  onGameStart,
  onPlayersUpdate,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownScale = useRef(new Animated.Value(0)).current;

  const {
    mpState,
    roomCode: hookRoomCode,
    players: hookPlayers,
    countdown,
    error,
    leaveRoom,
    clearError,
  } = useMultiplayerGame(nickname);

  // Use hook values if available, otherwise use props
  const roomCode = hookRoomCode || initialRoomCode;
  const players = hookPlayers.length > 0 ? hookPlayers : initialPlayers.map(name => ({ nickname: name, isYou: name === nickname }));

  // Sync players to parent when they change
  useEffect(() => {
    if (hookPlayers.length > 0) {
      onPlayersUpdate(hookPlayers.map(p => p.nickname));
    }
  }, [hookPlayers, onPlayersUpdate]);

  // Pulse animation for waiting state
  useEffect(() => {
    if (mpState === 'IN_LOBBY' && players.length < 2) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [mpState, players.length, pulseAnim]);

  // Countdown animation
  useEffect(() => {
    if (countdown !== null) {
      countdownScale.setValue(0);
      Animated.spring(countdownScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [countdown, countdownScale]);

  // Navigate to game when playing
  useEffect(() => {
    if (mpState === 'PLAYING') {
      onGameStart();
    }
  }, [mpState, onGameStart]);

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert('Błąd', error, [
        {
          text: 'OK',
          onPress: () => {
            clearError();
            onBack();
          },
        },
      ]);
    }
  }, [error, clearError, onBack]);

  const handleLeave = () => {
    Alert.alert('Opuścić pokój?', 'Czy na pewno chcesz wyjść?', [
      { text: 'Nie', style: 'cancel' },
      {
        text: 'Tak',
        onPress: () => {
          leaveRoom();
          onBack();
        },
      },
    ]);
  };

  const handleShareCode = async () => {
    if (roomCode) {
      try {
        await Share.share({
          message: `Dołącz do mojej gry Snake Neon! Kod pokoju: ${roomCode}`,
        });
      } catch (error) {
        // User cancelled
      }
    }
  };

  const isWaitingForPlayer = players.length < 2;
  const isCountdown = mpState === 'COUNTDOWN';

  return (
    <View style={styles.container}>
      {/* Room Code Section */}
      {roomCode && !isCountdown && (
        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>KOD POKOJU</Text>
          <TouchableOpacity onPress={handleShareCode} style={styles.codeContainer}>
            <Text style={styles.codeText}>{roomCode}</Text>
            <Text style={styles.shareHint}>Dotknij aby udostępnić</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Countdown */}
      {isCountdown && countdown !== null && (
        <View style={styles.countdownSection}>
          <Animated.Text
            style={[
              styles.countdownText,
              {
                transform: [{ scale: countdownScale }],
              },
            ]}
          >
            {countdown}
          </Animated.Text>
          <Text style={styles.countdownLabel}>PRZYGOTUJ SIĘ!</Text>
        </View>
      )}

      {/* Players Section */}
      {!isCountdown && (
        <View style={styles.playersSection}>
          <Text style={styles.playersTitle}>GRACZE</Text>

          <View style={styles.playersList}>
            {players.map((player, index) => (
              <PlayerCard
                key={player.nickname}
                player={player}
                isYou={player.nickname === nickname}
                playerIndex={index}
              />
            ))}

            {isWaitingForPlayer && (
              <Animated.View
                style={[
                  styles.waitingCard,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Text style={styles.waitingIcon}>⏳</Text>
                <Text style={styles.waitingText}>Oczekiwanie na przeciwnika...</Text>
              </Animated.View>
            )}
          </View>
        </View>
      )}

      {/* Actions */}
      {!isCountdown && (
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
            <Text style={styles.leaveButtonText}>OPUŚĆ POKÓJ</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          {isCountdown
            ? 'Gra zaraz się rozpocznie!'
            : isWaitingForPlayer
            ? 'Udostępnij kod znajomemu lub poczekaj na przeciwnika'
            : 'Gra rozpocznie się za chwilę...'}
        </Text>
      </View>
    </View>
  );
};

interface PlayerCardProps {
  player: MultiplayerPlayer;
  isYou: boolean;
  playerIndex: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isYou, playerIndex }) => {
  const colors = ['#00ff88', '#ff0066'];
  const color = colors[playerIndex % colors.length];

  return (
    <View style={[styles.playerCard, { borderColor: color }]}>
      <View style={styles.playerInfo}>
        <Text style={[styles.playerIcon, { color }]}>
          {playerIndex === 0 ? '🐍' : '🐍'}
        </Text>
        <Text style={[styles.playerName, { color }]}>{player.nickname}</Text>
        {isYou && <Text style={styles.youBadge}>TY</Text>}
      </View>
      <Text style={styles.readyIcon}>✓</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  codeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 3,
    marginBottom: 10,
  },
  codeContainer: {
    alignItems: 'center',
  },
  codeText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    letterSpacing: 16,
  },
  shareHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  countdownSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
  },
  countdownLabel: {
    fontSize: 18,
    color: COLORS.neonPink,
    letterSpacing: 4,
    marginTop: 10,
  },
  playersSection: {
    alignItems: 'center',
  },
  playersTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 3,
    marginBottom: 20,
  },
  playersList: {
    width: '100%',
    gap: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerIcon: {
    fontSize: 24,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  youBadge: {
    fontSize: 10,
    color: COLORS.background,
    backgroundColor: COLORS.neonGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  readyIcon: {
    fontSize: 20,
    color: COLORS.neonGreen,
  },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 15,
    borderStyle: 'dashed',
    gap: 12,
  },
  waitingIcon: {
    fontSize: 24,
  },
  waitingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  actionsSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  leaveButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ff3333',
    backgroundColor: 'rgba(255, 51, 51, 0.1)',
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff3333',
    letterSpacing: 2,
  },
  infoSection: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
