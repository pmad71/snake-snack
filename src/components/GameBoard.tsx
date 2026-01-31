import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Snake } from './Snake';
import { Food } from './Food';
import { Grid } from './Grid';
import { ParticleEffect } from './ParticleEffect';
import { PowerUp as PowerUpComponent, ActivePowerUpDisplay } from './PowerUp';
import { SnakeSegment, Position, Particle, PowerUp, ActivePowerUp } from '../types';
import { GAME_CONFIG, COLORS } from '../constants/game';

interface GameBoardProps {
  snake: SnakeSegment[];
  food: Position;
  particles: Particle[];
  score: number;
  isPaused?: boolean;
  powerUp?: PowerUp | null;
  activePowerUp?: ActivePowerUp | null;
  activePowerUpRemaining?: number;
  extraFoods?: Position[];
  combo?: number;
}

export const GameBoard = memo(
  ({ snake, food, particles, score, isPaused, powerUp, activePowerUp, activePowerUpRemaining, extraFoods, combo }: GameBoardProps) => {
    const boardWidth = GAME_CONFIG.gridWidth * GAME_CONFIG.cellSize;
    const boardHeight = GAME_CONFIG.gridHeight * GAME_CONFIG.cellSize;

    return (
      <View style={styles.container}>
        <View style={styles.scoreContainer}>
          {activePowerUp && activePowerUpRemaining !== undefined && activePowerUpRemaining > 0 && (
            <ActivePowerUpDisplay
              type={activePowerUp.type}
              remainingTime={activePowerUpRemaining}
            />
          )}
          <Text style={styles.scoreLabel}>WYNIK</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>{score}</Text>
            {combo && combo > 1 && (
              <Text style={styles.comboText}>x{combo}</Text>
            )}
          </View>
        </View>

        <Text style={styles.specialVersion}>IGNACY SPECIAL VERSION</Text>

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
          <Food position={food} />
          {extraFoods && extraFoods.map((pos, index) => (
            <Food key={`extra-${index}`} position={pos} />
          ))}
          {powerUp && <PowerUpComponent powerUp={powerUp} />}
          <Snake segments={snake} />
          <ParticleEffect particles={particles} />

          {isPaused && (
            <View style={styles.pauseOverlay}>
              <Text style={styles.pauseText}>PAUZA</Text>
            </View>
          )}
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
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    color: COLORS.neonGreen,
    fontWeight: 'bold',
  },
  comboText: {
    fontSize: 24,
    color: '#ff8800',
    fontWeight: 'bold',
    marginLeft: 8,
    textShadowColor: '#ff8800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  specialVersion: {
    fontSize: 10,
    color: COLORS.neonGreen,
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  board: {
    backgroundColor: 'rgba(0, 20, 10, 0.5)',
    borderWidth: 2,
    borderColor: COLORS.gridBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseText: {
    fontSize: 32,
    color: COLORS.neonGreen,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  hint: {
    marginTop: 20,
    marginBottom: 40,
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
});
