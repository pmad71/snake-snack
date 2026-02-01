import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Share,
} from 'react-native';

// Base64 encoding/decoding for React Native
const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

const encodeBase64 = (str: string): string => {
  let output = '';
  let i = 0;
  const input = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  );
  while (i < input.length) {
    const chr1 = input.charCodeAt(i++);
    const chr2 = input.charCodeAt(i++);
    const chr3 = input.charCodeAt(i++);
    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    const enc3 = isNaN(chr2) ? 64 : ((chr2 & 15) << 2) | (chr3 >> 6);
    const enc4 = isNaN(chr3) ? 64 : chr3 & 63;
    output += base64Chars.charAt(enc1) + base64Chars.charAt(enc2) + base64Chars.charAt(enc3) + base64Chars.charAt(enc4);
  }
  return output;
};

const decodeBase64 = (str: string): string => {
  let output = '';
  let i = 0;
  const input = str.replace(/[^A-Za-z0-9+/=]/g, '');
  while (i < input.length) {
    const enc1 = base64Chars.indexOf(input.charAt(i++));
    const enc2 = base64Chars.indexOf(input.charAt(i++));
    const enc3 = base64Chars.indexOf(input.charAt(i++));
    const enc4 = base64Chars.indexOf(input.charAt(i++));
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;
    output += String.fromCharCode(chr1);
    if (enc3 !== 64) output += String.fromCharCode(chr2);
    if (enc4 !== 64) output += String.fromCharCode(chr3);
  }
  return decodeURIComponent(
    output.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  );
};
import { COLORS } from '../constants/game';
import {
  getCoins,
  setCoins,
  getOwnedSkins,
  setOwnedSkins,
  getActiveSkin,
  setActiveSkin,
  getHighScore,
  setHighScore,
  getMusicEnabled,
  setMusicEnabled,
  getSoundEnabled,
  setSoundEnabled,
} from '../utils/storage';

interface SettingsScreenProps {
  onBack: () => void;
}

