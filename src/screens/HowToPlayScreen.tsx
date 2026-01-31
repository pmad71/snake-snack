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

          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>⚡</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Turbo</Text>
              <Text style={styles.powerUpDesc}>Wąż porusza się 2x szybciej przez 4s</Text>
            </View>
          </View>

          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>🍕</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Multi-Food</Text>
              <Text style={styles.powerUpDesc}>5 jedzenia na planszy przez 8s</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMBO</Text>
          <Text style={styles.text}>Jedz szybko (poniżej 3s) aby budować combo!</Text>
          <Text style={styles.text}>Mnożnik punktów: x1 → x2 → x3 → x4 (max)</Text>
          <Text style={styles.text}>Combo resetuje się po 3s bez jedzenia.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 SKLEP</Text>
          <Text style={styles.text}>Za każdy punkt dostajesz monetkę! 🪙</Text>
          <Text style={styles.text}>Monety zbierasz z każdej gry - nie przepadają!</Text>
          <Text style={styles.textHighlight}>Co można kupić?</Text>
          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>🐍</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Skórki węża</Text>
              <Text style={styles.powerUpDesc}>Zmień kolor swojego węża na różowy, niebieski, złoty i więcej!</Text>
            </View>
          </View>
          <Text style={styles.text}>Wejdź do sklepu przez przycisk 🎨 na ekranie głównym.</Text>
          <Text style={styles.textFun}>Graj więcej = więcej monet = więcej style'u! 😎</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 MULTIPLAYER</Text>
          <Text style={styles.text}>Graj z kolegą online!</Text>
          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>⚡</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Szybka gra</Text>
              <Text style={styles.powerUpDesc}>Znajdź losowego przeciwnika i walczcie!</Text>
            </View>
          </View>
          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>🔑</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Prywatny pokój</Text>
              <Text style={styles.powerUpDesc}>Stwórz pokój i podaj kod znajomemu</Text>
            </View>
          </View>
          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>🗺️</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Duża arena</Text>
              <Text style={styles.powerUpDesc}>Plansza 4x większa! Kamera podąża za Tobą</Text>
            </View>
          </View>
          <View style={styles.powerUpRow}>
            <Text style={styles.powerUpIcon}>📍</Text>
            <View style={styles.powerUpInfo}>
              <Text style={styles.powerUpName}>Mini-mapa</Text>
              <Text style={styles.powerUpDesc}>Widzisz pozycję przeciwnika w rogu ekranu</Text>
            </View>
          </View>
          <Text style={styles.textFun}>Kto pierwszy do 200 punktów wygrywa! 🏆</Text>
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
  textHighlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 8,
  },
  textFun: {
    fontSize: 14,
    color: '#ffd700',
    lineHeight: 22,
    marginTop: 8,
    fontStyle: 'italic',
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
