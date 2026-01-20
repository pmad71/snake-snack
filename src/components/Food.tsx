import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Position } from '../types';
import { GAME_CONFIG, COLORS } from '../constants/game';

interface FoodProps {
  position: Position;
}

export const Food = memo(({ position }: FoodProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  const size = GAME_CONFIG.cellSize - 4;
  const centerX = position.x * GAME_CONFIG.cellSize + 2;
  const centerY = position.y * GAME_CONFIG.cellSize + 2;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: centerX,
          top: centerY,
          width: size,
          height: size,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <View style={[styles.food, { width: size, height: size, borderRadius: size / 2 }]} />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  food: {
    backgroundColor: COLORS.food,
  },
});
