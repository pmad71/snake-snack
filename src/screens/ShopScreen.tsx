import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, CELL_SIZE } from '../constants/game';
import { SNAKE_SKINS } from '../constants/skins';
import { SnakeSkin } from '../types';
import {
  getCoins,
  getOwnedSkins,
  getActiveSkin,
  setActiveSkin,
  buySkin,
} from '../utils/storage';

interface ShopScreenProps {
  onBack: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ onBack }) => {
  const [coins, setCoins] = useState(0);
  const [ownedSkins, setOwnedSkins] = useState<string[]>([]);
  const [activeSkin, setActiveSkinState] = useState('neon_green');

  const loadData = useCallback(async () => {
    const [coinsData, owned, active] = await Promise.all([
      getCoins(),
      getOwnedSkins(),
      getActiveSkin(),
    ]);
    setCoins(coinsData);
    setOwnedSkins(owned);
    setActiveSkinState(active);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBuySkin = async (skin: SnakeSkin) => {
    if (coins < skin.price) {
      Alert.alert('Brak monet', `Potrzebujesz ${skin.price - coins} monet.`);
      return;
    }

    Alert.alert(
      'Kup skin',
      `Czy chcesz kupić "${skin.name}" za ${skin.price} monet?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Kup',
          onPress: async () => {
            const success = await buySkin(skin.id, skin.price);
            if (success) {
              await loadData();
              Alert.alert('Sukces!', `Kupiłeś skin "${skin.name}"!`);
            }
          },
        },
      ]
    );
  };

  const handleSelectSkin = async (skinId: string) => {
    await setActiveSkin(skinId);
    setActiveSkinState(skinId);
  };

  const renderSnakePreview = (skin: SnakeSkin) => {
    const segments = [0, 1, 2, 3, 4];
    return (
      <View style={styles.previewContainer}>
        {segments.map((i) => {
          const progress = i / (segments.length - 1);
          const r1 = parseInt(skin.colors[0].slice(1, 3), 16);
          const g1 = parseInt(skin.colors[0].slice(3, 5), 16);
          const b1 = parseInt(skin.colors[0].slice(5, 7), 16);
          const r2 = parseInt(skin.colors[1].slice(1, 3), 16);
          const g2 = parseInt(skin.colors[1].slice(3, 5), 16);
          const b2 = parseInt(skin.colors[1].slice(5, 7), 16);

          const r = Math.round(r1 + (r2 - r1) * progress);
          const g = Math.round(g1 + (g2 - g1) * progress);
          const b = Math.round(b1 + (b2 - b1) * progress);
          const color = `rgb(${r}, ${g}, ${b})`;

          return (
            <View
              key={i}
              style={[
                styles.previewSegment,
                {
                  backgroundColor: color,
                  borderRadius: i === 0 ? 8 : 4,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderSkinItem = (skin: SnakeSkin) => {
    const isOwned = ownedSkins.includes(skin.id);
    const isActive = activeSkin === skin.id;
    const canAfford = coins >= skin.price;

    return (
      <View
        key={skin.id}
        style={[
          styles.skinItem,
          isActive && styles.skinItemActive,
        ]}
      >
        <View style={styles.skinInfo}>
          {renderSnakePreview(skin)}
          <View style={styles.skinDetails}>
            <Text style={styles.skinName}>{skin.name}</Text>
            <Text style={styles.skinDescription}>{skin.description}</Text>
          </View>
        </View>

        <View style={styles.skinAction}>
          {isOwned ? (
            isActive ? (
              <View style={styles.activeButton}>
                <Text style={styles.activeButtonText}>AKTYWNY</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleSelectSkin(skin.id)}
              >
                <Text style={styles.selectButtonText}>WYBIERZ</Text>
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity
              style={[
                styles.buyButton,
                !canAfford && styles.buyButtonDisabled,
              ]}
              onPress={() => handleBuySkin(skin)}
              disabled={!canAfford}
            >
              <Text style={styles.coinIcon}>🪙</Text>
              <Text
                style={[
                  styles.buyButtonText,
                  !canAfford && styles.buyButtonTextDisabled,
                ]}
              >
                {skin.price}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SKLEP</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinIcon}>🪙</Text>
          <Text style={styles.coinsText}>{coins}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>SKINY WĘŻA</Text>
        {SNAKE_SKINS.map(renderSkinItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.text,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    letterSpacing: 3,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  coinIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 15,
  },
  skinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    marginBottom: 10,
  },
  skinItemActive: {
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  skinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  previewSegment: {
    width: 16,
    height: 16,
    marginRight: 2,
  },
  skinDetails: {
    flex: 1,
  },
  skinName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  skinDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  skinAction: {
    marginLeft: 10,
  },
  activeButton: {
    backgroundColor: COLORS.neonGreen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  selectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.neonGreen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#ffd700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonDisabled: {
    opacity: 0.5,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  buyButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
});
