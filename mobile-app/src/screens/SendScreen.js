import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function SendScreen({ navigation }) {
  const { cryptos } = useWallet();
  const { colors } = useTheme();
  const [selectedCrypto, setSelectedCrypto] = useState(cryptos[0]);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [showCryptoList, setShowCryptoList] = useState(false);

  const handleSend = () => {
    if (!amount || !address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (parseFloat(amount) > selectedCrypto.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ${selectedCrypto.symbol} to ${address.substring(0, 10)}...?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Success', 'Transaction sent successfully');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleScanQR = () => {
    Alert.alert('QR Scanner', 'QR scanner feature coming soon');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Select Cryptocurrency</Text>
          <TouchableOpacity
            style={[styles.cryptoSelector, { backgroundColor: colors.surface }]}
            onPress={() => setShowCryptoList(!showCryptoList)}
          >
            <View style={styles.cryptoInfo}>
              <View style={[styles.cryptoIcon, { backgroundColor: selectedCrypto.color }]}>
                <Text style={styles.cryptoSymbol}>{selectedCrypto.symbol.charAt(0)}</Text>
              </View>
              <View>
                <Text style={[styles.cryptoName, { color: colors.text }]}>
                  {selectedCrypto.name}
                </Text>
                <Text style={[styles.cryptoBalance, { color: colors.textSecondary }]}>
                  Balance: {selectedCrypto.balance.toFixed(6)} {selectedCrypto.symbol}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {showCryptoList && (
            <View style={[styles.cryptoList, { backgroundColor: colors.surface }]}>
              {cryptos.map((crypto) => (
                <TouchableOpacity
                  key={crypto.id}
                  style={styles.cryptoItem}
                  onPress={() => {
                    setSelectedCrypto(crypto);
                    setShowCryptoList(false);
                  }}
                >
                  <View style={styles.cryptoInfo}>
                    <View style={[styles.cryptoIcon, { backgroundColor: crypto.color }]}>
                      <Text style={styles.cryptoSymbol}>{crypto.symbol.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={[styles.cryptoName, { color: colors.text }]}>
                        {crypto.name}
                      </Text>
                      <Text style={[styles.cryptoBalance, { color: colors.textSecondary }]}>
                        {crypto.balance.toFixed(6)} {crypto.symbol}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            ≈ ${(parseFloat(amount) * selectedCrypto.price || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Recipient Address</Text>
          <View style={styles.addressInputContainer}>
            <TextInput
              style={[
                styles.input,
                styles.addressInput,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              placeholder="Enter wallet address"
              placeholderTextColor={colors.textSecondary}
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
              <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSend}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  cryptoSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  cryptoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cryptoSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cryptoBalance: {
    fontSize: 14,
    marginTop: 2,
  },
  cryptoList: {
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  cryptoItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  hint: {
    fontSize: 14,
    marginTop: 8,
  },
  addressInputContainer: {
    position: 'relative',
  },
  addressInput: {
    minHeight: 80,
    paddingTop: 16,
    paddingRight: 56,
    textAlignVertical: 'top',
  },
  scanButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
  },
  sendButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
