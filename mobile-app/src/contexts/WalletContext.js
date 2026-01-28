import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

const cryptoMetadata = {
  btc_testnet: {
    id: 'btc_testnet',
    symbol: 'BTC',
    name: 'Bitcoin Testnet',
    icon: 'btc_testnet',
    color: '#F7931A',
    price: 65000,
    chain: 'bitcoin-testnet',
  },
  eth: {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'eth',
    color: '#627EEA',
    price: 3500,
    chain: 'ethereum',
  },
  eth_sepolia: {
    id: 'eth_sepolia',
    symbol: 'ETH',
    name: 'Ethereum Sepolia',
    icon: 'eth_sepolia',
    color: '#8A2BE2',
    price: 3500,
    chain: 'ethereum-sepolia',
  },
  usdc: {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    icon: 'usdc',
    color: '#2775CA',
    price: 1,
    chain: 'ethereum',
  },
  plume: {
    id: 'plume',
    symbol: 'PLUME',
    name: 'Plume Network',
    icon: 'plume',
    color: '#FF6B35',
    price: 0.1,
    chain: 'plume',
  },
};

const API_BASE_URL = 'https://api.hyperx.llc';

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const [cryptos, setCryptos] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadLocalData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchWalletBalances();
      fetchTransactions();
    }
  }, [user?.id]);

  useEffect(() => {
    saveLocalData();
  }, [cryptos, transactions]);

  const loadLocalData = async () => {
    try {
      const [storedCryptos, storedTransactions] = await Promise.all([
        AsyncStorage.getItem('cryptoWallet'),
        AsyncStorage.getItem('cryptoTransactions'),
      ]);

      if (storedCryptos) {
        setCryptos(JSON.parse(storedCryptos));
      }
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error('Failed to load local data:', error);
    }
  };

  const saveLocalData = async () => {
    try {
      if (cryptos.length > 0) {
        await AsyncStorage.setItem('cryptoWallet', JSON.stringify(cryptos));
      }
      if (transactions.length > 0) {
        await AsyncStorage.setItem('cryptoTransactions', JSON.stringify(transactions));
      }
    } catch (error) {
      console.error('Failed to save local data:', error);
    }
  };

  const fetchWalletBalances = async () => {
    if (!user?.id) return;

    setLoadingBalances(true);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${API_BASE_URL}/v1/wallet/balances/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const balanceData = await response.json();

      if (response.ok && balanceData.success) {
        const transformedCryptos = [];

        balanceData.data.forEach((balanceItem) => {
          const cryptoKey = balanceItem.currency.toLowerCase();
          const metadata = cryptoMetadata[cryptoKey];
          if (metadata) {
            transformedCryptos.push({
              ...metadata,
              balance: parseFloat(balanceItem.balanceFormatted) || 0,
              address: balanceItem.address,
            });
          }
        });

        if (transformedCryptos.length === 0) {
          Object.values(cryptoMetadata).forEach((metadata) => {
            transformedCryptos.push({
              ...metadata,
              balance: 0,
            });
          });
        }

        setCryptos(transformedCryptos);
      }
    } catch (error) {
      console.error('Failed to fetch wallet balances:', error);
      const fallbackCryptos = Object.values(cryptoMetadata).map((metadata) => ({
        ...metadata,
        balance: 0,
      }));
      setCryptos(fallbackCryptos);
    } finally {
      setLoadingBalances(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user?.id) return;

    setLoadingTransactions(true);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${API_BASE_URL}/v1/wallet/history/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const historyData = await response.json();

      if (response.ok && historyData.success && Array.isArray(historyData.data)) {
        const transformedTransactions = historyData.data.map((transaction) => {
          const currencyKey = transaction.currency?.toLowerCase();
          let cryptoMeta = null;

          if (currencyKey && cryptoMetadata[currencyKey]) {
            cryptoMeta = cryptoMetadata[currencyKey];
          } else {
            cryptoMeta = Object.values(cryptoMetadata).find(
              (meta) =>
                meta.symbol.toLowerCase() === currencyKey ||
                meta.id.toLowerCase() === currencyKey
            );
          }

          const parsedAmount = parseFloat(transaction.amount) || 0;
          const humanAmount = parseFloat(transaction.humanAmount) || parsedAmount;
          const calculatedValue = cryptoMeta
            ? humanAmount * cryptoMeta.price
            : parseFloat(transaction.value) || 0;

          return {
            id: transaction.id || Date.now() + Math.random(),
            type: transaction.type || 'unknown',
            cryptoId: cryptoMeta
              ? cryptoMeta.id
              : transaction.cryptoId || transaction.currency?.toLowerCase(),
            symbol: cryptoMeta
              ? cryptoMeta.symbol
              : transaction.symbol || transaction.currency,
            amount: humanAmount,
            rawAmount: transaction.amount,
            address: transaction.address || transaction.toAddress || 'Unknown',
            timestamp: transaction.timestamp || transaction.createdAt || new Date().toISOString(),
            value: calculatedValue,
            fromAddress: transaction.fromAddress,
            toAddress: transaction.toAddress,
            direction: transaction.direction,
            status: transaction.status,
            txHash: transaction.txHash,
            metadata: transaction.metadata,
            createdAt: transaction.createdAt,
            currency: transaction.currency,
            timeAgo: transaction.timeAgo,
            category: transaction.category,
          };
        });

        setTransactions(transformedTransactions);
      }
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const getTotalBalance = () => {
    return cryptos.reduce((total, crypto) => {
      return total + crypto.balance * crypto.price;
    }, 0);
  };

  const getWalletAddress = (cryptoId) => {
    const crypto = cryptos.find((c) => c.id === cryptoId);
    return crypto?.address || 'Address not available';
  };

  const getWalletBalance = (cryptoId) => {
    const crypto = cryptos.find((c) => c.id === cryptoId);
    return crypto ? crypto.balance : 0;
  };

  return (
    <WalletContext.Provider
      value={{
        cryptos,
        loadingBalances,
        loadingTransactions,
        transactions,
        fetchTransactions,
        fetchWalletBalances,
        getTotalBalance,
        getWalletBalance,
        getWalletAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
