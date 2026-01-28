import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function ReceiveScreen() {
  const { cryptos, getWalletAddress } = useWallet();
  const { colors } = useTheme();
  const [selectedCrypto, setSelectedCrypto] = useState(cryptos[0]);
  const [showCryptoList, setShowCryptoList] = useState(false);

  const address = getWalletAddress(selectedCrypto.id);

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(address);
    Alert.alert('Success', 'Address copied to clipboard');
  };

  const handleShareAddress = async () => {
    try {
      await Share.share({
        message: `My ${selectedCrypto.name} address: ${address}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
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
              <Text style={[styles.cryptoName, { color: colors.text }]}>
                {selectedCrypto.name}
              </Text>
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
                    <Text style={[styles.cryptoName, { color: colors.text }]}>{crypto.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.qrContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.qrCode}>
            <QRCode value={address} size={200} backgroundColor="white" />
          </View>
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            Scan this QR code to receive {selectedCrypto.symbol}
          </Text>
        </View>

        <View style={[styles.addressContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>
            Your Wallet Address
          </Text>
          <Text style={[styles.address, { color: colors.text }]}>{address}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleCopyAddress}
          >
            <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Copy Address</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={handleShareAddress}
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
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
  qrContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCode: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
  },
  addressContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
