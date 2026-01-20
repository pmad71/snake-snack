import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { PowerUp as PowerUpType } from '../types';
import { GAME_CONFIG, POWER_UPS, POWER_UP_LIFETIME } from '../constants/game';

interface PowerUpProps {
  powerUp: PowerUpType;
}

export const PowerUp = memo(({ powerUp }: PowerUpProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const config = POWER_UPS.find(p => p.type === powerUp.type);
  if (!config) return null;

  const timeLeft = POWER_UP_LIFETIME - (Date.now() - powerUp.spawnTime);
  const isBlinking = timeLeft < 3000;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  useEffect(() => {
    if (isBlinking) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();
      return () => blinkAnimation.stop();
    }
  }, [isBlinking]);

  const size = GAME_CONFIG.cellSize - 2;
  const x = powerUp.x * GAME_CONFIG.cellSize + 1;
  const y = powerUp.y * GAME_CONFIG.cellSize + 1;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor: config.color,
          transform: [{ scale: pulseAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={styles.icon}>{config.icon}</Text>
    </Animated.View>
  );
});

interface ActivePowerUpDisplayProps {
  type: string;
  remainingTime: number;
}

export const ActivePowerUpDisplay = memo(({ type, remainingTime }: ActivePowerUpDisplayProps) => {
  const config = POWER_UPS.find(p => p.type === type);
  if (!config) return null;

  const seconds = Math.ceil(remainingTime / 1000);

  return (
    <View style={[styles.activeContainer, { backgroundColor: config.color + '33' }]}>
      <Text style={styles.activeIcon}>{config.icon}</Text>
      <Text style={[styles.activeText, { color: config.color }]}>
        {config.name} {seconds}s
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 14,
  },
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  activeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  activeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
