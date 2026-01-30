import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS, DIFFICULTIES } from '../constants/game';
import { LeaderboardEntry, GameMode, Difficulty } from '../types';
import { fetchLeaderboard } from '../utils/api';

interface LeaderboardScreenProps {
  onBack: () => void;
  playerNickname?: string | null;
}

type FilterMode = GameMode | 'ALL';
type FilterDifficulty = Difficulty | 'ALL';

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  onBack,
  playerNickname,
}) => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('ALL');

  const loadScores = useCallback(async () => {
    const mode = filterMode === 'ALL' ? null : filterMode;
    const difficulty = filterDifficulty === 'ALL' ? null : filterDifficulty;
    const data = await fetchLeaderboard(mode, difficulty);
    setScores(data.slice(0, 10)); // TOP 10
  }, [filterMode, filterDifficulty]);

  useEffect(() => {
    setLoading(true);
    loadScores().finally(() => setLoading(false));
  }, [loadScores]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadScores();
    setRefreshing(false);
  };

  const getModeLabel = (mode: GameMode) => {
    return mode === 'CLASSIC' ? 'Klasyczny' : 'Infinity';
  };

  const getDifficultyLabel = (difficulty: Difficulty) => {
    return DIFFICULTIES[difficulty]?.name || difficulty;
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return { color: '#FFD700' }; // Gold
      case 2:
        return { color: '#C0C0C0' }; // Silver
      case 3:
        return { color: '#CD7F32' }; // Bronze
      default:
        return { color: COLORS.text };
    }
  };

  const getPositionEmoji = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${position}.`;
    }
  };

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const position = index + 1;
    const isPlayer = playerNickname && item.nickname === playerNickname;

    return (
      <View style={[styles.row, isPlayer && styles.rowHighlight]}>
        <View style={styles.positionContainer}>
          <Text style={[styles.position, getPositionStyle(position)]}>
            {getPositionEmoji(position)}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.nickname, isPlayer && styles.nicknameHighlight]}>
            {item.nickname}
          </Text>
          <Text style={styles.details}>
            {getModeLabel(item.mode)} • {getDifficultyLabel(item.difficulty)}
          </Text>
        </View>
        <Text style={[styles.score, getPositionStyle(position)]}>
          {item.score}
        </Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Brak wyników</Text>
      <Text style={styles.emptySubtext}>Bądź pierwszy!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏆 TOP 10</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>TRYB:</Text>
          <View style={styles.filterButtons}>
            {(['ALL', 'CLASSIC', 'INFINITE'] as FilterMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.filterButton,
                  filterMode === mode && styles.filterButtonActive,
                ]}
                onPress={() => setFilterMode(mode)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterMode === mode && styles.filterButtonTextActive,
                  ]}
                >
                  {mode === 'ALL' ? 'Wszystkie' : mode === 'CLASSIC' ? 'Klasyczny' : 'Infinity'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>TRUDNOŚĆ:</Text>
          <View style={styles.filterButtons}>
            {(['ALL', 'EASY', 'NORMAL', 'HARD'] as FilterDifficulty[]).map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.filterButton,
                  filterDifficulty === diff && styles.filterButtonActivePink,
                ]}
                onPress={() => setFilterDifficulty(diff)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterDifficulty === diff && styles.filterButtonTextActivePink,
                  ]}
                >
                  {diff === 'ALL' ? 'Wszystkie' : DIFFICULTIES[diff]?.name || diff}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.neonGreen} />
          <Text style={styles.loadingText}>Ładowanie...</Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.neonGreen}
              colors={[COLORS.neonGreen]}
            />
          }
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
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
    fontSize: 24,
    color: COLORS.text,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    letterSpacing: 3,
  },
  placeholder: {
    width: 44,
  },
  filtersContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  filterButtonActive: {
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
  },
  filterButtonActivePink: {
    borderColor: COLORS.neonPink,
    backgroundColor: 'rgba(255, 0, 102, 0.15)',
  },
  filterButtonText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: COLORS.neonGreen,
  },
  filterButtonTextActivePink: {
    color: COLORS.neonPink,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  rowHighlight: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderColor: COLORS.neonGreen,
  },
  positionContainer: {
    width: 40,
    alignItems: 'center',
  },
  position: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  nickname: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  nicknameHighlight: {
    color: COLORS.neonGreen,
  },
  details: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  score: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.neonGreen,
  },
});