interface BackupData {
  coins: number;
  skins: string[];
  activeSkin: string;
  highScore: number;
  version: number;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [musicEnabled, setMusicState] = useState(true);
  const [soundEnabled, setSoundState] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [currentData, setCurrentData] = useState<BackupData | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const music = await getMusicEnabled();
    const sound = await getSoundEnabled();
    setMusicState(music);
    setSoundState(sound);
  };

  const toggleMusic = async () => {
    const newValue = !musicEnabled;
    setMusicState(newValue);
    await setMusicEnabled(newValue);
  };

  const toggleSound = async () => {
    const newValue = !soundEnabled;
    setSoundState(newValue);
    await setSoundEnabled(newValue);
  };

  const handleExport = async () => {
    try {
      const coins = await getCoins();
      const skins = await getOwnedSkins();
      const activeSkin = await getActiveSkin();
      const highScore = await getHighScore();

      const data: BackupData = {
        coins,
        skins,
        activeSkin,
        highScore,
        version: 1,
      };

      setCurrentData(data);
      const jsonString = JSON.stringify(data);
      const code = encodeBase64(jsonString);
      setExportCode(code);
      setShowExportModal(true);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się wyeksportować danych');
    }
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: exportCode,
        title: 'Snake Neon - Kod Backupu',
      });
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się udostępnić kodu');
    }
  };

  const handleImport = () => {
    setImportCode('');
    setShowImportModal(true);
  };

  const restoreData = async () => {
    if (!importCode.trim()) {
      Alert.alert('Błąd', 'Wklej kod zapasowy');
      return;
    }

    try {
      const jsonString = decodeBase64(importCode.trim());
      const data: BackupData = JSON.parse(jsonString);

      if (!data.version || !data.skins) {
        throw new Error('Invalid format');
      }

      Alert.alert(
        'Przywrócić dane?',
        `Monety: ${data.coins}\nSkiny: ${data.skins.length}\nNajlepszy wynik: ${data.highScore}`,
        [
          { text: 'Anuluj', style: 'cancel' },
          {
            text: 'Przywróć',
            onPress: async () => {
              await setCoins(data.coins);
              await setOwnedSkins(data.skins);
              await setActiveSkin(data.activeSkin);
              await setHighScore(data.highScore);
              setShowImportModal(false);
              Alert.alert('Sukces!', 'Dane zostały przywrócone. Zrestartuj grę.');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Błąd', 'Nieprawidłowy kod zapasowy. Sprawdź czy skopiowałeś cały kod.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>USTAWIENIA</Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Backup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KOPIA ZAPASOWA</Text>
          <Text style={styles.sectionDesc}>
            Zapisz swoje dane przed aktualizacją gry
          </Text>

          <TouchableOpacity style={styles.optionButton} onPress={handleExport}>
            <Text style={styles.optionIcon}>📤</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionName}>Eksportuj dane</Text>
              <Text style={styles.optionDesc}>Skopiuj kod zapasowy</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={handleImport}>
            <Text style={styles.optionIcon}>📥</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionName}>Importuj dane</Text>
              <Text style={styles.optionDesc}>Przywróć z kodu</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DŹWIĘK</Text>

          <TouchableOpacity style={styles.optionButton} onPress={toggleMusic}>
            <Text style={styles.optionIcon}>🎵</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionName}>Muzyka</Text>
              <Text style={styles.optionDesc}>Muzyka w tle</Text>
            </View>
            <View style={[styles.toggle, musicEnabled && styles.toggleOn]}>
              <Text style={styles.toggleText}>{musicEnabled ? 'WŁ' : 'WYŁ'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={toggleSound}>
            <Text style={styles.optionIcon}>🔊</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionName}>Efekty</Text>
              <Text style={styles.optionDesc}>Dźwięki w grze</Text>
            </View>
            <View style={[styles.toggle, soundEnabled && styles.toggleOn]}>
              <Text style={styles.toggleText}>{soundEnabled ? 'WŁ' : 'WYŁ'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACJE</Text>
          <Text style={styles.infoText}>Snake Neon v1.2.0</Text>
          <Text style={styles.infoText}>Expo SDK 54</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>WRÓĆ</Text>
      </TouchableOpacity>

      {/* Export Modal */}
      <Modal visible={showExportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>KOD ZAPASOWY</Text>

            {currentData && (
              <View style={styles.dataPreview}>
                <Text style={styles.dataPreviewText}>
                  💰 Monety: {currentData.coins}
                </Text>
                <Text style={styles.dataPreviewText}>
                  🐍 Skiny: {currentData.skins.length}
                </Text>
                <Text style={styles.dataPreviewText}>
                  🏆 Rekord: {currentData.highScore}
                </Text>
              </View>
            )}

            <View style={styles.codeContainer}>
              <Text style={styles.codeText} numberOfLines={3} ellipsizeMode="middle">
                {exportCode}
              </Text>
            </View>

            <Text style={styles.modalHint}>
              Zapisz ten kod w bezpiecznym miejscu (notatki, SMS, email)
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={shareCode}>
                <Text style={styles.modalButtonPrimaryText}>📤 UDOSTĘPNIJ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowExportModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>ZAMKNIJ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Import Modal */}
      <Modal visible={showImportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PRZYWRÓĆ DANE</Text>

            <Text style={styles.modalHint}>
              Wklej kod zapasowy poniżej
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={importCode}
                onChangeText={setImportCode}
                placeholder="Wklej kod tutaj..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <Text style={styles.pasteHint}>Przytrzymaj pole tekstowe aby wkleić kod</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={restoreData}>
                <Text style={styles.modalButtonPrimaryText}>PRZYWRÓĆ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowImportModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>ANULUJ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.neonPink,
    letterSpacing: 3,
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  optionArrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleOn: {
    backgroundColor: COLORS.neonGreen,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.neonGreen,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 3,
  },
  dataPreview: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  dataPreviewText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  codeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  codeText: {
    fontSize: 12,
    color: COLORS.neonBlue,
    fontFamily: 'monospace',
  },
  modalHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    gap: 10,
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.neonGreen,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
  },
  modalButtonSecondary: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  modalButtonSecondaryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  inputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    marginBottom: 12,
  },
  input: {
    padding: 16,
    fontSize: 12,
    color: COLORS.text,
    fontFamily: 'monospace',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pasteHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
});
