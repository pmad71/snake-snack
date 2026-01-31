import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, DIFFICULTIES } from '../constants/game';
import { GameMode, Difficulty } from '../types';
import { useMultiplayerGame, MultiplayerState } from '../hooks/useMultiplayerGame';

interface MultiplayerMenuScreenProps {
  nickname: string;
  onBack: () => void;
  onJoinLobby: (roomCode: string, players: string[], isHost: boolean) => void;
}

export const MultiplayerMenuScreen: React.FC<MultiplayerMenuScreenProps> = ({
  nickname,
  onBack,
  onJoinLobby,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('CLASSIC');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('NORMAL');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const {
    mpState,
    playersOnline,
    roomCode,
    players,
    error,
    isConnected,
    connect,
    joinQueue,
    leaveQueue,
    createRoom,
    joinRoom,
    clearError,
  } = useMultiplayerGame(nickname);

  // Connect on mount
  useEffect(() => {
    connect().catch(() => {
      Alert.alert('Błąd', 'Nie można połączyć z serwerem multiplayer');
    });
  }, [connect]);

  // Animate on mount
  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Navigate to lobby when room is created or joined
  useEffect(() => {
    if ((mpState === 'IN_LOBBY' || mpState === 'COUNTDOWN') && roomCode) {
      const playerNames = players.map(p => p.nickname);
      const isHost = players.length > 0 && players[0].isYou === true;
      onJoinLobby(roomCode, playerNames, isHost);
    }
  }, [mpState, roomCode, players, onJoinLobby]);

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert('Błąd', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const handleQuickMatch = () => {
    if (!isConnected) {
      Alert.alert('Błąd', 'Brak połączenia z serwerem');
      return;
    }
    joinQueue({ mode: selectedMode, difficulty: selectedDifficulty });
  };

  const handleCreateRoom = () => {
    if (!isConnected) {
      Alert.alert('Błąd', 'Brak połączenia z serwerem');
      return;
    }
    createRoom({ mode: selectedMode, difficulty: selectedDifficulty });
  };

  const handleJoinRoom = () => {
    if (!isConnected) {
      Alert.alert('Błąd', 'Brak połączenia z serwerem');
      return;
    }
    if (roomCodeInput.length !== 4) {
      Alert.alert('Błąd', 'Kod pokoju musi mieć 4 cyfry');
      return;
    }
    joinRoom(roomCodeInput);
  };

  const handleCancelQueue = () => {
    leaveQueue();
  };

  const isInQueue = mpState === 'IN_QUEUE';
  const isConnecting = mpState === 'CONNECTING';

  const titleOpacity = titleAnim;
  const contentOpacity = contentAnim;
  const contentTranslate = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Connection status */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, isConnected ? styles.statusOnline : styles.statusOffline]} />
        <Text style={styles.statusText}>
          {isConnected ? `Online: ${playersOnline}` : 'Offline'}
        </Text>
      </View>

      <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
        <Text style={styles.title}>MULTIPLAYER</Text>
        <Text style={styles.subtitle}>1 vs 1</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslate }],
          },
        ]}
      >
        {/* In Queue state */}
        {isInQueue ? (
          <View style={styles.queueContainer}>
            <ActivityIndicator size="large" color={COLORS.neonGreen} />
            <Text style={styles.queueText}>Szukam przeciwnika...</Text>
            <Text style={styles.queueSubtext}>Graczy online: {playersOnline}</Text>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelQueue}>
              <Text style={styles.cancelButtonText}>ANULUJ</Text>
            </TouchableOpacity>
          </View>
        ) : isConnecting ? (
          <View style={styles.queueContainer}>
            <ActivityIndicator size="large" color={COLORS.neonPurple} />
            <Text style={styles.queueText}>Łączenie z serwerem...</Text>
          </View>
        ) : (
          <>
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
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedMode === 'CLASSIC' && styles.optionButtonTextActive,
                    ]}
                  >
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
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedMode === 'INFINITE' && styles.optionButtonTextActiveInfinite,
                    ]}
                  >
                    INFINITY
                  </Text>
                </TouchableOpacity>
              </View>
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
                    <Text
                      style={[
                        styles.difficultyButtonText,
                        selectedDifficulty === diff && styles.difficultyButtonTextActive,
                      ]}
                    >
                      {DIFFICULTIES[diff].name.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Main Buttons */}
            <TouchableOpacity
              style={[styles.mainButton, !isConnected && styles.mainButtonDisabled]}
              onPress={handleQuickMatch}
              disabled={!isConnected}
            >
              <Text style={styles.mainButtonIcon}>⚡</Text>
              <Text style={styles.mainButtonText}>SZYBKA GRA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, !isConnected && styles.mainButtonDisabled]}
              onPress={handleCreateRoom}
              disabled={!isConnected}
            >
              <Text style={styles.secondaryButtonIcon}>🏠</Text>
              <Text style={styles.secondaryButtonText}>STWÓRZ POKÓJ</Text>
            </TouchableOpacity>

            {/* Join Room Section */}
            {showJoinInput ? (
              <View style={styles.joinSection}>
                <TextInput
                  style={styles.codeInput}
                  value={roomCodeInput}
                  onChangeText={(text) => setRoomCodeInput(text.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="Kod pokoju"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="numeric"
                  maxLength={4}
                  autoFocus
                />
                <View style={styles.joinButtons}>
                  <TouchableOpacity
                    style={styles.joinConfirmButton}
                    onPress={handleJoinRoom}
                    disabled={roomCodeInput.length !== 4}
                  >
                    <Text style={styles.joinConfirmButtonText}>DOŁĄCZ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.joinCancelButton}
                    onPress={() => {
                      setShowJoinInput(false);
                      setRoomCodeInput('');
                    }}
                  >
                    <Text style={styles.joinCancelButtonText}>ANULUJ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.tertiaryButton, !isConnected && styles.mainButtonDisabled]}
                onPress={() => setShowJoinInput(true)}
                disabled={!isConnected}
              >
                <Text style={styles.tertiaryButtonIcon}>🔗</Text>
                <Text style={styles.tertiaryButtonText}>DOŁĄCZ DO POKOJU</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.View>

      {/* Rules */}
      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>ZASADY</Text>
        <Text style={styles.rulesText}>Pierwszy do 200 pkt lub ostatni żywy wygrywa!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  statusBar: {
    position: 'absolute',
    top: 55,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusOnline: {
    backgroundColor: COLORS.neonGreen,
  },
  statusOffline: {
    backgroundColor: '#ff3333',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.neonPurple,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.neonGreen,
    letterSpacing: 6,
    marginTop: 5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    marginTop: 20,
    gap: 10,
  },
  mainButtonDisabled: {
    opacity: 0.5,
  },
  mainButtonIcon: {
    fontSize: 20,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    letterSpacing: 2,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.neonPurple,
    backgroundColor: 'rgba(204, 0, 255, 0.1)',
    marginTop: 12,
    gap: 8,
  },
  secondaryButtonIcon: {
    fontSize: 18,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.neonPurple,
    letterSpacing: 2,
  },
  tertiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.neonPink,
    backgroundColor: 'rgba(255, 0, 102, 0.1)',
    marginTop: 12,
    gap: 8,
  },
  tertiaryButtonIcon: {
    fontSize: 16,
  },
  tertiaryButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.neonPink,
    letterSpacing: 1,
  },
  joinSection: {
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
  },
  codeInput: {
    width: 150,
    height: 50,
    borderWidth: 2,
    borderColor: COLORS.neonPink,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 0, 102, 0.1)',
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
  },
  joinButtons: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  joinConfirmButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
  },
  joinConfirmButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
  },
  joinCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  joinCancelButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  queueContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  queueText: {
    fontSize: 18,
    color: COLORS.neonGreen,
    marginTop: 20,
    letterSpacing: 2,
  },
  queueSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ff3333',
    backgroundColor: 'rgba(255, 51, 51, 0.1)',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff3333',
    letterSpacing: 2,
  },
  rulesContainer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    alignItems: 'center',
  },
  rulesTitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 3,
    marginBottom: 5,
  },
  rulesText: {
    fontSize: 12,
    color: COLORS.neonGreen,
    textAlign: 'center',
  },
});
