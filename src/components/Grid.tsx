import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { GAME_CONFIG, COLORS } from '../constants/game';

export const Grid = memo(() => {
  const horizontalLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= GAME_CONFIG.gridHeight; i++) {
      lines.push(
        <View
          key={`h-${i}`}
          style={[
            styles.horizontalLine,
            {
              top: i * GAME_CONFIG.cellSize,
              width: GAME_CONFIG.gridWidth * GAME_CONFIG.cellSize,
            },
          ]}
        />
      );
    }
    return lines;
  }, []);

  const verticalLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= GAME_CONFIG.gridWidth; i++) {
      lines.push(
        <View
          key={`v-${i}`}
          style={[
            styles.verticalLine,
            {
              left: i * GAME_CONFIG.cellSize,
              height: GAME_CONFIG.gridHeight * GAME_CONFIG.cellSize,
            },
          ]}
        />
      );
    }
    return lines;
  }, []);

  return (
    <View style={styles.container}>
      {horizontalLines}
      {verticalLines}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    height: 1,
    backgroundColor: COLORS.grid,
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    width: 1,
    backgroundColor: COLORS.grid,
  },
});
