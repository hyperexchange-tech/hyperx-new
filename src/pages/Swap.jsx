import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { walletAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import PinConfirmationModal from "@/components/modals/PinConfirmationModal";
import { generateIdempotencyKey } from "@/lib/utils";

const Swap = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cryptos, convertCrypto, fetchWalletBalances, fetchTransactions } = useWallet();
  const { toast } = useToast();
  
  const [fromCrypto, setFromCrypto] = useState("");
  const [toCrypto, setToCrypto] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(null);
  const [quoteCountdown, setQuoteCountdown] = useState(null);
  const [isQuoteExpired, setIsQuoteExpired] = useState(false);

  useEffect(() => {
    if (cryptos.length > 0) {
      setFromCrypto(cryptos[0].id);
      if (cryptos.length > 1) {
        setToCrypto(cryptos[1].id);
      }
    }
  }, [cryptos]);

  // Auto-fetch quote when amount, fromCrypto, or toCrypto changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || !fromCrypto || !toCrypto || fromCrypto === toCrypto || parseFloat(amount) <= 0) {
        setQuoteDetails(null);
        setQuoteError("");
        return;
      }

      const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
      const toCryptoData = cryptos.find((c) => c.id === toCrypto);
      
      if (!fromCryptoData || !toCryptoData) {
        return;
      }

      // Check if amount exceeds balance
      if (parseFloat(amount) > fromCryptoData.balance) {
        setQuoteDetails(null);
        setQuoteError("Insufficient balance");
        return;
      }

      setLoadingQuote(true);
      setQuoteError("");
      
      try {
        const quote = await walletAPI.getSwapQuote(
          fromCryptoData.symbol.toUpperCase(),
          toCryptoData.symbol.toUpperCase(),
          amount
        );

        if (quote && quote.success) {
          setQuoteDetails(quote.quote);
          setQuoteCountdown(5);
          setIsQuoteExpired(false);
        } else {
          setQuoteDetails(null);
          setQuoteError("Unable to get quote");
          setQuoteCountdown(null);
          setIsQuoteExpired(false);
        }
      } catch (error) {
        console.error('Quote fetch error:', error);
        setQuoteDetails(null);
        setQuoteError("Network error");
        setQuoteCountdown(null);
        setIsQuoteExpired(false);
      } finally {
        setLoadingQuote(false);
      }
    };

    // Debounce the quote fetching to avoid too many API calls
    const timeoutId = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [amount, fromCrypto, toCrypto, cryptos]);

  useEffect(() => {
    if (quoteCountdown === null || quoteCountdown <= 0) {
      if (quoteCountdown === 0) {
        setIsQuoteExpired(true);
      }
      return;
    }

    const intervalId = setInterval(() => {
      setQuoteCountdown((prev) => {
        if (prev === null || prev <= 1) {
          setIsQuoteExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [quoteCountdown]);
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    const crypto = cryptos.find((c) => c.id === fromCrypto);
    if (crypto) {
      setAmount(crypto.balance.toString());
    }
  };

  const handleSwapCryptos = () => {
    const temp = fromCrypto;
    setFromCrypto(toCrypto);
    setToCrypto(temp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fromCrypto || !toCrypto || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    if (fromCrypto === toCrypto) {
      toast({
        title: "Invalid Swap",
        description: "Cannot swap the same cryptocurrency.",
        variant: "destructive",
      });
      return;
    }

    const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
    if (fromCryptoData && parseFloat(amount) > fromCryptoData.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromCryptoData.symbol}.`,
        variant: "destructive",
      });
      return;
    }

    if (!quoteDetails) {
      toast({
        title: "Quote Failed",
        description: "Unable to get swap quote. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const newIdempotencyKey = generateIdempotencyKey();
    setIdempotencyKey(newIdempotencyKey);

    setPendingTransaction({
      fromCrypto,
      toCrypto,
      amount: parseFloat(amount),
      quote: quoteDetails,
      idempotencyKey: newIdempotencyKey
    });
    setIsPinModalOpen(true);
  };

  const handlePinConfirmed = async (pin) => {
    if (!pendingTransaction) return;

    setIsSubmitting(true);
    
    try {
      // Ensure wallet balances are up to date before attempting swap
      await fetchWalletBalances();
      
      const fromCryptoData = cryptos.find((c) => c.id === pendingTransaction.fromCrypto);
      const toCryptoData = cryptos.find((c) => c.id === pendingTransaction.toCrypto);
      
      // Verify that both cryptocurrencies exist in the user's wallet
      if (!fromCryptoData || !toCryptoData) {
        throw new Error("One or both cryptocurrencies not found in your wallet. Please refresh and try again.");
      }
      
      // Defensive check for walletAPI.executeSwap
      if (!walletAPI || typeof walletAPI.executeSwap !== 'function') {
        console.error('walletAPI.executeSwap is not available:', walletAPI);
        throw new Error("Swap functionality is currently unavailable. Please try again later.");
      }
      
      const result = await walletAPI.executeSwap(
        user.id,
        fromCryptoData.id.toUpperCase(),
        toCryptoData.id.toUpperCase(),
        pendingTransaction.amount.toString(),
        pendingTransaction.quote.quoteId,
        pendingTransaction.idempotencyKey
      );

      if (result && result.success) {
        toast({
          title: "Swap Successful",
          description: `Successfully swapped ${pendingTransaction.amount} ${fromCryptoData.symbol} to ${toCryptoData.symbol}`,
        });
        
        // Refresh wallet balances and transactions
        await fetchWalletBalances();
        await fetchTransactions();
        
        // Reset form
        setAmount("");
        setQuoteDetails(null);
        setPendingTransaction(null);
        setIdempotencyKey(null);

        setTimeout(() => {
          if (location.state?.fromCrypto) {
            navigate("/", { state: { showCrypto: true, transactionCompleted: true } });
          } else {
            navigate("/");
          }
        }, 1500);
      } else {
        toast({
          title: "Swap Failed",
          description: result?.error || result?.message || "The swap could not be completed due to a server error. Please check your balance and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Swap execution error:', error);
      toast({
        title: "Swap Error",
        description: error.message || "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setPendingTransaction(null);
      setIdempotencyKey(null);
    }
  };

  const handlePinModalClose = () => {
    setIsPinModalOpen(false);
    setPendingTransaction(null);
    setIdempotencyKey(null);
  };

  const handleRefreshQuote = async () => {
    if (!amount || !fromCrypto || !toCrypto || fromCrypto === toCrypto || parseFloat(amount) <= 0) {
      return;
    }

    const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
    const toCryptoData = cryptos.find((c) => c.id === toCrypto);

    if (!fromCryptoData || !toCryptoData) {
      return;
    }

    if (parseFloat(amount) > fromCryptoData.balance) {
      return;
    }

    setLoadingQuote(true);
    setQuoteError("");

    try {
      const quote = await walletAPI.getSwapQuote(
        fromCryptoData.symbol.toUpperCase(),
        toCryptoData.symbol.toUpperCase(),
        amount
      );

      if (quote && quote.success) {
        setQuoteDetails(quote.quote);
        setQuoteCountdown(5);
        setIsQuoteExpired(false);
      } else {
        setQuoteDetails(null);
        setQuoteError("Unable to get quote");
        setQuoteCountdown(null);
        setIsQuoteExpired(false);
      }
    } catch (error) {
      console.error('Quote fetch error:', error);
      setQuoteDetails(null);
      setQuoteError("Network error");
      setQuoteCountdown(null);
      setIsQuoteExpired(false);
    } finally {
      setLoadingQuote(false);
    }
  };

  const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
  const toCryptoData = cryptos.find((c) => c.id === toCrypto);
  
  const maxAmount = fromCryptoData ? fromCryptoData.balance : 0;

  const getDisplayAmount = () => {
    if (loadingQuote) return "Getting quote...";
    if (quoteError) return quoteError;
    if (quoteDetails && quoteDetails.toAmount) {
      return parseFloat(quoteDetails.toAmount).toFixed(6);
    }
    return "";
  };

  const getDisplaySubtext = () => {
    if (loadingQuote) return "Please wait";
    if (quoteError) return "Try adjusting the amount";
    if (quoteDetails) return "You'll receive approximately";
    return "Enter amount to see quote";
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden p-4 md:p-8">
      {/* Header */}
      <div className="pt-4 pb-2">
        <button
          onClick={() => {
            if (location.state?.fromCrypto) {
              navigate("/", { state: { showCrypto: true, transactionCompleted: true } });
            } else {
              navigate(-1);
            }
          }}
          className="text-white/80 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-0.5">Swap Crypto</h1>
          <p className="text-xs text-white/60">Exchange crypto</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="space-y-2.5 h-full flex flex-col">

          {/* From (Crypto) Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-normal text-white/70">From</h2>
              {fromCryptoData && (
                <p className="text-xs text-white/70">
                  Balance: {maxAmount.toFixed(6)} {fromCryptoData.symbol}
                </p>
              )}
            </div>

            <Select value={fromCrypto} onValueChange={setFromCrypto}>
              <SelectTrigger className="h-14 bg-white/[0.06] border-white/10 rounded-2xl text-white hover:bg-white/[0.08] transition-colors">
                <SelectValue>
                  {fromCryptoData && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5">
                        <CryptoIcon name={fromCryptoData.id} color={fromCryptoData.color} size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white text-base">{fromCryptoData.symbol}</p>
                        <p className="text-sm text-white/60">{fromCryptoData.name}</p>
                      </div>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {cryptos.map((crypto) => (
                  <SelectItem
                    key={crypto.id}
                    value={crypto.id}
                    disabled={crypto.id === toCrypto}
                    className="text-white hover:bg-white/10 focus:bg-white/10"
                  >
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5">
                        <CryptoIcon name={crypto.id} color={crypto.color} size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-base">{crypto.symbol}</p>
                        <p className="text-sm text-white/60">{crypto.name}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="pt-2">
              <div className="text-center mb-4">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="w-full text-center text-4xl font-light bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-white/20"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAmount((maxAmount * 0.25).toString())}
                  className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => setAmount((maxAmount * 0.5).toString())}
                  className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setAmount((maxAmount * 0.75).toString())}
                  className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={handleMaxAmount}
                  className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                >
                  MAX
                </button>
              </div>
            </div>
          </motion.div>

          {/* Swap Button */}
          <div className="flex justify-center -my-0.5">
            <button
              type="button"
              onClick={handleSwapCryptos}
              className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <RotateCcw className="h-4 w-4 text-[hsl(180,60%,50%)]" />
            </button>
          </div>

          {/* To (Crypto) Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-2"
          >
            <h2 className="text-xs font-normal text-white/70">To</h2>

            <Select value={toCrypto} onValueChange={setToCrypto}>
              <SelectTrigger className="h-14 bg-white/[0.06] border-2 border-[hsl(180,60%,50%)] rounded-2xl text-white hover:bg-white/[0.08] transition-colors">
                <SelectValue>
                  {toCryptoData && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5">
                        <CryptoIcon name={toCryptoData.id} color={toCryptoData.color} size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white text-base">{toCryptoData.symbol}</p>
                        <p className="text-sm text-white/60">{toCryptoData.name}</p>
                      </div>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {cryptos.map((crypto) => (
                  <SelectItem
                    key={crypto.id}
                    value={crypto.id}
                    disabled={crypto.id === fromCrypto}
                    className="text-white hover:bg-white/10 focus:bg-white/10"
                  >
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5">
                        <CryptoIcon name={crypto.id} color={crypto.color} size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-base">{crypto.symbol}</p>
                        <p className="text-sm text-white/60">{crypto.name}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="pt-2">
              <div className="text-center">
                <div className={`text-4xl font-light mb-1 ${quoteError ? "text-red-500" : "text-white"}`}>
                  {getDisplayAmount() || "0.00"}
                </div>
                <p className="text-xs text-white/60">
                  {getDisplaySubtext()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Exchange Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex-1 flex flex-col justify-center space-y-2"
          >
            <h3 className="text-sm font-semibold text-white">Exchange Details</h3>
            {loadingQuote ? (
              <div className="flex items-center justify-center py-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-transparent border-t-white/50 rounded-full"
                />
                <span className="ml-2 text-xs text-white/50">Fetching quote...</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/70">Exchange Rate</span>
                  <span className="text-xs font-medium text-white">
                    {quoteDetails && amount ?
                      `1 ${fromCryptoData?.symbol} ≈ ${(parseFloat(quoteDetails.toAmount) / parseFloat(amount)).toFixed(6)} ${toCryptoData?.symbol}` :
                      `1 ${fromCryptoData?.symbol} ≈ -- ${toCryptoData?.symbol}`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/70">Exchange Fee</span>
                  <span className="text-xs font-medium text-orange-500">
                    {quoteDetails ?
                      `$${parseFloat(quoteDetails.feeAmount || 0).toFixed(2)}` :
                      `~$${amount ? (parseFloat(amount) * (fromCryptoData?.price || 0) * 0.01).toFixed(2) : "0.00"}`
                    }
                  </span>
                </div>
              </div>
            )}

            {/* You'll receive */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-normal text-white/90">You'll receive</span>
                <span className="text-sm font-semibold text-white">
                  {quoteDetails ?
                    `${parseFloat(quoteDetails.toAmount).toFixed(6)} ${toCryptoData?.symbol}` :
                    `-- ${toCryptoData?.symbol}`
                  }
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="py-3 pb-5 bg-black border-t border-white/10">
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              if (location.state?.fromCrypto) {
                navigate("/", { state: { showCrypto: true, transactionCompleted: true } });
              } else {
                navigate(-1);
              }
            }}
            className="px-6 py-3 rounded-2xl border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={isQuoteExpired ? handleRefreshQuote : handleSubmit}
            disabled={!fromCrypto || !toCrypto || !amount || isSubmitting || fromCrypto === toCrypto || isPinModalOpen || !quoteDetails || !!quoteError || loadingQuote}
            className="flex-1 py-3 rounded-2xl bg-[hsl(180,60%,45%)] hover:bg-[hsl(180,60%,40%)] disabled:bg-[hsl(180,60%,25%)] disabled:text-white/50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loadingQuote ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-[18px] h-[18px] border-2 border-transparent border-t-white rounded-full"
                />
                Loading...
              </>
            ) : isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-[18px] h-[18px] border-2 border-transparent border-t-white rounded-full"
                />
                Processing...
              </>
            ) : isQuoteExpired ? (
              <>
                <RefreshCw size={18} />
                Refresh Rate
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                {quoteCountdown !== null ? `Swap (${quoteCountdown}s)` : "Swap"}
              </>
            )}
          </button>
        </div>
      </div>

      <PinConfirmationModal
        isOpen={isPinModalOpen}
        onClose={handlePinModalClose}
        onConfirm={handlePinConfirmed}
        transactionType="swap"
      />
    </div>
  );
};

export default Swap;