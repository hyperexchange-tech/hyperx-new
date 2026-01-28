import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send as SendIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/components/ui/use-toast";

const InternalTransfer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cryptos, sendCrypto } = useWallet();
  const { toast } = useToast();
  
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [activeTab, setActiveTab] = useState("userid");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set selected crypto from navigation state if available
  useEffect(() => {
    if (location.state?.selectedCrypto) {
      setSelectedCrypto(location.state.selectedCrypto);
    } else if (cryptos.length > 0) {
      setSelectedCrypto(cryptos[0].id);
    }
  }, [location.state, cryptos]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    const crypto = cryptos.find((c) => c.id === selectedCrypto);
    if (crypto) {
      setAmount(crypto.balance.toString());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const recipient = activeTab === "userid" ? recipientId : recipientEmail;
    
    if (!recipient) {
      toast({
        title: "Missing Recipient",
        description: `Please enter a ${activeTab === "userid" ? "User ID" : "email address"}.`,
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
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

    setIsSubmitting(true);
    
    // Simulate internal transfer (in a real app, this would be an API call)
    setTimeout(() => {
      const success = sendCrypto(
        selectedCrypto,
        parseFloat(amount),
        `Internal: ${recipient}`
      );
      
      setIsSubmitting(false);
      
      if (success) {
        toast({
          title: "Internal Transfer Successful",
          description: `Sent ${amount} ${selectedCryptoData.symbol} to ${recipient}`,
        });
        
        // Reset form
        setAmount("");
        setRecipientId("");
        setRecipientEmail("");
        
        // Navigate back to dashboard
        setTimeout(() => {
          if (location.state?.fromCrypto) {
            navigate("/", { state: { showCrypto: true, transactionCompleted: true } });
          } else {
            navigate("/");
          }
        }, 1500);
      }
    }, 1000);
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
              navigate("/", { state: { showCrypto: true, transactionCompleted: true } });
            } else {
              navigate(-1);
            }
          }}
          className="text-white/80 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-0.5">Internal Transfer</h1>
          <p className="text-xs text-white/60">Free & Instant</p>
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
                <SelectValue placeholder="Choose cryptocurrency">
                  {selectedCryptoData && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5">
                        <CryptoIcon name={selectedCryptoData.id} color={selectedCryptoData.color} size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white text-base">{selectedCryptoData.symbol}</p>
                        <p className="text-sm text-white/60">{selectedCryptoData.name}</p>
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

          {/* Amount Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-2"
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
                  = ${estimatedValue}
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

          {/* Recipient Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-2"
          >
            <h2 className="text-xs font-normal text-white/70">Send To</h2>
            <div className="space-y-3">
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("userid")}
                  className={`px-8 py-2 rounded-full text-xs font-medium transition-colors ${
                    activeTab === "userid"
                      ? "bg-white/[0.06] border border-white/20 text-white"
                      : "border border-white/20 bg-transparent text-white/70 hover:bg-white/5"
                  }`}
                >
                  User ID
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("email")}
                  className={`px-8 py-2 rounded-full text-xs font-medium transition-colors ${
                    activeTab === "email"
                      ? "bg-white/[0.06] border border-white/20 text-white"
                      : "border border-white/20 bg-transparent text-white/70 hover:bg-white/5"
                  }`}
                >
                  Email
                </button>
              </div>

              {activeTab === "userid" ? (
                <div className="space-y-2">
                  <input
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    placeholder="Enter User ID (e.g @john_doe)"
                    className="w-full h-12 px-4 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder:text-white/40 outline-none focus:border-white/20 transition-colors"
                  />
                  <p className="text-xs text-white/60 text-center">
                    Enter the recipient's HyperX User ID
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full h-12 px-4 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder:text-white/40 outline-none focus:border-white/20 transition-colors"
                  />
                  <p className="text-xs text-white/60 text-center">
                    Enter the recipient's registered email address
                  </p>
                </div>
              )}
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
                <span className="text-xs text-white/70">Transfer Fee</span>
                <span className="text-xs font-medium text-green-500">FREE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">Processing Time</span>
                <span className="text-xs text-[hsl(180,60%,60%)]">Instant</span>
              </div>
            </div>
          </motion.div>

          {/* You'll Send Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="border-t border-white/10 pt-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-white/90">You'll send</span>
              <span className="text-sm font-semibold text-white">
                {amount || "0"} {selectedCryptoData?.symbol}
              </span>
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-xs text-white/60">~ ${estimatedValue}</span>
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
            onClick={handleSubmit}
            disabled={!selectedCrypto || !amount || (!recipientId && !recipientEmail) || isSubmitting}
            className="flex-1 py-3 rounded-2xl bg-[hsl(180,60%,45%)] hover:bg-[hsl(180,60%,40%)] disabled:bg-[hsl(180,60%,25%)] disabled:text-white/50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-4 w-4 border-2 border-transparent border-t-white rounded-full"
                />
                Processing...
              </>
            ) : (
              <>
                <SendIcon size={18} />
                Send Internally
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternalTransfer;