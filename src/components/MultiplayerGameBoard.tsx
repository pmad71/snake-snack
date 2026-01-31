import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Food } from './Food';
import { Grid } from './Grid';
import { GAME_CONFIG, COLORS } from '../constants/game';
import { SnakeData } from '../utils/socket';

interface MultiplayerGameBoardProps {
  snakes: SnakeData[];
  food: { x: number; y: number } | null;
  myNickname: string;
}

// Color interpolation function
const interpolateColor = (
  color1: string,
  color2: string,
  factor: number
): string => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Darken color for tail
const darkenColor = (color: string, factor: number = 0.5): string => {
  const hex = color.replace('#', '');
  const r = Math.round(parseInt(hex.substring(0, 2), 16) * factor);
  const g = Math.round(parseInt(hex.substring(2, 4), 16) * factor);
  const b = Math.round(parseInt(hex.substring(4, 6), 16) * factor);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

interface MultiplayerSnakeSegmentProps {
  segment: { x: number; y: number; id: string };
  index: number;
  total: number;
  headColor: string;
  tailColor: string;
  isAlive: boolean;
  isHead: boolean;
}

const MultiplayerSnakeSegment = memo(
  ({ segment, index, total, headColor, tailColor, isAlive, isHead }: MultiplayerSnakeSegmentProps) => {
    const factor = total > 1 ? index / (total - 1) : 0;
    let color = interpolateColor(headColor, tailColor, factor);

    // Gray out dead snake
    if (!isAlive) {
      color = '#444444';
    }

    const size = GAME_CONFIG.cellSize - 2;

    return (
      <View
        style={[
          styles.segment,
          {
            left: segment.x * GAME_CONFIG.cellSize + 1,
            top: segment.y * GAME_CONFIG.cellSize + 1,
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: isHead ? size / 2 : size / 4,
            opacity: isAlive ? 1 : 0.5,
          },
        ]}
      >
        {isHead && isAlive && (
          <>
            <View style={[styles.eye, styles.leftEye]} />
            <View style={[styles.eye, styles.rightEye]} />
          </>
        )}
        {isHead && !isAlive && (
          <Text style={styles.deadMarker}>X</Text>
        )}
      </View>
    );
  }
);

interface MultiplayerSnakeProps {
  snake: SnakeData;
}

const MultiplayerSnake = memo(({ snake }: MultiplayerSnakeProps) => {
  const headColor = snake.color || '#00ff88';
  const tailColor = darkenColor(headColor, 0.3);

  return (
    <>
      {snake.segments.map((segment, index) => (
        <MultiplayerSnakeSegment
          key={segment.id}
          segment={segment}
          index={index}
          total={snake.segments.length}
          headColor={headColor}
          tailColor={tailColor}
          isAlive={snake.alive}
          isHead={index === 0}
        />
      ))}
    </>
  );
});

export const MultiplayerGameBoard = memo(
  ({ snakes, food, myNickname }: MultiplayerGameBoardProps) => {
    const boardWidth = GAME_CONFIG.gridWidth * GAME_CONFIG.cellSize;
    const boardHeight = GAME_CONFIG.gridHeight * GAME_CONFIG.cellSize;

    // Sort snakes so opponent renders first (below) and player renders on top
    const sortedSnakes = [...snakes].sort((a, b) => {
      if (a.nickname === myNickname) return 1;
      if (b.nickname === myNickname) return -1;
      return 0;
    });

    // Find my snake and opponent
    const mySnake = snakes.find((s) => s.nickname === myNickname);
    const opponentSnake = snakes.find((s) => s.nickname !== myNickname);

    return (
      <View style={styles.container}>
        {/* Score Display */}
        <View style={styles.scoresContainer}>
          {/* My Score */}
          <View style={styles.scoreBox}>
            <Text style={[styles.playerName, { color: mySnake?.color || '#00ff88' }]}>
              {mySnake?.nickname || 'TY'}
            </Text>
            <Text style={[styles.scoreValue, { color: mySnake?.color || '#00ff88' }]}>
              {mySnake?.score || 0}
            </Text>
            {mySnake && !mySnake.alive && (
              <Text style={styles.deadLabel}>MARTWY</Text>
            )}
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
            <Text style={styles.targetText}>do 200</Text>
          </View>

          {/* Opponent Score */}
          <View style={styles.scoreBox}>
            <Text style={[styles.playerName, { color: opponentSnake?.color || '#ff0066' }]}>
              {opponentSnake?.nickname || '???'}
            </Text>
            <Text style={[styles.scoreValue, { color: opponentSnake?.color || '#ff0066' }]}>
              {opponentSnake?.score || 0}
            </Text>
            {opponentSnake && !opponentSnake.alive && (
              <Text style={styles.deadLabel}>MARTWY</Text>
            )}
          </View>
        </View>

        {/* Game Board */}
        <View
          style={[
            styles.board,
            {
              width: boardWidth,
              height: boardHeight,
            },
          ]}
        >
          <Grid />

          {/* Food */}
          {food && <Food position={food} />}

          {/* Render all snakes */}
          {sortedSnakes.map((snake) => (
            <MultiplayerSnake key={snake.nickname} snake={snake} />
          ))}
        </View>

        <Text style={styles.hint}>Przesuń palcem, aby sterować</Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  scoreBox: {
    flex: 1,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  deadLabel: {
    fontSize: 10,
    color: '#ff3333',
    marginTop: 2,
    fontWeight: 'bold',
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  vsText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  targetText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  board: {
    backgroundColor: 'rgba(0, 20, 10, 0.5)',
    borderWidth: 2,
    borderColor: COLORS.gridBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  segment: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eye: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2,
    top: '25%',
  },
  leftEye: {
    left: '20%',
  },
  rightEye: {
    right: '20%',
  },
  deadMarker: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff0000',
  },
  hint: {
    marginTop: 20,
    marginBottom: 40,
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
});
