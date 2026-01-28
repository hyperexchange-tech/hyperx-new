import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, ArrowUpRight, ArrowDownLeft, RefreshCw, Check, X } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions) => {
  const groups = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    const dateKey = transactionDate.toDateString();
    const todayKey = today.toDateString();
    const yesterdayKey = yesterday.toDateString();

    let groupLabel;
    if (dateKey === todayKey) {
      groupLabel = "Today";
    } else if (dateKey === yesterdayKey) {
      groupLabel = "Yesterday";
    } else {
      groupLabel = transactionDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }

    if (!groups[groupLabel]) {
      groups[groupLabel] = [];
    }
    groups[groupLabel].push(transaction);
  });

  return groups;
};

// Helper function to get transaction status icon
const getStatusIcon = (transaction) => {
  if (transaction.type === 'interaction') {
    return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
  }
  return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
};

// Helper function to format transaction title
const getTransactionTitle = (transaction) => {
  // Use the backend transaction type directly, with proper capitalization
  if (!transaction.type) return 'Transaction';

  const baseType = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);

  // Add symbol to the title for better clarity
  if (transaction.type === 'convert' || transaction.type === 'swap') {
    return `${baseType} ${transaction.fromSymbol || ''} to ${transaction.toSymbol || ''}`;
  }

  // For other transactions, add the symbol
  if (transaction.symbol) {
    return `${baseType} ${transaction.symbol}`;
  }

  return baseType;
};

// Helper function to format address display
const formatAddress = (address, type) => {
  if (!address || address === "Unknown") return address;
  if (address.startsWith("Internal:")) return address.replace("Internal: ", "");
  
  // For blockchain addresses, show shortened version
  if (address.length > 20) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  return address;
};

// Helper function to get transaction amount display
const getAmountDisplay = (transaction, privateMode) => {
  if (privateMode) {
    return {
      primary: "****",
      secondary: "****"
    };
  }

  const { type, amount, symbol, fromAmount, fromSymbol, toAmount, toSymbol } = transaction;
  
  switch (type) {
    case "send":
    case "withdraw":
      return {
        primary: `-${Math.abs(amount)} ${symbol}`,
        secondary: `$${(transaction.value || 0).toFixed(2)}`,
        color: "text-destructive"
      };
    case "receive":
      return {
        primary: `+${amount} ${symbol}`,
        secondary: `$${(transaction.value || 0).toFixed(2)}`,
        color: "text-green-500"
      };
    case "convert":
    case "swap":
      return {
        primary: `+${toAmount?.toFixed(4)} ${toSymbol}`,
        secondary: `-${fromAmount} ${fromSymbol}`,
        color: "text-primary"
      };
    case "interaction":
      return {
        primary: `${symbol || 'ETH'}`,
        secondary: "",
        color: "text-muted-foreground"
      };
    case "approval":
      return {
        primary: `${symbol || 'BTC'}`,
        secondary: "",
        color: "text-green-500"
      };
    default:
      return {
        primary: `${amount || 0} ${symbol}`,
        secondary: `$${(transaction.value || 0).toFixed(2)}`,
        color: "text-muted-foreground"
      };
  }
};

const TransactionList = ({ transactions, cryptos, privateMode = false, onTransactionClick }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium mb-2">No transactions yet</p>
        <p className="text-sm">Your transaction history will appear here</p>
      </div>
    );
  }

  // Use only real transactions from the backend
  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <div className="space-y-4">
      {Object.entries(groupedTransactions).map(([dateLabel, dateTransactions]) => (
        <div key={dateLabel}>
          {/* Date Header */}
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-4 uppercase tracking-wider">
            {dateLabel}
          </h3>

          {/* Transactions for this date */}
          <div className="space-y-0">
            {dateTransactions.map((transaction, index) => {
              const amountDisplay = getAmountDisplay(transaction, privateMode);

              // For convert/swap transactions, we need to show both from and to crypto
              let primaryCryptoId = transaction.cryptoId;
              let secondaryCryptoId = null;

              if (transaction.type === 'convert' || transaction.type === 'swap') {
                // Find cryptos by symbol for swap transactions
                primaryCryptoId = cryptos?.find(c => c.symbol === transaction.fromSymbol)?.id || transaction.cryptoId;
                secondaryCryptoId = cryptos?.find(c => c.symbol === transaction.toSymbol)?.id;
              }

              const cryptoMeta = cryptos?.find(c => c.id === primaryCryptoId);
              const secondaryCryptoMeta = secondaryCryptoId ? cryptos?.find(c => c.id === secondaryCryptoId) : null;

              return (
                <motion.div
                  key={transaction.id}
                  className="w-full px-4 py-2.5 cursor-pointer hover:bg-muted/10 transition-colors duration-200 border-b border-border/20 last:border-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => onTransactionClick && onTransactionClick(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* Crypto Icon(s) */}
                      <div className="relative flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                          <CryptoIcon
                            name={primaryCryptoId}
                            color={cryptoMeta?.color || '#6B7280'}
                            size={36}
                          />
                        </div>
                        {secondaryCryptoMeta && (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 -ml-3 border-2 border-card">
                            <CryptoIcon
                              name={secondaryCryptoId}
                              color={secondaryCryptoMeta?.color || '#6B7280'}
                              size={36}
                            />
                          </div>
                        )}
                      </div>

                      {/* Transaction Info */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-foreground text-sm">
                            {getTransactionTitle(transaction)}
                          </h4>
                          {getStatusIcon(transaction)}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-2.5 h-2.5 bg-primary rounded-sm flex items-center justify-center">
                            <span className="text-[8px] text-primary-foreground">🔷</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {transaction.type === 'send' ? 'To ' :
                             transaction.type === 'receive' ? 'From ' :
                             transaction.type === 'swap' ? '' : ''}
                            {formatAddress(transaction.address, transaction.type)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${amountDisplay.color || 'text-foreground'}`}>
                        {amountDisplay.primary}
                      </p>
                      {amountDisplay.secondary && (
                        <p className="text-xs text-muted-foreground">
                          {amountDisplay.secondary}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Bottom spacing for mobile navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default TransactionList;