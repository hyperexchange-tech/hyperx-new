import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen({ navigation }) {
  const { cryptos, getTotalBalance, loadingBalances, fetchWalletBalances } = useWallet();
  const { user } = useAuth();
  const { colors } = useTheme();

  const totalBalance = getTotalBalance();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loadingBalances} onRefresh={fetchWalletBalances} />
        }
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome back</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Send')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Receive')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.success }]}>
              <Ionicons name="arrow-down" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Convert')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.warning }]}>
              <Ionicons name="swap-horizontal" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Convert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Swap')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="repeat" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Swap</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.assetsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Assets</Text>
          {cryptos.map((crypto) => (
            <TouchableOpacity
              key={crypto.id}
              style={[styles.assetCard, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('AssetChart', { cryptoId: crypto.id })}
            >
              <View style={styles.assetInfo}>
                <View style={[styles.cryptoIcon, { backgroundColor: crypto.color }]}>
                  <Text style={styles.cryptoSymbol}>{crypto.symbol.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={[styles.cryptoName, { color: colors.text }]}>{crypto.name}</Text>
                  <Text style={[styles.cryptoBalance, { color: colors.textSecondary }]}>
                    {crypto.balance.toFixed(6)} {crypto.symbol}
                  </Text>
                </View>
              </View>
              <View style={styles.assetValue}>
                <Text style={[styles.valueAmount, { color: colors.text }]}>
                  ${(crypto.balance * crypto.price).toFixed(2)}
                </Text>
                <Text style={[styles.valuePrice, { color: colors.textSecondary }]}>
                  ${crypto.price.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  email: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  balanceCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginTop: -30,
    marginBottom: 32,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    width: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  assetsSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  assetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cryptoBalance: {
    fontSize: 14,
    marginTop: 2,
  },
  assetValue: {
    alignItems: 'flex-end',
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  valuePrice: {
    fontSize: 14,
    marginTop: 2,
  },
});
