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
import { useMultiplayerGame } from '../hooks/useMultiplayerGame';

interface MultiplayerResultScreenProps {
  winner: string;
  scores: { nickname: string; score: number }[];
  gameOverReason: string;
  playerNickname: string;
  onMenu: () => void;
  onRematch: () => void;
}

export const MultiplayerResultScreen: React.FC<MultiplayerResultScreenProps> = ({
  winner,
  scores,
  gameOverReason,
  playerNickname,
  onMenu,
  onRematch,
}) => {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const {
    rematchRequested,
    requestRematch,
    declineRematch,
    leaveRoom,
    resetState,
  } = useMultiplayerGame(playerNickname);

  const isWinner = winner === playerNickname;
  // Only show as draw if reason is explicitly 'draw' OR winner is empty/null
  const isDraw = gameOverReason === 'draw' || (!winner && gameOverReason !== 'points' && gameOverReason !== 'survival' && gameOverReason !== 'score');
  const finalScores = scores;

  // Animate on mount
  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
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

  const handleMenu = () => {
    leaveRoom();
    resetState();
    onMenu();
  };

  const handleRematch = () => {
    requestRematch();
    onRematch();
  };

  const handleDeclineRematch = () => {
    declineRematch();
    handleMenu();
  };

  // Get reason text
  const getReasonText = () => {
    switch (gameOverReason) {
      case 'score':
        return 'Osiągnięto 200 punktów!';
      case 'points':
        return 'Wygrana na punkty!';
      case 'survival':
        return 'Przeciwnik zginął!';
      case 'draw':
        return 'Remis - równa liczba punktów';
      case 'opponent_left':
        return 'Przeciwnik opuścił grę';
      case 'score_after_death':
        return 'Wyższy wynik po śmierci obu graczy';
      case 'head_collision':
        return 'Kolizja głowami!';
      default:
        return '';
    }
  };

  // Sort scores - winner first
  const sortedScores = finalScores
    ? [...finalScores].sort((a, b) => {
        if (a.nickname === winner) return -1;
        if (b.nickname === winner) return 1;
        return b.score - a.score;
      })
    : [];

  const titleScale = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const contentTranslate = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <View style={styles.container}>
      {/* Result Title */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            transform: [{ scale: titleScale }],
            opacity: titleAnim,
          },
        ]}
      >
        {isDraw ? (
          <>
            <Text style={styles.drawTitle}>REMIS</Text>
            <Text style={styles.drawEmoji}>🤝</Text>
          </>
        ) : isWinner ? (
          <>
            <Text style={styles.winTitle}>WYGRANA!</Text>
            <Text style={styles.winEmoji}>🏆</Text>
          </>
        ) : (
          <>
            <Text style={styles.loseTitle}>PRZEGRANA</Text>
            <Text style={styles.loseEmoji}>💀</Text>
          </>
        )}
        <Text style={styles.reasonText}>{getReasonText()}</Text>
      </Animated.View>

      {/* Scores */}
      <Animated.View
        style={[
          styles.scoresContainer,
          {
            opacity: contentAnim,
            transform: [{ translateY: contentTranslate }],
          },
        ]}
      >
        <Text style={styles.scoresTitle}>WYNIKI</Text>

        {sortedScores.map((player, index) => {
          const isMe = player.nickname === playerNickname;
          const isPlayerWinner = player.nickname === winner;
          const color = isMe ? '#00ff88' : '#ff0066';

          return (
            <View
              key={player.nickname}
              style={[
                styles.scoreRow,
                isPlayerWinner && styles.scoreRowWinner,
              ]}
            >
              <View style={styles.scoreLeft}>
                {isPlayerWinner && <Text style={styles.winnerIcon}>👑</Text>}
                <Text style={[styles.playerName, { color }]}>
                  {player.nickname}
                </Text>
                {isMe && <Text style={styles.youBadge}>TY</Text>}
              </View>
              <Text style={[styles.scoreValue, { color }]}>{player.score}</Text>
            </View>
          );
        })}
      </Animated.View>

      {/* Rematch Section */}
      <Animated.View
        style={[
          styles.actionsContainer,
          {
            opacity: contentAnim,
          },
        ]}
      >
        {rematchRequested && rematchRequested !== playerNickname ? (
          <View style={styles.rematchRequestContainer}>
            <Text style={styles.rematchRequestText}>
              {rematchRequested} chce rewanżu!
            </Text>
            <View style={styles.rematchButtons}>
              <TouchableOpacity style={styles.acceptButton} onPress={handleRematch}>
                <Text style={styles.acceptButtonText}>AKCEPTUJ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineButton} onPress={handleDeclineRematch}>
                <Text style={styles.declineButtonText}>ODMÓW</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : rematchRequested === playerNickname ? (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Czekam na odpowiedź przeciwnika...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.rematchButton} onPress={handleRematch}>
            <Text style={styles.rematchButtonIcon}>🔄</Text>
            <Text style={styles.rematchButtonText}>REWANŻ</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuButton} onPress={handleMenu}>
          <Text style={styles.menuButtonText}>POWRÓT DO MENU</Text>
        </TouchableOpacity>
      </Animated.View>
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  winTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    letterSpacing: 6,
  },
  winEmoji: {
    fontSize: 64,
    marginTop: 10,
  },
  loseTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ff3333',
    letterSpacing: 4,
  },
  loseEmoji: {
    fontSize: 64,
    marginTop: 10,
  },
  drawTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.neonPurple,
    letterSpacing: 6,
  },
  drawEmoji: {
    fontSize: 64,
    marginTop: 10,
  },
  reasonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 15,
    textAlign: 'center',
  },
  scoresContainer: {
    marginBottom: 40,
  },
  scoresTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 15,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 10,
  },
  scoreRowWinner: {
    borderWidth: 1,
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  winnerIcon: {
    fontSize: 20,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  youBadge: {
    fontSize: 10,
    color: COLORS.background,
    backgroundColor: '#00ff88',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  actionsContainer: {
    alignItems: 'center',
  },
  rematchRequestContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rematchRequestText: {
    fontSize: 16,
    color: COLORS.neonPurple,
    marginBottom: 15,
  },
  rematchButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  acceptButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    letterSpacing: 2,
  },
  declineButton: {
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ff3333',
    backgroundColor: 'rgba(255, 51, 51, 0.1)',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff3333',
    letterSpacing: 2,
  },
  waitingContainer: {
    marginBottom: 20,
  },
  waitingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  rematchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.neonPurple,
    backgroundColor: 'rgba(204, 0, 255, 0.15)',
    marginBottom: 15,
    gap: 10,
  },
  rematchButtonIcon: {
    fontSize: 20,
  },
  rematchButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.neonPurple,
    letterSpacing: 2,
  },
  menuButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  menuButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
});
