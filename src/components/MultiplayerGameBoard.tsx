import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Food } from './Food';
import { GAME_CONFIG, COLORS } from '../constants/game';
import { SnakeData } from '../utils/socket';

// Viewport size (what player sees) - same as single player
const VIEWPORT_WIDTH = 12;
const VIEWPORT_HEIGHT = 18;
const RENDER_MARGIN = 3; // Render extra cells around viewport

interface MultiplayerGameBoardProps {
  snakes: SnakeData[];
  food: { x: number; y: number } | null;
  myNickname: string;
  boardWidth?: number;
  boardHeight?: number;
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
  cameraX: number;
  cameraY: number;
}

const MultiplayerSnakeSegment = memo(
  ({ segment, index, total, headColor, tailColor, isAlive, isHead, cameraX, cameraY }: MultiplayerSnakeSegmentProps) => {
    const factor = total > 1 ? index / (total - 1) : 0;
    let color = interpolateColor(headColor, tailColor, factor);

    // Gray out dead snake
    if (!isAlive) {
      color = '#444444';
    }

    const size = GAME_CONFIG.cellSize - 2;

    // Position relative to camera
    const left = (segment.x - cameraX) * GAME_CONFIG.cellSize + 1;
    const top = (segment.y - cameraY) * GAME_CONFIG.cellSize + 1;

    return (
      <View
        style={[
          styles.segment,
          {
            left,
            top,
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
  cameraX: number;
  cameraY: number;
}

const MultiplayerSnake = memo(({ snake, cameraX, cameraY }: MultiplayerSnakeProps) => {
  const headColor = snake.color || '#00ff88';
  const tailColor = darkenColor(headColor, 0.3);

  // Filter visible segments only
  const visibleSegments = snake.segments.filter(segment => {
    return (
      segment.x >= cameraX - RENDER_MARGIN &&
      segment.x < cameraX + VIEWPORT_WIDTH + RENDER_MARGIN &&
      segment.y >= cameraY - RENDER_MARGIN &&
      segment.y < cameraY + VIEWPORT_HEIGHT + RENDER_MARGIN
    );
  });

  return (
    <>
      {visibleSegments.map((segment) => {
        const originalIndex = snake.segments.findIndex(s => s.id === segment.id);
        return (
          <MultiplayerSnakeSegment
            key={segment.id}
            segment={segment}
            index={originalIndex}
            total={snake.segments.length}
            headColor={headColor}
            tailColor={tailColor}
            isAlive={snake.alive}
            isHead={originalIndex === 0}
            cameraX={cameraX}
            cameraY={cameraY}
          />
        );
      })}
    </>
  );
});

// Mini-map component
interface MiniMapProps {
  snakes: SnakeData[];
  food: { x: number; y: number } | null;
  boardWidth: number;
  boardHeight: number;
  cameraX: number;
  cameraY: number;
  myNickname: string;
}

const MiniMap = memo(({ snakes, food, boardWidth, boardHeight, cameraX, cameraY, myNickname }: MiniMapProps) => {
  const mapWidth = 60;
  const mapHeight = 90;
  const scaleX = mapWidth / boardWidth;
  const scaleY = mapHeight / boardHeight;

  return (
    <View style={[styles.miniMap, { width: mapWidth, height: mapHeight }]}>
      {/* Viewport indicator */}
      <View
        style={[
          styles.miniMapViewport,
          {
            left: cameraX * scaleX,
            top: cameraY * scaleY,
            width: VIEWPORT_WIDTH * scaleX,
            height: VIEWPORT_HEIGHT * scaleY,
          },
        ]}
      />

      {/* Food */}
      {food && (
        <View
          style={[
            styles.miniMapFood,
            {
              left: food.x * scaleX,
              top: food.y * scaleY,
            },
          ]}
        />
      )}

      {/* Snake heads */}
      {snakes.map((snake) => {
        if (snake.segments.length === 0) return null;
        const head = snake.segments[0];
        const isMe = snake.nickname === myNickname;
        return (
          <View
            key={snake.nickname}
            style={[
              styles.miniMapSnake,
              {
                left: head.x * scaleX - 3,
                top: head.y * scaleY - 3,
                backgroundColor: snake.color,
                borderWidth: isMe ? 2 : 0,
                borderColor: '#fff',
              },
            ]}
          />
        );
      })}
    </View>
  );
});

// Grid for visible area only
const VisibleGrid = memo(({ cameraX, cameraY, boardWidth, boardHeight }: {
  cameraX: number;
  cameraY: number;
  boardWidth: number;
  boardHeight: number;
}) => {
  const lines = [];
  const cellSize = GAME_CONFIG.cellSize;

  // Vertical lines
  for (let x = 0; x <= VIEWPORT_WIDTH; x++) {
    const worldX = cameraX + x;
    if (worldX >= 0 && worldX <= boardWidth) {
      lines.push(
        <View
          key={`v-${x}`}
          style={[
            styles.gridLine,
            {
              left: x * cellSize,
              top: 0,
              width: 1,
              height: VIEWPORT_HEIGHT * cellSize,
            },
          ]}
        />
      );
    }
  }

  // Horizontal lines
  for (let y = 0; y <= VIEWPORT_HEIGHT; y++) {
    const worldY = cameraY + y;
    if (worldY >= 0 && worldY <= boardHeight) {
      lines.push(
        <View
          key={`h-${y}`}
          style={[
            styles.gridLine,
            {
              left: 0,
              top: y * cellSize,
              width: VIEWPORT_WIDTH * cellSize,
              height: 1,
            },
          ]}
        />
      );
    }
  }

  return <>{lines}</>;
});

export const MultiplayerGameBoard = memo(
  ({ snakes, food, myNickname, boardWidth = 24, boardHeight = 36 }: MultiplayerGameBoardProps) => {
    const viewportWidth = VIEWPORT_WIDTH * GAME_CONFIG.cellSize;
    const viewportHeight = VIEWPORT_HEIGHT * GAME_CONFIG.cellSize;

    // Find my snake
    const mySnake = snakes.find((s) => s.nickname === myNickname);
    const opponentSnake = snakes.find((s) => s.nickname !== myNickname);

    // Calculate camera position directly during render (not in useEffect!)
    const cameraX = useMemo(() => {
      if (!mySnake || mySnake.segments.length === 0) return 0;
      const head = mySnake.segments[0];
      return Math.max(0, Math.min(
        head.x - Math.floor(VIEWPORT_WIDTH / 2),
        boardWidth - VIEWPORT_WIDTH
      ));
    }, [mySnake?.segments[0]?.x, boardWidth]);

    const cameraY = useMemo(() => {
      if (!mySnake || mySnake.segments.length === 0) return 0;
      const head = mySnake.segments[0];
      return Math.max(0, Math.min(
        head.y - Math.floor(VIEWPORT_HEIGHT / 2),
        boardHeight - VIEWPORT_HEIGHT
      ));
    }, [mySnake?.segments[0]?.y, boardHeight]);

    // Check if food is visible
    const isFoodVisible = food && (
      food.x >= cameraX - RENDER_MARGIN &&
      food.x < cameraX + VIEWPORT_WIDTH + RENDER_MARGIN &&
      food.y >= cameraY - RENDER_MARGIN &&
      food.y < cameraY + VIEWPORT_HEIGHT + RENDER_MARGIN
    );

    // Food position relative to camera
    const foodRelativePos = food ? {
      x: food.x - cameraX,
      y: food.y - cameraY,
    } : null;

    // Sort snakes so opponent renders first (below) and player renders on top
    const sortedSnakes = [...snakes].sort((a, b) => {
      if (a.nickname === myNickname) return 1;
      if (b.nickname === myNickname) return -1;
      return 0;
    });

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

        {/* Game Board (Viewport) */}
        <View
          style={[
            styles.board,
            {
              width: viewportWidth,
              height: viewportHeight,
            },
          ]}
        >
          {/* Grid */}
          <VisibleGrid
            cameraX={cameraX}
            cameraY={cameraY}
            boardWidth={boardWidth}
            boardHeight={boardHeight}
          />

          {/* Food (if visible) */}
          {isFoodVisible && foodRelativePos && (
            <View
              style={[
                styles.foodContainer,
                {
                  left: foodRelativePos.x * GAME_CONFIG.cellSize,
                  top: foodRelativePos.y * GAME_CONFIG.cellSize,
                },
              ]}
            >
              <Food position={{ x: 0, y: 0 }} />
            </View>
          )}

          {/* Render all snakes */}
          {sortedSnakes.map((snake) => (
            <MultiplayerSnake
              key={snake.nickname}
              snake={snake}
              cameraX={cameraX}
              cameraY={cameraY}
            />
          ))}

          {/* Edge indicators when near board boundaries */}
          {cameraX <= 0 && <View style={[styles.edgeIndicator, styles.edgeLeft]} />}
          {cameraX >= boardWidth - VIEWPORT_WIDTH && <View style={[styles.edgeIndicator, styles.edgeRight]} />}
          {cameraY <= 0 && <View style={[styles.edgeIndicator, styles.edgeTop]} />}
          {cameraY >= boardHeight - VIEWPORT_HEIGHT && <View style={[styles.edgeIndicator, styles.edgeBottom]} />}
        </View>

        {/* Mini-map */}
        <MiniMap
          snakes={snakes}
          food={food}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          cameraX={cameraX}
          cameraY={cameraY}
          myNickname={myNickname}
        />

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
  foodContainer: {
    position: 'absolute',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: COLORS.grid,
  },
  // Mini-map styles
  miniMap: {
    position: 'absolute',
    right: 10,
    top: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 1,
    borderColor: COLORS.gridBorder,
    borderRadius: 4,
  },
  miniMapViewport: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  miniMapSnake: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  miniMapFood: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.food,
  },
  // Edge indicators
  edgeIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  edgeLeft: {
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  edgeRight: {
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  edgeTop: {
    left: 0,
    right: 0,
    top: 0,
    height: 3,
  },
  edgeBottom: {
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
  },
  hint: {
    marginTop: 20,
    marginBottom: 40,
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
});
