import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Particle } from '../types';

interface ParticleEffectProps {
  particles: Particle[];
}

const ParticleView = memo(({ particle }: { particle: Particle }) => {
  const size = 4 + particle.life * 4;

  return (
    <View
      style={[
        styles.particle,
        {
          left: particle.x - size / 2,
          top: particle.y - size / 2,
          width: size,
          height: size,
          backgroundColor: particle.color,
          opacity: particle.life,
        },
      ]}
    />
  );
});

export const ParticleEffect = memo(({ particles }: ParticleEffectProps) => {
  if (particles.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleView key={particle.id} particle={particle} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 100,
  },
});
