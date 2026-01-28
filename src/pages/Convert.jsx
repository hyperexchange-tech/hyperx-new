import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Repeat2, Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import PinConfirmationModal from "@/components/modals/PinConfirmationModal";
import { walletAPI } from "@/lib/api";
import { generateIdempotencyKey } from "@/lib/utils";

const fiatCurrencies = [
  { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
  { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭" },
  { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪" },
];

const ConvertPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cryptos, getWalletBalance, fiatBalances } = useWallet();
  const { user } = useAuth();
  const { toast } = useToast();

  const supportedCryptoSymbols = ['BTC', 'ETH', 'USDT'];
  const availableCryptos = cryptos.filter(c => supportedCryptoSymbols.includes(c.symbol));

  const [fromCrypto, setFromCrypto] = useState("");
  const [toFiat, setToFiat] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [quote, setQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState(null);
  const [quoteCountdown, setQuoteCountdown] = useState(null);
  const [isQuoteExpired, setIsQuoteExpired] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  useEffect(() => {
    if (availableCryptos.length > 0) {
      setFromCrypto(availableCryptos[0].id);
    }
    if (fiatCurrencies.length > 0) {
      setToFiat(fiatCurrencies[0].code);
    }
  }, [cryptos]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const getFiatBalance = (fiatCode) => {
    const fiat = fiatBalances.find((f) => f.code === fiatCode);
    return fiat ? fiat.balance : 0;
  };

  const handleMaxAmount = () => {
    if (isReversed) {
      const fiatBalance = getFiatBalance(toFiat);
      setAmount(fiatBalance.toString());
    } else {
      const crypto = cryptos.find((c) => c.id === fromCrypto);
      if (crypto) {
        setAmount(crypto.balance.toString());
      }
    }
  };

  const fetchQuote = useCallback(async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💱 [Convert Page] fetchQuote called');
    console.log('State values:');
    console.log('  fromCrypto:', fromCrypto);
    console.log('  toFiat:', toFiat);
    console.log('  amount:', amount);
    console.log('  isReversed:', isReversed, '(type:', typeof isReversed, ')');

    if (!fromCrypto || !toFiat || !amount || parseFloat(amount) <= 0) {
      console.log('❌ Missing required fields, skipping quote fetch');
      setQuote(null);
      setQuoteError(null);
      return;
    }

    setIsLoadingQuote(true);
    setQuoteError(null);

    try {
      const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
      if (!fromCryptoData) {
        console.log('❌ Crypto data not found for:', fromCrypto);
        return;
      }

      // Validate crypto is supported for conversion
      const supportedCryptos = ['BTC', 'ETH', 'USDT'];
      if (!supportedCryptos.includes(fromCryptoData.symbol)) {
        console.log('❌ Unsupported crypto:', fromCryptoData.symbol);
        setQuoteError(`${fromCryptoData.symbol} is not supported for conversion yet`);
        setQuote(null);
        return;
      }

      // Use the same endpoint for both directions
      // direction: 'sell' = crypto to fiat, 'buy' = fiat to crypto
      const direction = isReversed === true ? 'buy' : 'sell';

      console.log('🔄 Direction calculation:');
      console.log('  isReversed:', isReversed);
      console.log('  isReversed === true:', isReversed === true);
      console.log('  Computed direction:', direction);
      console.log('  Direction type:', typeof direction);

      console.log('📞 About to call walletAPI.getConvertQuote with:');
      console.log('  crypto:', fromCryptoData.symbol);
      console.log('  fiat:', toFiat);
      console.log('  amount:', parseFloat(amount));
      console.log('  direction:', direction);

      if (!direction || (direction !== 'buy' && direction !== 'sell')) {
        console.error('❌ Invalid direction computed:', direction);
        setQuoteError('Invalid conversion direction');
        return;
      }

      const quoteResponse = await walletAPI.getConvertQuote(
        fromCryptoData.symbol,
        toFiat,
        parseFloat(amount),
        direction
      );

      console.log('[Convert v2] Quote Response:', quoteResponse);
      console.log('[Convert v2] Response Type:', typeof quoteResponse);
      console.log('[Convert v2] Response Keys:', quoteResponse ? Object.keys(quoteResponse) : 'null');

      if (quoteResponse.success === false) {
        console.error('[Convert v2] Quote failed:', quoteResponse.message);
        throw new Error(quoteResponse.message || 'Failed to fetch quote');
      }

      const quoteData = quoteResponse.data || quoteResponse;
      console.log('[Convert v2] Quote Data to display:', quoteData);
      setQuote(quoteData);
      setQuoteCountdown(5);
      setIsQuoteExpired(false);
    } catch (error) {
      console.error('[Convert v2] ❌ Error in fetchQuote:', error);
      console.error('[Convert v2] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setQuoteError(error.message || 'Failed to fetch quote');
      setQuote(null);
      setQuoteCountdown(null);
      setIsQuoteExpired(false);
    } finally {
      console.log('[Convert v2] fetchQuote complete');
      setIsLoadingQuote(false);
    }
  }, [fromCrypto, toFiat, amount, cryptos, isReversed]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchQuote]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fromCrypto || !toFiat || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: `Please select a ${isReversed ? 'fiat currency, crypto' : 'crypto, fiat currency'}, and enter a valid amount.`,
        variant: "destructive",
      });
      return;
    }

    if (!quote) {
      toast({
        title: "No Quote Available",
        description: "Please wait for the quote to load or try again.",
        variant: "destructive",
      });
      return;
    }

    if (isReversed) {
      const fiatBalance = getFiatBalance(toFiat);
      if (parseFloat(amount) > fiatBalance) {
        toast({
          title: "Insufficient Balance",
          description: `You do not have enough ${toFiatData?.code}.`,
          variant: "destructive",
        });
        return;
      }
    } else {
      const cryptoBalance = getWalletBalance(fromCrypto);
      if (parseFloat(amount) > cryptoBalance) {
        toast({
          title: "Insufficient Balance",
          description: `You do not have enough ${fromCryptoData?.symbol}.`,
          variant: "destructive",
        });
        return;
      }
    }

    const newIdempotencyKey = generateIdempotencyKey();
    setIdempotencyKey(newIdempotencyKey);

    setPendingTransaction({
      fromCrypto,
      toFiat,
      amount: parseFloat(amount),
      quote,
      direction: isReversed ? 'buy' : 'sell',
      idempotencyKey: newIdempotencyKey
    });
    setIsPinModalOpen(true);
  };

  const handlePinConfirmed = async (pin) => {
    if (!pendingTransaction || !user) return;

    setIsSubmitting(true);

    try {
      const fromCryptoData = cryptos.find((c) => c.id === pendingTransaction.fromCrypto);

      // Use the same endpoint for both directions
      const result = await walletAPI.executeConvert(
        fromCryptoData.symbol,
        pendingTransaction.toFiat,
        pendingTransaction.amount,
        pendingTransaction.direction,
        pendingTransaction.quote.quoteId || pendingTransaction.quote.id,
        pendingTransaction.idempotencyKey
      );

      console.log('Conversion result:', result);

      if (result.success === false) {
        throw new Error(result.message || 'Failed to execute conversion');
      }

      toast({
        title: "Conversion Successful",
        description: isReversed
          ? `Successfully converted ${pendingTransaction.amount} ${pendingTransaction.toFiat} to ${fromCryptoData?.symbol}.`
          : `Successfully converted ${pendingTransaction.amount} ${fromCryptoData?.symbol} to ${pendingTransaction.toFiat}.`,
      });

      setIsSubmitting(false);
      setPendingTransaction(null);
      setAmount("");
      setQuote(null);
      setIdempotencyKey(null);

      setTimeout(() => {
        if (location.state?.fromCrypto) {
          navigate("/", { state: { showCrypto: true, transactionCompleted: true } });
        } else if (location.state?.fromFiat) {
          navigate("/", { state: { showFiat: true, transactionCompleted: true } });
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (error) {
      console.error('Conversion error:', error);
      setIsSubmitting(false);
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to complete conversion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePinModalClose = () => {
    setIsPinModalOpen(false);
    setPendingTransaction(null);
    setIdempotencyKey(null);
  };

  const handleRefreshQuote = () => {
    fetchQuote();
  };

  const handleSwapDirection = () => {
    setIsReversed(!isReversed);
    setAmount("");
    setQuote(null);
    setQuoteCountdown(null);
    setIsQuoteExpired(false);
  };

  const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
  const toFiatData = fiatCurrencies.find((f) => f.code === toFiat);

  const maxAmount = fromCryptoData ? fromCryptoData.balance : 0;

  const getConversionRate = () => {
    if (quote && quote.rate) {
      return quote.rate;
    }
    return 0;
  };

  const getEstimatedAmount = () => {
    if (!quote) return 0;

    // When reversed (buy direction: fiat to crypto), show cryptoAmount
    // When not reversed (sell direction: crypto to fiat), show fiatAmount
    if (isReversed) {
      return quote.cryptoAmount !== undefined && quote.cryptoAmount !== null
        ? quote.cryptoAmount
        : 0;
    } else {
      return quote.fiatAmount !== undefined && quote.fiatAmount !== null
        ? quote.fiatAmount
        : 0;
    }
  };

  const getFeeAmount = () => {
    if (quote && quote.spreadBps !== undefined && amount) {
      const cryptoValueInUSD = parseFloat(amount) * (fromCryptoData?.price || 0);
      const feePercentage = quote.spreadBps / 10000;
      return cryptoValueInUSD * feePercentage;
    }
    return 0;
  };

  const getFeePercentage = () => {
    if (quote && quote.spreadBps !== undefined) {
      return quote.spreadBps / 100;
    }
    return 0;
  };

  const conversionRate = getConversionRate();
  const estimatedAmount = getEstimatedAmount();
  const feeAmount = getFeeAmount();
  const feePercentage = getFeePercentage();

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden hide-scrollbar">
      {/* Header */}
      <div className="px-5 pt-3 pb-3">
        <button
          onClick={() => {
            if (location.state?.fromCrypto) {
              navigate("/", { state: { showCrypto: true, transactionCompleted: true } });
            } else if (location.state?.fromFiat) {
              navigate("/", { state: { showFiat: true, transactionCompleted: true } });
            } else {
              navigate(-1);
            }
          }}
          className="text-white/80 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-0.5">Convert {isReversed ? 'Fiat' : 'Crypto'}</h1>
          <p className="text-xs text-white/60">{isReversed ? 'Fiat to crypto' : 'Crypto to fiat'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 scrollable-area">
        <div className="space-y-4 pb-4">
          {/* From Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-normal text-white/70">From ({isReversed ? 'Fiat' : 'Crypto'})</h2>
              {isReversed ? (
                toFiatData && (
                  <p className="text-xs text-white/70">
                    Balance: {getFiatBalance(toFiat).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toFiatData.code}
                  </p>
                )
              ) : (
                fromCryptoData && (
                  <p className="text-xs text-white/70">
                    Balance: {maxAmount.toFixed(6)} {fromCryptoData.symbol}
                  </p>
                )
              )}
            </div>

            {!isReversed ? (
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
                {availableCryptos.map((crypto) => (
                  <SelectItem
                    key={crypto.id}
                    value={crypto.id}
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
            ) : (
              <Select value={toFiat} onValueChange={setToFiat}>
              <SelectTrigger className="h-14 bg-white/[0.06] border-white/10 rounded-2xl text-white hover:bg-white/[0.08] transition-colors">
                <SelectValue>
                  {toFiatData && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                        {toFiatData.flag}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white text-base">{toFiatData.code}</p>
                        <p className="text-sm text-white/60">{toFiatData.name}</p>
                      </div>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {fiatCurrencies.map((fiat) => (
                  <SelectItem
                    key={fiat.code}
                    value={fiat.code}
                    className="text-white hover:bg-white/10 focus:bg-white/10"
                  >
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                        {fiat.flag}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-base">{fiat.code}</p>
                        <p className="text-sm text-white/60">{fiat.name}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            )}

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
          <div className="flex justify-center -my-2 relative z-10">
            <motion.button
              onClick={handleSwapDirection}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-[hsl(180,60%,50%)] hover:bg-[hsl(180,60%,45%)] flex items-center justify-center shadow-lg border-4 border-black transition-colors"
            >
              <ArrowUpDown size={20} className="text-white" />
            </motion.button>
          </div>

          {/* To Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-2"
          >
            <h2 className="text-xs font-normal text-white/70">To ({isReversed ? 'Crypto' : 'Fiat Currency'})</h2>

            {!isReversed ? (
              <Select value={toFiat} onValueChange={setToFiat}>
              <SelectTrigger className="h-14 bg-white/[0.06] border-2 border-[hsl(180,60%,50%)] rounded-2xl text-white hover:bg-white/[0.08] transition-colors">
                <SelectValue>
                  {toFiatData && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                        {toFiatData.flag}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white text-base">{toFiatData.code}</p>
                        <p className="text-sm text-white/60">{toFiatData.name}</p>
                      </div>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {fiatCurrencies.map((fiat) => (
                  <SelectItem
                    key={fiat.code}
                    value={fiat.code}
                    className="text-white hover:bg-white/10 focus:bg-white/10"
                  >
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                        {fiat.flag}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-base">{fiat.code}</p>
                        <p className="text-sm text-white/60">{fiat.name}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            ) : (
              <Select value={fromCrypto} onValueChange={setFromCrypto}>
              <SelectTrigger className="h-14 bg-white/[0.06] border-2 border-[hsl(180,60%,50%)] rounded-2xl text-white hover:bg-white/[0.08] transition-colors">
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
                {availableCryptos.map((crypto) => (
                  <SelectItem
                    key={crypto.id}
                    value={crypto.id}
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
            )}

            <div className="pt-2">
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-1">
                  {isReversed
                    ? (estimatedAmount ? estimatedAmount.toFixed(8) : "0.00000000")
                    : (estimatedAmount ? estimatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00")
                  }
                </div>
                <p className="text-xs text-white/60">
                  You'll receive approximately
                </p>
              </div>
            </div>
          </motion.div>

          {/* Conversion Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-2 pt-1"
          >
            <h3 className="text-sm font-semibold text-white">Conversion Details</h3>
            {quoteError ? (
              <div className="flex items-center justify-center py-4">
                <span className="text-xs text-red-400">{quoteError}</span>
              </div>
            ) : isLoadingQuote ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                <span className="ml-2 text-xs text-white/50">Fetching quote...</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/70">Exchange Rate</span>
                  <span className="text-xs font-medium text-white">
                    {isReversed
                      ? `1 ${toFiatData?.code} = ${(1 / conversionRate).toFixed(8)} ${fromCryptoData?.symbol}`
                      : `1 ${fromCryptoData?.symbol} = ${conversionRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toFiatData?.code}`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/70">Conversion Fee</span>
                  <span className="text-xs font-medium text-orange-500">
                    {feePercentage}% (-${feeAmount.toFixed(2)})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/70">Processing Time</span>
                  <span className="text-xs text-[hsl(180,60%,60%)]">Instant</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* You'll receive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="border-t border-white/10 pt-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-white/90">You'll receive</span>
              <span className="text-sm font-semibold text-white">
                {isReversed
                  ? `${estimatedAmount ? estimatedAmount.toFixed(8) : "0"} ${fromCryptoData?.symbol}`
                  : `${estimatedAmount ? Math.floor(estimatedAmount).toLocaleString() : "0"} ${toFiatData?.code}`
                }
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="px-5 py-3 pb-5 bg-black border-t border-white/10">
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
            disabled={!fromCrypto || !toFiat || !amount || parseFloat(amount) <= 0 || isSubmitting || isPinModalOpen || isLoadingQuote || !quote}
            className="flex-1 py-3 rounded-2xl bg-[hsl(180,60%,45%)] hover:bg-[hsl(180,60%,40%)] disabled:bg-[hsl(180,60%,25%)] disabled:text-white/50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoadingQuote ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Loading...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : isQuoteExpired ? (
              <>
                <Repeat2 size={18} />
                Refresh Rate
              </>
            ) : (
              <>
                <Repeat2 size={18} />
                {quoteCountdown !== null
                  ? `Convert (${quoteCountdown}s)`
                  : isReversed
                    ? `Convert to ${fromCryptoData?.symbol || "Crypto"}`
                    : `Convert to ${toFiatData?.code || "NGN"}`
                }
              </>
            )}
          </button>
        </div>
      </div>

      <PinConfirmationModal
        isOpen={isPinModalOpen}
        onClose={handlePinModalClose}
        onConfirm={handlePinConfirmed}
        transactionType="conversion"
      />
    </div>
  );
};

export default ConvertPage;
