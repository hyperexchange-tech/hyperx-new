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

export default function ConvertScreen({ navigation }) {
  const { cryptos } = useWallet();
  const { colors } = useTheme();
  const [fromCrypto, setFromCrypto] = useState(cryptos[0]);
  const [toCrypto, setToCrypto] = useState(cryptos[1]);
  const [amount, setAmount] = useState('');
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);

  const convertedAmount = amount
    ? ((parseFloat(amount) * fromCrypto.price) / toCrypto.price).toFixed(6)
    : '0';

  const handleConvert = () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    if (parseFloat(amount) > fromCrypto.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    Alert.alert(
      'Confirm Conversion',
      `Convert ${amount} ${fromCrypto.symbol} to ${convertedAmount} ${toCrypto.symbol}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Convert',
          onPress: () => {
            Alert.alert('Success', 'Conversion completed successfully');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const swapCryptos = () => {
    const temp = fromCrypto;
    setFromCrypto(toCrypto);
    setToCrypto(temp);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>From</Text>
          <TouchableOpacity
            style={[styles.cryptoSelector, { backgroundColor: colors.surface }]}
            onPress={() => setShowFromList(!showFromList)}
          >
            <View style={styles.cryptoInfo}>
              <View style={[styles.cryptoIcon, { backgroundColor: fromCrypto.color }]}>
                <Text style={styles.cryptoSymbol}>{fromCrypto.symbol.charAt(0)}</Text>
              </View>
              <View>
                <Text style={[styles.cryptoName, { color: colors.text }]}>
                  {fromCrypto.name}
                </Text>
                <Text style={[styles.cryptoBalance, { color: colors.textSecondary }]}>
                  Balance: {fromCrypto.balance.toFixed(6)} {fromCrypto.symbol}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {showFromList && (
            <View style={[styles.cryptoList, { backgroundColor: colors.surface }]}>
              {cryptos.map((crypto) => (
                <TouchableOpacity
                  key={crypto.id}
                  style={styles.cryptoItem}
                  onPress={() => {
                    setFromCrypto(crypto);
                    setShowFromList(false);
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

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity style={styles.swapButton} onPress={swapCryptos}>
          <View style={[styles.swapIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="swap-vertical" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>To</Text>
          <TouchableOpacity
            style={[styles.cryptoSelector, { backgroundColor: colors.surface }]}
            onPress={() => setShowToList(!showToList)}
          >
            <View style={styles.cryptoInfo}>
              <View style={[styles.cryptoIcon, { backgroundColor: toCrypto.color }]}>
                <Text style={styles.cryptoSymbol}>{toCrypto.symbol.charAt(0)}</Text>
              </View>
              <Text style={[styles.cryptoName, { color: colors.text }]}>{toCrypto.name}</Text>
            </View>
            <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {showToList && (
            <View style={[styles.cryptoList, { backgroundColor: colors.surface }]}>
              {cryptos.map((crypto) => (
                <TouchableOpacity
                  key={crypto.id}
                  style={styles.cryptoItem}
                  onPress={() => {
                    setToCrypto(crypto);
                    setShowToList(false);
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

          <View style={[styles.input, styles.outputInput, { backgroundColor: colors.surface }]}>
            <Text style={[styles.outputText, { color: colors.text }]}>{convertedAmount}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Exchange Rate
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              1 {fromCrypto.symbol} = {(fromCrypto.price / toCrypto.price).toFixed(6)}{' '}
              {toCrypto.symbol}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Fee (1%)</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              ${((parseFloat(amount) * fromCrypto.price * 0.01) || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.convertButton, { backgroundColor: colors.primary }]}
          onPress={handleConvert}
        >
          <Text style={styles.convertButtonText}>Convert</Text>
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
    marginBottom: 16,
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
    marginBottom: 12,
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
    marginBottom: 12,
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
    fontSize: 20,
    fontWeight: '600',
  },
  outputInput: {
    justifyContent: 'center',
  },
  outputText: {
    fontSize: 20,
    fontWeight: '600',
  },
  swapButton: {
    alignItems: 'center',
    marginVertical: 8,
  },
  swapIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  convertButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  convertButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
