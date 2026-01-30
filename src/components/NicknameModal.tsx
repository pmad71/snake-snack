import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/game';

interface NicknameModalProps {
  visible: boolean;
  onSave: (nickname: string) => void;
}

export const NicknameModal: React.FC<NicknameModalProps> = ({ visible, onSave }) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setError('Min. 2 znaki');
      return;
    }
    if (trimmed.length > 20) {
      setError('Max. 20 znaków');
      return;
    }
    setError('');
    onSave(trimmed);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <Text style={styles.title}>PODAJ SWÓJ NICK</Text>
          <Text style={styles.subtitle}>Będzie widoczny w tabeli wyników</Text>

          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={(text) => {
              setNickname(text);
              setError('');
            }}
            placeholder="Twój nick..."
            placeholderTextColor={COLORS.textSecondary}
            maxLength={20}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.saveButton,
              nickname.trim().length < 2 && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>ZAPISZ</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  container: {
    width: '85%',
    maxWidth: 350,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.neonGreen,
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.neonGreen,
    letterSpacing: 3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderColor: COLORS.neonGreen,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 18,
    color: COLORS.text,
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    textAlign: 'center',
  },
  error: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.neonPink,
  },
  saveButton: {
    marginTop: 25,
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: COLORS.neonGreen,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 3,
  },
});
