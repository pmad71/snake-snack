import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/game';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>JAK GRAĆ</Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STEROWANIE</Text>
          <Text style={styles.text}>Przesuń palcem w kierunku, w którym ma iść wąż.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ZASADY</Text>
          <Text style={styles.text}>Zbieraj jedzenie, aby rosnąć i zdobywać punkty.</Text>
          <Text style={styles.text}>Unikaj własnego ogona!</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRYBY GRY</Text>
          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>🎮</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Klasyczny</Text>
              <Text style={styles.powerUpDesc}>Ściany zabijają - unikaj krawędzi!</Text>
            </View>
          </View>
          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>♾️</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Infinity</Text>
              <Text style={styles.powerUpDesc}>Przechodzisz przez ściany na drugą stronę</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRUDNOŚĆ</Text>
          <Text style={styles.text}>🟢 Łatwy - wolny start, mało przyspieszania</Text>
          <Text style={styles.text}>🟡 Normalny - standardowa rozgrywka</Text>
          <Text style={styles.text}>🔴 Trudny - szybki start, duże przyspieszanie</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>POWER-UPY</Text>

          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>🐌</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Spowolnienie</Text>
              <Text style={styles.powerUpDesc}>Wąż porusza się wolniej</Text>
            </View>
          </View>

          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>💎</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Podwójne punkty</Text>
              <Text style={styles.powerUpDesc}>2x więcej punktów za jedzenie</Text>
            </View>
          </View>

          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>✂️</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Skrócenie</Text>
              <Text style={styles.powerUpDesc}>Wąż staje się krótszy</Text>
            </View>
          </View>

          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>👻</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Duch</Text>
              <Text style={styles.powerUpDesc}>Przechodzenie przez ściany</Text>
            </View>
          </View>

          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>🧲</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Magnes</Text>
              <Text style={styles.powerUpDesc}>Jedzenie leci do węża</Text>
            </View>
          </View>

          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>🛡️</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Tarcza</Text>
              <Text style={styles.powerUpDesc}>Nieśmiertelność - nie zginiesz od ogona</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>WRÓĆ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    textAlign: 'center',
    letterSpacing: 6,
    marginBottom: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.neonPink,
    letterSpacing: 3,
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  powerUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
  },
  powerUpIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  powerUpInfo: {
    flex: 1,
  },
  powerUpName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    marginBottom: 2,
  },
  powerUpDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  backButton: {
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    marginBottom: 40,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    textAlign: 'center',
    letterSpacing: 4,
  },
});
