import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ExternalLink, Clock, Hash, MapPin, ArrowUpRight, ArrowDownLeft, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const TransactionDetailModal = ({ isOpen, onClose, transaction, cryptos }) => {
  const [copiedField, setCopiedField] = useState("");
  const { toast } = useToast();

  if (!transaction) return null;

  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied",
        description: `${fieldName} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(""), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatAddress = (address) => {
    if (!address || address === "Unknown") return address;
    if (address.startsWith("Internal:")) return address.replace("Internal: ", "");
    if (address.length > 20) {
      return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
    }
    return address;
  };

  const formatFullAddress = (address) => {
    if (!address || address === "Unknown") return address;
    if (address.startsWith("Internal:")) return address.replace("Internal: ", "");
    return address;
  };

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case "send":
      case "withdraw":
        return <ArrowUpRight className="h-6 w-6 text-destructive" />;
      case "receive":
      case "deposit":
        return <ArrowDownLeft className="h-6 w-6 text-green-500" />;
      case "convert":
      case "swap":
        return <RefreshCw className="h-6 w-6 text-primary" />;
      case "interaction":
        return <AlertCircle className="h-6 w-6 text-orange-500" />;
      default:
        return <CheckCircle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getTransactionTitle = () => {
    // Use the backend transaction type directly, with proper capitalization
    if (!transaction.type) return 'Transaction';
    
    // Capitalize first letter of the transaction type
    return transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "text-green-500 bg-green-500/10";
      case "pending":
        return "text-orange-500 bg-orange-500/10";
      case "failed":
      case "error":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted/10";
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCryptoIconBg = (cryptoId) => {
    const colorMap = {
      'btc_testnet': 'bg-orange-500',
      'eth': 'bg-blue-500',
      'eth_sepolia': 'bg-purple-500',
      'usdc': 'bg-blue-600',
      'plume': 'bg-red-500',
    };
    return colorMap[cryptoId] || 'bg-gray-500';
  };

  const getAmountDisplay = () => {
    const { type, amount, symbol, fromAmount, fromSymbol, toAmount, toSymbol } = transaction;
    
    switch (type) {
      case "send":
      case "withdraw":
        return {
          primary: `-${amount} ${symbol}`,
          color: "text-destructive"
        };
      case "receive":
      case "deposit":
        return {
          primary: `+${amount} ${symbol}`,
          color: "text-green-500"
        };
      case "convert":
      case "swap":
        return {
          primary: `${fromAmount} ${fromSymbol} → ${toAmount?.toFixed(6)} ${toSymbol}`,
          color: "text-primary"
        };
      default:
        return {
          primary: `${amount || 0} ${symbol}`,
          color: "text-muted-foreground"
        };
    }
  };

  const amountDisplay = getAmountDisplay();
  const cryptoMeta = cryptos?.find(c => c.id === transaction.cryptoId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-md bg-card rounded-t-2xl border border-border/50 shadow-2xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border/50 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Transaction Receipt</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6 space-y-6">
                {/* Transaction Header */}
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center relative"
                      style={{ backgroundColor: `${cryptoMeta?.color || '#6B7280'}20` }}
                    >
                      <CryptoIcon 
                        name={transaction.cryptoId} 
                        color={cryptoMeta?.color || '#6B7280'} 
                        size={32} 
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center">
                        {getTransactionIcon()}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {getTransactionTitle()}
                    </h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status || "completed"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className={`text-2xl font-bold ${amountDisplay.color}`}>
                      {amountDisplay.primary}
                    </p>
                    {transaction.value && (
                      <p className="text-lg text-muted-foreground">
                        ${transaction.value.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Transaction Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Transaction Details
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Date & Time */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Date & Time</span>
                      </div>
                      <span className="text-sm text-foreground font-medium">
                        {formatDate(transaction.timestamp)}
                      </span>
                    </div>

                    {/* Transaction ID */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Transaction ID</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground font-mono">
                          {transaction.id ? `${String(transaction.id).substring(0, 8)}...` : "N/A"}
                        </span>
                        {transaction.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopy(transaction.id, "Transaction ID")}
                          >
                            {copiedField === "Transaction ID" ? 
                              <Check className="h-3 w-3" /> : 
                              <Copy className="h-3 w-3" />
                            }
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Transaction Hash */}
                    {transaction.txHash && (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Transaction Hash</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground font-mono">
                            {`${transaction.txHash.substring(0, 8)}...`}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopy(transaction.txHash, "Transaction Hash")}
                          >
                            {copiedField === "Transaction Hash" ? 
                              <Check className="h-3 w-3" /> : 
                              <Copy className="h-3 w-3" />
                            }
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* From Address */}
                    {transaction.fromAddress && (
                      <div className="flex items-start justify-between py-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">From Address</span>
                        </div>
                        <div className="flex items-center gap-2 max-w-[60%]">
                          <span className="text-sm text-foreground font-mono break-all">
                            {formatAddress(transaction.fromAddress)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                            onClick={() => handleCopy(formatFullAddress(transaction.fromAddress), "From Address")}
                          >
                            {copiedField === "From Address" ? 
                              <Check className="h-3 w-3" /> : 
                              <Copy className="h-3 w-3" />
                            }
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* To Address */}
                    {transaction.toAddress && (
                      <div className="flex items-start justify-between py-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">To Address</span>
                        </div>
                        <div className="flex items-center gap-2 max-w-[60%]">
                          <span className="text-sm text-foreground font-mono break-all">
                            {formatAddress(transaction.toAddress || transaction.address)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                            onClick={() => handleCopy(formatFullAddress(transaction.toAddress || transaction.address), "To Address")}
                          >
                            {copiedField === "To Address" ? 
                              <Check className="h-3 w-3" /> : 
                              <Copy className="h-3 w-3" />
                            }
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Network/Chain */}
                    {transaction.metadata?.chain && (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
                            <span className="text-xs text-primary-foreground">🔷</span>
                          </div>
                          <span className="text-sm text-muted-foreground">Network</span>
                        </div>
                        <span className="text-sm text-foreground font-medium capitalize">
                          {transaction.metadata.chain.replace('-', ' ')}
                        </span>
                      </div>
                    )}

                    {/* Direction */}
                    {transaction.direction && (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Direction</span>
                        </div>
                        <span className={cn(
                          "text-sm font-medium capitalize",
                          transaction.direction === "outgoing" ? "text-destructive" : "text-green-500"
                        )}>
                          {transaction.direction}
                        </span>
                      </div>
                    )}

                    {/* Reference */}
                    {transaction.metadata?.reference && (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Reference</span>
                        </div>
                        <span className="text-sm text-foreground font-mono">
                          {transaction.metadata.reference}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conversion Details (for swap/convert transactions) */}
                {(transaction.type === "convert" || transaction.type === "swap") && transaction.fromSymbol && transaction.toSymbol && (
                  <>
                    <Separator className="bg-border/50" />
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Conversion Details
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground">From Amount</span>
                          <span className="text-sm text-foreground font-medium">
                            {transaction.fromAmount} {transaction.fromSymbol}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground">To Amount</span>
                          <span className="text-sm text-foreground font-medium">
                            {transaction.toAmount?.toFixed(6)} {transaction.toSymbol}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground">Exchange Rate</span>
                          <span className="text-sm text-foreground font-medium">
                            1 {transaction.fromSymbol} ≈ {(transaction.toAmount / transaction.fromAmount).toFixed(6)} {transaction.toSymbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Raw Amount (for debugging) */}
                {transaction.rawAmount && transaction.rawAmount.toString().length > 10 && (
                  <>
                    <Separator className="bg-border/50" />
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Technical Details
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start justify-between py-2">
                          <span className="text-sm text-muted-foreground">Raw Amount</span>
                          <div className="flex items-center gap-2 max-w-[60%]">
                            <span className="text-sm text-foreground font-mono break-all">
                              {transaction.rawAmount}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                              onClick={() => handleCopy(transaction.rawAmount.toString(), "Raw Amount")}
                            >
                              {copiedField === "Raw Amount" ? 
                                <Check className="h-3 w-3" /> : 
                                <Copy className="h-3 w-3" />
                              }
                            </Button>
                          </div>
                        </div>
                        
                        {/* For convert/swap transactions, show raw conversion amounts */}
                        {(transaction.type === "convert" || transaction.type === "swap") && transaction.fromRawAmount && transaction.toRawAmount && (
                          <>
                            <div className="flex items-start justify-between py-2">
                              <span className="text-sm text-muted-foreground">From Raw Amount</span>
                              <div className="flex items-center gap-2 max-w-[60%]">
                                <span className="text-sm text-foreground font-mono break-all">
                                  {transaction.fromRawAmount}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                                  onClick={() => handleCopy(transaction.fromRawAmount.toString(), "From Raw Amount")}
                                >
                                  {copiedField === "From Raw Amount" ? 
                                    <Check className="h-3 w-3" /> : 
                                    <Copy className="h-3 w-3" />
                                  }
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-start justify-between py-2">
                              <span className="text-sm text-muted-foreground">To Raw Amount</span>
                              <div className="flex items-center gap-2 max-w-[60%]">
                                <span className="text-sm text-foreground font-mono break-all">
                                  {transaction.toRawAmount}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                                  onClick={() => handleCopy(transaction.toRawAmount.toString(), "To Raw Amount")}
                                >
                                  {copiedField === "To Raw Amount" ? 
                                    <Check className="h-3 w-3" /> : 
                                    <Copy className="h-3 w-3" />
                                  }
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="pt-4 space-y-3">
                  {transaction.txHash && (
                    <Button
                      variant="outline"
                      className="w-full h-12 bg-card/80 border-border/50 hover:bg-muted/30 text-foreground"
                      onClick={() => {
                        // In a real app, this would open the blockchain explorer
                        toast({
                          title: "Blockchain Explorer",
                          description: "Opening transaction in blockchain explorer...",
                        });
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Blockchain Explorer
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full h-12 bg-card/80 border-border/50 hover:bg-muted/30 text-foreground"
                    onClick={onClose}
                  >
                    Close Receipt
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionDetailModal;