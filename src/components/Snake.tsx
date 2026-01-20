import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SnakeSegment } from '../types';
import { GAME_CONFIG, COLORS } from '../constants/game';

interface SnakeProps {
  segments: SnakeSegment[];
}

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

const SnakeSegmentView = memo(
  ({ segment, index, total }: { segment: SnakeSegment; index: number; total: number }) => {
    const factor = total > 1 ? index / (total - 1) : 0;
    const color = interpolateColor(COLORS.snakeHead, COLORS.snakeTail, factor);
    const isHead = index === 0;
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
          },
        ]}
      >
        {isHead && (
          <>
            <View style={[styles.eye, styles.leftEye]} />
            <View style={[styles.eye, styles.rightEye]} />
          </>
        )}
      </View>
    );
  }
);

export const Snake = memo(({ segments }: SnakeProps) => {
  return (
    <>
      {segments.map((segment, index) => (
        <SnakeSegmentView
          key={segment.id}
          segment={segment}
          index={index}
          total={segments.length}
        />
      ))}
    </>
  );
});

const styles = StyleSheet.create({
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
});
