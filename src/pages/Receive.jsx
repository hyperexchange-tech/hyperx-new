import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, Share2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/components/ui/use-toast";
import QRCodeStylized from 'qrcode.react';

const Receive = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { cryptos, getWalletAddress, receiveCrypto } = useWallet();

  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(false);

  const usdtChains = [
    { id: "ethereum", name: "Ethereum (ERC-20)", shortName: "ETH" },
    { id: "arbitrum", name: "Arbitrum", shortName: "ARB" },
    { id: "bsc", name: "BNB Smart Chain (BEP-20)", shortName: "BSC" },
    { id: "optimism", name: "Optimism", shortName: "OP" },
  ];

  useEffect(() => {
    if (cryptos.length > 0) {
      setSelectedCrypto(cryptos[0].id);
    }
  }, [cryptos]);

  useEffect(() => {
    if (selectedCrypto === "usdt") {
      setSelectedChain(usdtChains[0].id);
    } else {
      setSelectedChain("");
    }
  }, [selectedCrypto]);

  useEffect(() => {
    if (selectedCrypto) {
      const address = selectedCrypto === "usdt" && selectedChain
        ? getWalletAddress(selectedCrypto, selectedChain)
        : getWalletAddress(selectedCrypto);
      setWalletAddress(address);
    }
  }, [selectedCrypto, selectedChain, getWalletAddress]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receive ${selectedCryptoData?.name}`,
          text: `Send ${selectedCryptoData?.name} to this address: ${walletAddress}`,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          handleCopyAddress();
        }
      }
    } else {
      handleCopyAddress();
    }
  };

  const selectedCryptoData = cryptos.find((c) => c.id === selectedCrypto);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-4 scrollable-area">
        <div className="max-w-2xl mx-auto w-full space-y-4">
          {/* Page Title */}
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Receive Crypto</h1>
            <p className="text-sm text-white/70">Get cryptocurrency to your wallet</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Asset Selection */}
            <div className="space-y-2">
              <label className="text-sm text-white/90 font-normal">Select Asset</label>
              <Select
                value={selectedCrypto}
                onValueChange={setSelectedCrypto}
              >
                <SelectTrigger className="h-[68px] bg-white/5 border-white/10 rounded-2xl text-white hover:bg-white/10 transition-colors">
                  {selectedCryptoData && (
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <CryptoIcon name={selectedCryptoData.id} color={selectedCryptoData.color} size={40} />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-base text-white">{selectedCryptoData.symbol}</p>
                        <p className="text-sm text-white/70">{selectedCryptoData.name}</p>
                      </div>
                      <ChevronDown className="h-5 w-5 text-white/70" />
                    </div>
                  )}
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  {cryptos.map((crypto) => (
                    <SelectItem key={crypto.id} value={crypto.id} className="text-white hover:bg-white/10 focus:bg-white/10">
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center">
                          <CryptoIcon name={crypto.id} color={crypto.color} size={40} />
                        </div>
                        <div>
                          <p className="font-bold text-base text-white">{crypto.symbol}</p>
                          <p className="text-sm text-white/70">{crypto.name}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chain Selection (Only for USDT) */}
            {selectedCrypto === "usdt" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <label className="text-sm text-white/90 font-normal">Select Network</label>
                <Select
                  value={selectedChain}
                  onValueChange={setSelectedChain}
                >
                  <SelectTrigger className="h-[56px] bg-white/5 border-white/10 rounded-2xl text-white hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-white">
                        {usdtChains.find(c => c.id === selectedChain)?.name}
                      </span>
                      <ChevronDown className="h-5 w-5 text-white/70" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {usdtChains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id} className="text-white hover:bg-white/10 focus:bg-white/10">
                        <div className="py-1">
                          <p className="font-medium text-white">{chain.name}</p>
                          <p className="text-xs text-white/60">{chain.shortName}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-yellow-500/90">
                  Make sure the sender uses the same network to avoid loss of funds
                </p>
              </motion.div>
            )}

            {/* QR Code Section */}
            {walletAddress && (
              <div className="space-y-3">
                <h3 className="text-sm font-normal text-center text-white">QR Code</h3>
                <div className="flex justify-center">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <QRCodeStylized
                      value={walletAddress}
                      size={200}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>
                <p className="text-center text-xs text-white/90">
                  Scan this QR Code to receive {selectedCryptoData?.name}
                  {selectedCrypto === "usdt" && selectedChain && (
                    <span className="block mt-1 text-[hsl(180,60%,50%)] font-medium">
                      Network: {usdtChains.find(c => c.id === selectedChain)?.name}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Wallet Address */}
            <div className="space-y-2">
              <label className="text-sm text-white/90 font-normal">
                Your {selectedCryptoData?.name} Address
                {selectedCrypto === "usdt" && selectedChain && (
                  <span className="text-[hsl(180,60%,50%)] ml-2">
                    ({usdtChains.find(c => c.id === selectedChain)?.shortName})
                  </span>
                )}
              </label>
              <div className="space-y-2">
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 group hover:bg-white/10 transition-colors">
                  <p className="flex-1 text-xs font-mono text-white/90 break-all pr-3">
                    {walletAddress}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-white/10 text-[hsl(180,60%,50%)] flex-shrink-0"
                    onClick={handleCopyAddress}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-white/70 text-center">
                  Only send {selectedCryptoData?.name} ({selectedCryptoData?.symbol})
                  {selectedCrypto === "usdt" && selectedChain && (
                    <span className="text-[hsl(180,60%,50%)] font-medium">
                      {" "}on {usdtChains.find(c => c.id === selectedChain)?.name}
                    </span>
                  )} to this address
                </p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-yellow-500">Important Notice</h3>
              <div className="space-y-1.5 text-xs text-white/90 leading-relaxed">
                <p>. Only send {selectedCryptoData?.name} to this address</p>
                {selectedCrypto === "usdt" && selectedChain && (
                  <p>. <span className="font-semibold text-yellow-500">CRITICAL:</span> Only send USDT on {usdtChains.find(c => c.id === selectedChain)?.name} network</p>
                )}
                {selectedCrypto === "usdt" && (
                  <p>. Using a different network will result in permanent loss of funds</p>
                )}
                <p>. Sending other cryptocurrencies may result in permanent loss</p>
                <p>. Always verify the address {selectedCrypto === "usdt" ? "and network " : ""}before sending</p>
                <p>. Transactions are irreversible once confirmed</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="border-t border-white/10 p-5 pb-8 bg-background">
        <div className="flex gap-4 max-w-2xl mx-auto w-full">
          <Button
            variant="ghost"
            onClick={() => {
              if (location.state?.fromCrypto) {
                navigate("/", { state: { showCrypto: true } });
              } else {
                navigate(-1);
              }
            }}
            className="h-14 px-8 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-semibold text-base text-white"
          >
            Back
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1 h-14 bg-[hsl(180,60%,50%)] hover:bg-[hsl(180,60%,45%)] text-white font-semibold text-base rounded-2xl flex items-center justify-center gap-2"
          >
            <Share2 className="h-5 w-5" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Receive;