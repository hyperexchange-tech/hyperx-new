import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const { transactions, loadingTransactions, fetchTransactions } = useWallet();
  const { colors } = useTheme();

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'send':
        return 'arrow-up';
      case 'receive':
        return 'arrow-down';
      case 'convert':
        return 'swap-horizontal';
      default:
        return 'repeat';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'send':
        return colors.error;
      case 'receive':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  const renderTransaction = ({ item }) => {
    const iconColor = getTransactionColor(item.type);

    return (
      <TouchableOpacity style={[styles.transactionCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.transactionIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={getTransactionIcon(item.type)} size={20} color={iconColor} />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionType, { color: colors.text }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.transactionAmount}>
          <Text style={[styles.amountText, { color: colors.text }]}>
            {item.type === 'send' ? '-' : '+'}
            {item.amount} {item.symbol}
          </Text>
          <Text style={[styles.valueText, { color: colors.textSecondary }]}>
            ${item.value?.toFixed(2) || '0.00'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No transactions yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loadingTransactions} onRefresh={fetchTransactions} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 24,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 14,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  valueText: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
