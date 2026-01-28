import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send as SendIcon, QrCode, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/components/ui/use-toast";
import PinConfirmationModal from "@/components/modals/PinConfirmationModal";
import QrScannerModal from "@/components/modals/QrScannerModal";

const Send = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cryptos, sendExternalCrypto } = useWallet();
  const { toast } = useToast();

  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const usdtChains = [
    { id: "ethereum", name: "Ethereum (ERC-20)", shortName: "ETH" },
    { id: "arbitrum", name: "Arbitrum", shortName: "ARB" },
    { id: "bsc", name: "BNB Smart Chain (BEP-20)", shortName: "BSC" },
    { id: "optimism", name: "Optimism", shortName: "OP" },
  ];

  // Set selected crypto from navigation state if available
  useEffect(() => {
    if (location.state?.selectedCrypto) {
      setSelectedCrypto(location.state.selectedCrypto);
    } else if (cryptos.length > 0) {
      setSelectedCrypto(cryptos[0].id);
    }
  }, [location.state, cryptos]);

  useEffect(() => {
    if (selectedCrypto === "usdt") {
      setSelectedChain(usdtChains[0].id);
    } else {
      setSelectedChain("");
    }
  }, [selectedCrypto]);

  const handleAmountChange = (e) => {
    // Allow only numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    const crypto = cryptos.find((c) => c.id === selectedCrypto);
    if (crypto) {
      setAmount(crypto.balance.toString());
    }
  };

  const handleScanQR = () => {
    setIsQrScannerOpen(true);
  };

  const handleQrScan = (scannedAddress) => {
    setAddress(scannedAddress);
    setIsQrScannerOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCrypto || !amount || !address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (selectedCrypto === "usdt" && !selectedChain) {
      toast({
        title: "Network Required",
        description: "Please select a network for USDT.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const selectedCryptoData = cryptos.find((c) => c.id === selectedCrypto);
    if (!selectedCryptoData) {
      toast({
        title: "Invalid Cryptocurrency",
        description: "Please select a valid cryptocurrency.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > selectedCryptoData.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${selectedCryptoData.symbol}.`,
        variant: "destructive",
      });
      return;
    }

    // Store transaction details and open PIN modal
    setPendingTransaction({
      cryptoId: selectedCrypto,
      amount: parseFloat(amount),
      address: address,
      chain: selectedCrypto === "usdt" ? selectedChain : null
    });
    setIsPinModalOpen(true);
  };

  const handlePinConfirmed = async (pin) => {
    if (!pendingTransaction) return;

    setIsSubmitting(true);

    const success = await sendExternalCrypto(
      pendingTransaction.cryptoId,
      pendingTransaction.amount,
      pendingTransaction.address,
      pendingTransaction.chain,
      pin
    );

    setIsSubmitting(false);
    setPendingTransaction(null);

    if (success) {
      // Reset form
      setAmount("");
      setAddress("");

      // Navigate back to dashboard
      setTimeout(() => {
        if (location.state?.fromCrypto) {
          navigate("/", { state: { showCrypto: true, transactionCompleted: true } });
        } else {
          navigate("/", { state: { transactionCompleted: true } });
        }
      }, 1500);
    }
  };

  const handlePinModalClose = () => {
    setIsPinModalOpen(false);
    setPendingTransaction(null);
  };

  const selectedCryptoData = cryptos.find((c) => c.id === selectedCrypto);
  const maxAmount = selectedCryptoData ? selectedCryptoData.balance : 0;
  const estimatedValue = selectedCryptoData && amount 
    ? (parseFloat(amount) * selectedCryptoData.price).toLocaleString('en-US', { maximumFractionDigits: 2 })
    : "0.00";

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden hide-scrollbar">
      {/* Header */}
      <div className="px-5 pt-3 pb-3">
        <button
          onClick={() => {
            if (location.state?.fromCrypto) {
              navigate("/", { state: { showCrypto: true } });
            } else {
              navigate(-1);
            }
          }}
          className="text-white/80 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-0.5">Send Crypto</h1>
          <p className="text-xs text-white/60">External transfer</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 scrollable-area">
        <div className="space-y-4 pb-4">

          {/* Asset Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-normal text-white/70">Select Asset</h2>
              {selectedCryptoData && (
                <p className="text-xs text-white/70">
                  Balance: {maxAmount.toFixed(6)} {selectedCryptoData.symbol}
                </p>
              )}
            </div>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger className="h-14 bg-white/[0.06] border-white/10 rounded-2xl text-white hover:bg-white/[0.08] transition-colors">
                <SelectValue placeholder="Choose cryptocurrency" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {cryptos.map((crypto) => (
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
          </motion.div>

          {/* Chain Selection (Only for USDT) */}
          {selectedCrypto === "usdt" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <h2 className="text-xs font-normal text-white/70">Select Network</h2>
              <Select value={selectedChain} onValueChange={setSelectedChain}>
                <SelectTrigger className="h-14 bg-white/[0.06] border-white/10 rounded-2xl text-white hover:bg-white/[0.08] transition-colors">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">
                      {usdtChains.find(c => c.id === selectedChain)?.name}
                    </span>
                    <ChevronDown className="h-5 w-5 text-white/70" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  {usdtChains.map((chain) => (
                    <SelectItem
                      key={chain.id}
                      value={chain.id}
                      className="text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      <div className="py-1">
                        <p className="font-semibold text-white text-base">{chain.name}</p>
                        <p className="text-sm text-white/60">{chain.shortName}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-yellow-500/90">
                Make sure the recipient address is on the same network
              </p>
            </motion.div>
          )}

          {/* Amount Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-2 pt-2"
          >
            <h2 className="text-xs font-normal text-white/70">Amount</h2>

            <div className="pt-2">
              <div className="text-center mb-4">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="w-full text-center text-4xl font-light bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-white/20"
                />
                <p className="text-xs text-white/60 mt-1">
                  ≈ ${estimatedValue}
                </p>
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

          {/* Recipient Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-2"
          >
            <h2 className="text-xs font-normal text-white/70">Send To</h2>
            <div className="bg-white/[0.06] rounded-2xl p-4 space-y-3 border border-white/10">
              <div className="relative">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Paste wallet address or scan QR"
                  className="w-full h-12 pr-12 bg-transparent border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[hsl(180,60%,50%)] px-3"
                />
                <button
                  type="button"
                  onClick={handleScanQR}
                  className="absolute right-1 top-1 h-10 w-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <QrCode className="h-5 w-5 text-[hsl(180,60%,50%)]" />
                </button>
              </div>
              <p className="text-xs text-white/60 text-center">
                Only send {selectedCryptoData?.name} to {selectedCryptoData?.name} addresses
                {selectedCrypto === "usdt" && selectedChain && (
                  <span className="block mt-1 text-yellow-500 font-medium">
                    Network: {usdtChains.find(c => c.id === selectedChain)?.name}
                  </span>
                )}
              </p>
            </div>
          </motion.div>

          {/* Transaction Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="space-y-2 pt-1"
          >
            <h3 className="text-sm font-semibold text-white">Transaction Details</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">Network Fee</span>
                <span className="text-xs font-medium text-orange-500">~$2.50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">Processing Time</span>
                <span className="text-xs text-[hsl(180,60%,60%)]">5-15 min</span>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-white/90">Total Amount</span>
                <div className="text-right">
                  <p className="text-xs font-semibold text-white">{amount || "0"} {selectedCryptoData?.symbol}</p>
                  <p className="text-xs text-white/60">≈ ${estimatedValue}</p>
                </div>
              </div>
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
                navigate("/", { state: { showCrypto: true } });
              } else {
                navigate(-1);
              }
            }}
            className="px-6 py-3 rounded-2xl border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedCrypto || !amount || !address || isSubmitting || isPinModalOpen}
            className="flex-1 py-3 rounded-2xl bg-[hsl(180,60%,45%)] hover:bg-[hsl(180,60%,40%)] disabled:bg-[hsl(180,60%,25%)] disabled:text-white/50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-5 w-5 border-2 border-transparent border-t-white rounded-full"
                />
                Processing...
              </>
            ) : (
              <>
                <SendIcon className="h-5 w-5" />
                Send
              </>
            )}
          </button>
        </div>
      </div>

      <PinConfirmationModal
        isOpen={isPinModalOpen}
        onClose={handlePinModalClose}
        onConfirm={handlePinConfirmed}
        transactionType="external transfer"
      />

      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScan={handleQrScan}
      />
    </div>
  );
};

export default Send;