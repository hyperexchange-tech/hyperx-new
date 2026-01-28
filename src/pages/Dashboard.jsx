import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, List, Search, Eye, EyeOff, ChevronDown, History, Repeat, Filter, Wallet, Bell, Plus, ChevronLeft } from 'lucide-react';
import { Users, Building2, Receipt, ArrowRightLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { cn } from "@/lib/utils";
import TransferTypeModal from "@/components/modals/TransferTypeModal";
import DepositTypeModal from "@/components/modals/DepositTypeModal";
import NotificationModal from "@/components/modals/NotificationModal";
import FiatDepositModal from "@/components/modals/FiatDepositModal";

const ActionButton = ({ icon: Icon, label, onClick, className }) => (
  <motion.div
    className="flex flex-col items-center gap-1.5"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Button
      variant="ghost"
      size="icon"
      className={cn("bg-muted/30 hover:bg-muted/50 border-border/30 border rounded-full w-14 h-14", className)}
      onClick={onClick}
    >
      <Icon className="h-5 w-5 text-foreground" />
    </Button>
    <span className="text-[11px] text-foreground">{label}</span>
  </motion.div>
);

const AssetRowNew = ({ crypto, onClick, isBalanceVisible }) => {
  const { symbol, name, balance, price, color } = crypto;
  const value = balance * price;
  const percentChange = (Math.random() * 2 - 1).toFixed(2);
  const isPositive = parseFloat(percentChange) >= 0;

  return (
    <motion.div
      className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/10 cursor-pointer transition-colors duration-150 border-b border-border/20 last:border-0"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
          <CryptoIcon name={crypto.id} color={color} size={36}/>
        </div>
        <div>
          <p className="font-bold text-sm text-white mb-0.5">{symbol}</p>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-white/90">{isBalanceVisible ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '****'}</span>
            <span className={cn("font-medium", isPositive ? "text-green-500" : "text-red-500")}>
              {isBalanceVisible ? `${isPositive ? "" : ""}${percentChange}%` : '****'}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-sm text-white mb-0.5">{isBalanceVisible ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '****'}</p>
        <p className="text-[11px] text-white/70">{isBalanceVisible ? balance.toFixed(4) : '****'}</p>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cryptos, fiatBalances, getTotalBalance, loadingBalances, loadingFiatBalances, fetchWalletBalances, fetchFiatBalances, setCurrentSection } = useWallet();
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [assetSearchTerm, setAssetSearchTerm] = useState("");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isFiatDepositModalOpen, setIsFiatDepositModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    location.state?.showFiat ? 1 : location.state?.showCrypto ? 0 : 0
  );

  // Update currentSection when currentPage changes
  useEffect(() => {
    setCurrentSection(currentPage === 0 ? "crypto" : "fiat");
  }, [currentPage, setCurrentSection]);
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState("NGN");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (location.state?.transactionCompleted) {
      if (location.state?.showCrypto) {
        fetchWalletBalances();
      } else if (location.state?.showFiat) {
        fetchFiatBalances();
      } else {
        fetchWalletBalances();
        fetchFiatBalances();
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const getTotalFiatBalance = () => {
    return fiatBalances.reduce((total, fiat) => {
      return total + (fiat.balance / fiat.rate);
    }, 0);
  };

  const getSelectedFiatBalance = () => {
    const selectedFiat = fiatBalances.find(fiat => fiat.code === selectedFiatCurrency);
    return selectedFiat ? selectedFiat.balance : 0;
  };

  const getSelectedFiatData = () => {
    return fiatBalances.find(fiat => fiat.code === selectedFiatCurrency);
  };

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: "deposit",
      title: "Deposit Received",
      message: "Your Bitcoin deposit has been confirmed and added to your wallet.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      isRead: false,
      amount: "0.00125",
      currency: "BTC"
    },
    {
      id: 2,
      type: "promotion",
      title: "Special Offer: 0% Trading Fees",
      message: "Trade with zero fees for the next 24 hours! Limited time offer for premium users.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: false
    },
    {
      id: 3,
      type: "security",
      title: "New Login Detected",
      message: "We detected a new login from Chrome on Windows. If this wasn't you, please secure your account.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      isRead: true
    },
    {
      id: 4,
      type: "withdrawal",
      title: "Withdrawal Processed",
      message: "Your Ethereum withdrawal has been successfully processed and sent to your external wallet.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      isRead: true,
      amount: "2.5",
      currency: "ETH"
    },
    {
      id: 5,
      type: "account",
      title: "Account Verification Complete",
      message: "Your identity verification has been approved. You can now access all platform features.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      isRead: true
    },
    {
      id: 6,
      type: "promotion",
      title: "New Feature: Auto-Invest",
      message: "Set up automatic recurring purchases for your favorite cryptocurrencies. Start building your portfolio effortlessly!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      isRead: true
    },
    {
      id: 7,
      type: "system",
      title: "Scheduled Maintenance",
      message: "We'll be performing scheduled maintenance on Sunday, 2:00 AM - 4:00 AM UTC. Trading will be temporarily unavailable.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      isRead: true
    }
  ];

  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const handleSwipe = (direction) => {
    if (direction === 'left' && currentPage === 0) {
      setCurrentPage(1);
      setCurrentSection("fiat");
    } else if (direction === 'right' && currentPage === 1) {
      setCurrentPage(0);
      setCurrentSection("crypto");
    }
  };

  const handleDepositClick = () => {
    if (currentPage === 0) {
      setIsDepositModalOpen(true);
    } else {
      setIsFiatDepositModalOpen(true);
    }
  };

  const handleDepositTypeSelect = (type) => {
    if (type === "fiat") {
      // Navigate to fiat deposit page (placeholder)
      console.log("Fiat deposit selected");
    } else if (type === "crypto") {
      navigate("/receive");
    }
  };

  const handleSendClick = () => {
    setIsTransferModalOpen(true);
  };

  const handleTransferTypeSelect = (type) => {
    if (type === "internal") {
      navigate("/internal-transfer", { state: { fromCrypto: true } });
    } else {
      navigate("/send", { state: { fromCrypto: true } });
    }
  };

  const handleRefreshBalances = async () => {
    setIsRefreshing(true);
    try {
      if (currentPage === 0) {
        await fetchWalletBalances();
      } else {
        await fetchFiatBalances();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshCryptoBalances = async () => {
    setIsRefreshing(true);
    try {
      await fetchWalletBalances();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshFiatBalances = async () => {
    setIsRefreshing(true);
    try {
      await fetchFiatBalances();
    } finally {
      setIsRefreshing(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };
  
  const filteredCryptos = cryptos.filter(c => 
    c.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
    c.symbol.toLowerCase().includes(assetSearchTerm.toLowerCase())
  );

  const totalBalance = getTotalBalance();
  const simulatedDailyChange = (totalBalance * (Math.random() * 0.02 - 0.01)); 
  const simulatedDailyPercent = (simulatedDailyChange / (totalBalance || 1)) * 100;

  return (
    <div className="space-y-3 pb-2 md:pb-4 h-full flex flex-col">
      <motion.div
        variants={item}
        initial="hidden"
        animate="show"
        className="flex-shrink-0"
      >
        <div className="relative">
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 bg-muted/30 backdrop-blur-sm border-border/50 focus:border-primary h-10 text-sm rounded-xl"
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </motion.div>
      
      {/* Mobile: Swipeable Card */}
      <motion.div variants={item} initial="hidden" animate="show" className="relative md:hidden flex-shrink-0">
        <Card className="crypto-card border-none hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait">
              {currentPage === 0 ? (
                <motion.div
                  key="crypto"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset }) => {
                    if (offset.x < -50) handleSwipe('left');
                  }}
                  className="absolute inset-0 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wallet size={18} className="text-foreground" />
                      <span className="text-sm font-medium text-foreground">Crypto Balance</span>
                    </div>
                    <button
                      onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                      className="text-foreground hover:text-foreground/80 transition-colors translate-y-[18px]"
                    >
                      {isBalanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center gap-2.5 text-[10px] z-10">
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      <span className="text-muted-foreground">MA5</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <span className="text-muted-foreground">MA10</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                      <span className="text-muted-foreground">MA20</span>
                    </span>
                  </div>

                  {loadingBalances ? (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-12 w-40 bg-muted animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-0">
                      <h1 className="text-4xl font-bold tracking-tight">
                        {isBalanceVisible ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '********'}
                      </h1>
                      <button
                        onClick={handleRefreshBalances}
                        disabled={isRefreshing || loadingBalances}
                        className="text-foreground/70 hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={16} className={cn("", isRefreshing && "animate-spin")} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center text-xs -mb-2">
                    <span className={cn(simulatedDailyChange >= 0 ? "text-green-500" : "text-red-500", "font-medium")}>
                      {isBalanceVisible
                        ? `${simulatedDailyChange >= 0 ? "+" : ""}$${Math.abs(simulatedDailyChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${simulatedDailyPercent.toFixed(2)}%) 1D`
                        : '******** 1D'
                      }
                    </span>
                  </div>

                  <div className="relative h-16 -mx-2 mb-1">
                    <img
                      src="/Assets/Candle sticks/Candlestick.svg"
                      alt="Candlestick Chart"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <Button
                    onClick={handleDepositClick}
                    className="w-full bg-[hsl(180,60%,50%)] hover:bg-[hsl(180,60%,45%)] text-white font-semibold px-6 py-2.5 rounded-[20px] transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="fiat"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset }) => {
                    if (offset.x > 50) handleSwipe('right');
                  }}
                  className="absolute inset-0 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wallet size={18} className="text-foreground" />
                      <Select value={selectedFiatCurrency} onValueChange={setSelectedFiatCurrency}>
                        <SelectTrigger className="h-6 w-auto border-none bg-transparent p-0 text-sm font-medium text-foreground hover:text-foreground/80 focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fiatBalances.map((fiat) => (
                            <SelectItem key={fiat.code} value={fiat.code}>
                              <div className="flex items-center gap-2">
                                <span className="text-base">{fiat.flag}</span>
                                <span className="font-medium">{fiat.code}</span>
                                <span className="text-xs text-muted-foreground">- {fiat.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <button
                      onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                      className="text-foreground hover:text-foreground/80 transition-colors translate-y-[18px]"
                    >
                      {isBalanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  {loadingFiatBalances ? (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-12 w-40 bg-muted animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-0">
                      <h1 className="text-4xl font-bold tracking-tight">
                        {isBalanceVisible ? `${getSelectedFiatData()?.code === 'NGN' ? '₦' : getSelectedFiatData()?.code === 'ZAR' ? 'R' : getSelectedFiatData()?.code === 'GHS' ? '₵' : 'KSh'}${getSelectedFiatBalance().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '********'}
                      </h1>
                      <button
                        onClick={handleRefreshBalances}
                        disabled={isRefreshing || loadingFiatBalances}
                        className="text-foreground/70 hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={16} className={cn("", isRefreshing && "animate-spin")} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center text-xs -mb-2">
                    <span className="text-green-500 font-medium">
                      {isBalanceVisible
                        ? `+${getSelectedFiatData()?.code === 'NGN' ? '₦' : getSelectedFiatData()?.code === 'ZAR' ? 'R' : getSelectedFiatData()?.code === 'GHS' ? '₵' : 'KSh'}${(getSelectedFiatBalance() * 0.021).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (2.1%) 1D`
                        : '******** 1D'
                      }
                    </span>
                  </div>

                  <div className="h-12 -mb-1"></div>

                  <Button
                    onClick={handleDepositClick}
                    className="w-full bg-[hsl(180,60%,50%)] hover:bg-[hsl(180,60%,45%)] text-white font-semibold px-6 py-2.5 rounded-[20px] transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {/* Desktop: Two Separate Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="hidden md:grid md:grid-cols-2 gap-4">
        {/* Crypto Balance Card */}
        <Card className="crypto-card border-none hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-foreground" />
                <span className="text-sm font-medium text-foreground">Crypto Balance</span>
              </div>
              <button
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="text-foreground hover:text-foreground/80 transition-colors translate-y-[18px]"
              >
                {isBalanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div className="absolute top-6 right-6 flex items-center gap-2.5 text-[10px] z-10">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span className="text-muted-foreground">MA5</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                <span className="text-muted-foreground">MA10</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                <span className="text-muted-foreground">MA20</span>
              </span>
            </div>

            {loadingBalances ? (
              <div className="flex items-center gap-2 mb-1">
                <div className="h-12 w-40 bg-muted animate-pulse rounded"></div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 mb-0">
                <h1 className="text-5xl font-bold tracking-tight">
                  {isBalanceVisible ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '********'}
                </h1>
                <button
                  onClick={handleRefreshCryptoBalances}
                  disabled={isRefreshing || loadingBalances}
                  className="text-foreground/70 hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={18} className={cn("", isRefreshing && "animate-spin")} />
                </button>
              </div>
            )}
            <div className="flex items-center text-xs -mb-3">
              <span className={cn(simulatedDailyChange >= 0 ? "text-green-500" : "text-red-500", "font-medium")}>
                {isBalanceVisible
                  ? `${simulatedDailyChange >= 0 ? "+" : ""}$${Math.abs(simulatedDailyChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${simulatedDailyPercent.toFixed(2)}%) 1D`
                  : '******** 1D'
                }
              </span>
            </div>

            <div className="relative h-20 -mx-2 mb-1">
              <img
                src="/Assets/Candle sticks/Candlestick.svg"
                alt="Candlestick Chart"
                className="w-full h-full object-cover"
              />
            </div>

            <Button
              onClick={() => {
                setIsDepositModalOpen(true);
              }}
              className="w-full bg-[hsl(180,60%,50%)] hover:bg-[hsl(180,60%,45%)] text-white font-semibold px-6 py-3 rounded-[20px] transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Deposit
            </Button>
          </CardContent>
        </Card>

        {/* Fiat Balance Card */}
        <Card className="crypto-card border-none hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-foreground" />
                <Select value={selectedFiatCurrency} onValueChange={setSelectedFiatCurrency}>
                  <SelectTrigger className="h-6 w-auto border-none bg-transparent p-0 text-sm font-medium text-foreground hover:text-foreground/80 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fiatBalances.map((fiat) => (
                      <SelectItem key={fiat.code} value={fiat.code}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{fiat.flag}</span>
                          <span className="font-medium">{fiat.code}</span>
                          <span className="text-xs text-muted-foreground">- {fiat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="text-foreground hover:text-foreground/80 transition-colors translate-y-[18px]"
              >
                {isBalanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {loadingFiatBalances ? (
              <div className="flex items-center gap-2 mb-1">
                <div className="h-12 w-40 bg-muted animate-pulse rounded"></div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 mb-0">
                <h1 className="text-5xl font-bold tracking-tight">
                  {isBalanceVisible ? `${getSelectedFiatData()?.code === 'NGN' ? '₦' : getSelectedFiatData()?.code === 'ZAR' ? 'R' : getSelectedFiatData()?.code === 'GHS' ? '₵' : 'KSh'}${getSelectedFiatBalance().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '********'}
                </h1>
                <button
                  onClick={handleRefreshFiatBalances}
                  disabled={isRefreshing || loadingFiatBalances}
                  className="text-foreground/70 hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={18} className={cn("", isRefreshing && "animate-spin")} />
                </button>
              </div>
            )}
            <div className="flex items-center text-xs -mb-3">
              <span className="text-green-500 font-medium">
                {isBalanceVisible
                  ? `+${getSelectedFiatData()?.code === 'NGN' ? '₦' : getSelectedFiatData()?.code === 'ZAR' ? 'R' : getSelectedFiatData()?.code === 'GHS' ? '₵' : 'KSh'}${(getSelectedFiatBalance() * 0.021).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (2.1%) 1D`
                  : '******** 1D'
                }
              </span>
            </div>

            <div className="h-12 -mb-1"></div>

            <Button
              onClick={() => {
                setIsFiatDepositModalOpen(true);
              }}
              className="w-full bg-[hsl(180,60%,50%)] hover:bg-[hsl(180,60%,45%)] text-white font-semibold px-6 py-3 rounded-[20px] transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Deposit
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mobile: Action buttons that switch based on currentPage */}
      <AnimatePresence mode="wait">
        {currentPage === 0 ? (
          <motion.div
            key="crypto-actions"
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="grid grid-cols-4 gap-x-2 gap-y-2 items-start justify-items-center px-2 py-3 md:hidden flex-shrink-0"
          >
            <ActionButton icon={ArrowUpRight} label="Send" onClick={handleSendClick} className="hover:scale-105 transition-transform duration-200" />
            <ActionButton icon={ArrowDownLeft} label="Receive" onClick={() => navigate("/receive", { state: { fromCrypto: true } })} />
            <ActionButton icon={Repeat} label="Convert" onClick={() => navigate("/convert", { state: { fromCrypto: true } })} />
            <ActionButton icon={History} label="History" onClick={() => navigate("/history", { state: { fromCrypto: true } })} />
          </motion.div>
        ) : (
          <motion.div
            key="fiat-actions"
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="grid grid-cols-4 gap-x-2 gap-y-2 items-start justify-items-center px-2 py-3 md:hidden flex-shrink-0"
          >
            <ActionButton icon={Building2} label="Send" onClick={() => navigate("/send-fiat", { state: { fromFiat: true } })} />
            <ActionButton icon={Receipt} label="Bill" onClick={() => navigate("/bill-payments", { state: { fromFiat: true } })} />
            <ActionButton icon={Repeat} label="Convert" onClick={() => navigate("/convert", { state: { fromFiat: true } })} />
            <ActionButton icon={History} label="History" onClick={() => navigate("/history", { state: { fromFiat: true } })} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: All action buttons visible */}
      <motion.div variants={container} initial="hidden" animate="show" className="hidden md:grid md:grid-cols-2 gap-4">
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 items-start justify-items-center px-2 py-4">
          <ActionButton icon={ArrowUpRight} label="Send" onClick={handleSendClick} className="hover:scale-105 transition-transform duration-200" />
          <ActionButton icon={ArrowDownLeft} label="Receive" onClick={() => navigate("/receive", { state: { fromCrypto: true } })} />
          <ActionButton icon={Repeat} label="Convert" onClick={() => navigate("/convert", { state: { fromCrypto: true } })} />
          <ActionButton icon={History} label="History" onClick={() => navigate("/history", { state: { fromCrypto: true } })} />
        </div>
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 items-start justify-items-center px-2 py-4">
          <ActionButton icon={Building2} label="Send" onClick={() => navigate("/send-fiat", { state: { fromFiat: true } })} />
          <ActionButton icon={Receipt} label="Bill" onClick={() => navigate("/bill-payments", { state: { fromFiat: true } })} />
          <ActionButton icon={Repeat} label="Convert" onClick={() => navigate("/convert", { state: { fromFiat: true } })} />
          <ActionButton icon={History} label="History" onClick={() => navigate("/history", { state: { fromFiat: true } })} />
        </div>
      </motion.div>
      
      <motion.div variants={item} initial="hidden" animate="show" className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">HIGHEST CAP</span>
            <ChevronDown size={14} className="text-white/80" />
          </div>
          <div className="flex-1 scrollable-area">
            {loadingBalances ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-muted animate-pulse rounded-full"></div>
                      <div>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded mb-1"></div>
                        <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-16 bg-muted animate-pulse rounded mb-1"></div>
                      <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCryptos.length > 0 ? (
              <div className="space-y-0">
                {filteredCryptos.map((crypto) => (
                  <AssetRowNew
                    key={crypto.id}
                    crypto={crypto}
                    onClick={() => navigate("/asset-chart", { state: { crypto } })}
                    isBalanceVisible={isBalanceVisible}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-sm text-muted-foreground">
                {assetSearchTerm ? "No assets found matching your search." : "No assets yet."}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <TransferTypeModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSelectType={handleTransferTypeSelect}
      />

      <DepositTypeModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSelectType={handleDepositTypeSelect}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
      />
      <FiatDepositModal
        isOpen={isFiatDepositModalOpen}
        onClose={() => setIsFiatDepositModalOpen(false)}
        currency={selectedFiatCurrency}
      />
    </div>
  );
};

export default Dashboard;