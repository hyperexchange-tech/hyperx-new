import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AssetChartScreen({ route, navigation }) {
  const { cryptoId } = route.params;
  const { cryptos } = useWallet();
  const { colors } = useTheme();
  const [timeframe, setTimeframe] = useState('1D');

  const crypto = cryptos.find((c) => c.id === cryptoId);

  if (!crypto) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Asset not found</Text>
      </SafeAreaView>
    );
  }

  const priceChange = 2.45;
  const isPositive = priceChange > 0;

  const timeframes = ['1H', '1D', '1W', '1M', '1Y', 'ALL'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.assetInfo}>
            <View style={[styles.cryptoIcon, { backgroundColor: crypto.color }]}>
              <Text style={styles.cryptoSymbol}>{crypto.symbol.charAt(0)}</Text>
            </View>
            <View>
              <Text style={[styles.assetName, { color: colors.text }]}>{crypto.name}</Text>
              <Text style={[styles.assetSymbol, { color: colors.textSecondary }]}>
                {crypto.symbol}
              </Text>
            </View>
          </View>

          <View style={styles.priceInfo}>
            <Text style={[styles.price, { color: colors.text }]}>
              ${crypto.price.toLocaleString()}
            </Text>
            <View style={styles.changeContainer}>
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={16}
                color={isPositive ? colors.success : colors.error}
              />
              <Text style={[styles.change, { color: isPositive ? colors.success : colors.error }]}>
                {isPositive ? '+' : ''}
                {priceChange}%
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.chartPlaceholder, { backgroundColor: colors.surface }]}>
          <Text style={[styles.chartText, { color: colors.textSecondary }]}>
            Chart visualization coming soon
          </Text>
        </View>

        <View style={styles.timeframeContainer}>
          {timeframes.map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.timeframeButton,
                {
                  backgroundColor: timeframe === tf ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => setTimeframe(tf)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  {
                    color: timeframe === tf ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Statistics</Text>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Market Cap</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              ${(crypto.price * 1000000).toLocaleString()}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>24h Volume</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              ${(crypto.price * 50000).toLocaleString()}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Your Holdings
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {crypto.balance.toFixed(6)} {crypto.symbol}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Value</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              ${(crypto.balance * crypto.price).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Send')}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => navigation.navigate('Receive')}
          >
            <Ionicons name="arrow-down" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Receive</Text>
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
  header: {
    padding: 24,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cryptoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cryptoSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  assetName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  assetSymbol: {
    fontSize: 16,
    marginTop: 2,
  },
  priceInfo: {
    alignItems: 'center',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  change: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 250,
    marginHorizontal: 24,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartText: {
    fontSize: 16,
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
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
