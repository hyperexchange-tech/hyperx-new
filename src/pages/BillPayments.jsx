import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Receipt, Zap, Tv, Phone, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/context/WalletContext";

const BillPayments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { fiatBalances } = useWallet();

  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("electricity");
  const [meterNumber, setMeterNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample service providers
  const electricityProviders = [
    { code: "EKEDC", name: "Eko Electricity Distribution Company" },
    { code: "IKEDC", name: "Ikeja Electric" },
    { code: "AEDC", name: "Abuja Electricity Distribution Company" },
  ];

  const tvProviders = [
    { code: "DSTV", name: "DStv" },
    { code: "GOTV", name: "GOtv" },
    { code: "STARTIMES", name: "StarTimes" },
  ];

  const networkProviders = [
    { code: "MTN", name: "MTN Nigeria" },
    { code: "GLO", name: "Globacom" },
    { code: "AIRTEL", name: "Airtel Nigeria" },
    { code: "9MOBILE", name: "9mobile" },
  ];

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProvider) {
      toast({
        title: "Missing Provider",
        description: "Please select a service provider.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "electricity" && !meterNumber) {
      toast({
        title: "Missing Meter Number",
        description: "Please enter your meter number.",
        variant: "destructive",
      });
      return;
    }

    if ((activeTab === "airtime" || activeTab === "data") && !phoneNumber) {
      toast({
        title: "Missing Phone Number",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    const selectedCurrencyData = fiatBalances.find((c) => c.code === selectedCurrency);
    if (parseFloat(amount) > selectedCurrencyData.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${selectedCurrencyData.code}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate bill payment
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: `${activeTab} bill payment of ${selectedCurrencyData.symbol}${amount} has been processed.`,
      });
      
      setIsSubmitting(false);
      setAmount("");
      setMeterNumber("");
      setPhoneNumber("");
      setSelectedProvider("");
      
      setTimeout(() => {
        navigate("/", { state: { showFiat: true } });
      }, 1500);
    }, 2000);
  };

  const selectedCurrencyData = fiatBalances.find((c) => c.code === selectedCurrency);
  const maxAmount = selectedCurrencyData ? selectedCurrencyData.balance : 0;

  const getProviders = () => {
    switch (activeTab) {
      case "electricity":
        return electricityProviders;
      case "tv":
        return tvProviders;
      case "airtime":
      case "data":
        return networkProviders;
      default:
        return [];
    }
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "electricity":
        return <Zap className="h-4 w-4" />;
      case "tv":
        return <Tv className="h-4 w-4" />;
      case "airtime":
        return <Phone className="h-4 w-4" />;
      case "data":
        return <Wifi className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh flex flex-col">
      {/* Content */}
      <div className="flex-1 px-4 pt-6 pb-6 space-y-6">
        {/* Page Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Bill Payments</h1>
          <p className="text-sm text-muted-foreground">Pay for utilities and services</p>
        </div>

        {/* Currency Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">Select Currency</h2>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="h-14 bg-card/80 border-border/50 rounded-xl">
              <SelectValue placeholder="Choose currency" />
            </SelectTrigger>
            <SelectContent>
              {fiatBalances.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-3 py-1">
                    <span className="text-2xl">{currency.flag}</span>
                    <div>
                      <p className="font-medium">{currency.code}</p>
                      <p className="text-xs text-muted-foreground">{currency.name}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Service Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">Service Type</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-card/80">
              <TabsTrigger value="electricity" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Electric
              </TabsTrigger>
              <TabsTrigger value="tv" className="text-xs">
                <Tv className="h-3 w-3 mr-1" />
                TV
              </TabsTrigger>
              <TabsTrigger value="airtime" className="text-xs">
                <Phone className="h-3 w-3 mr-1" />
                Airtime
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs">
                <Wifi className="h-3 w-3 mr-1" />
                Data
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Service Provider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">Service Provider</h2>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="h-14 bg-card/80 border-border/50 rounded-xl">
              <SelectValue placeholder="Choose provider" />
            </SelectTrigger>
            <SelectContent>
              {getProviders().map((provider) => (
                <SelectItem key={provider.code} value={provider.code}>
                  <div className="flex items-center gap-3 py-1">
                    {getTabIcon(activeTab)}
                    <span className="font-medium">{provider.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Service Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">Service Details</h2>
          <div className="bg-card/80 rounded-xl p-4 space-y-4">
            {activeTab === "electricity" && (
              <Input
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                placeholder="Enter meter number"
                className="h-12 bg-background/50 border-border/50 rounded-lg"
              />
            )}
            
            {activeTab === "tv" && (
              <Input
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                placeholder="Enter decoder number"
                className="h-12 bg-background/50 border-border/50 rounded-lg"
              />
            )}

            {(activeTab === "airtime" || activeTab === "data") && (
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="h-12 bg-background/50 border-border/50 rounded-lg"
              />
            )}
          </div>
        </motion.div>

        {/* Amount Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Amount</h2>
            {selectedCurrencyData && (
              <p className="text-xs text-muted-foreground">
                Balance: {selectedCurrencyData.symbol}{maxAmount.toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="bg-card/80 rounded-xl p-4">
            <div className="text-center">
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="text-center text-2xl font-bold border-none bg-transparent focus:ring-0 h-auto p-0 text-foreground"
              />
            </div>
          </div>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-card/80 rounded-xl p-4 space-y-3"
        >
          <h3 className="text-sm font-medium">Transaction Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Service Fee</span>
              <span className="text-sm font-medium text-orange-500">
                {selectedCurrencyData?.symbol}25
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Processing Time</span>
              <span className="text-sm text-primary font-medium">Instant</span>
            </div>
            <div className="h-px bg-border/50 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Amount</span>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {selectedCurrencyData?.symbol}{amount ? (parseFloat(amount) + 25).toLocaleString() : "25"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Action */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border/30 p-4 pb-8">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (location.state?.fromFiat) {
                navigate("/", { state: { showFiat: true } });
              } else {
                navigate(-1);
              }
            }}
            className="h-14 px-6 rounded-xl font-semibold text-base"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-semibold text-base rounded-xl flex items-center justify-center gap-2 shadow-lg"
            disabled={!selectedCurrency || !amount || !selectedProvider || isSubmitting}
          >
            {isSubmitting ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="h-5 w-5 border-2 border-transparent border-t-white rounded-full"
              />
            ) : (
              <Receipt className="h-5 w-5" />
            )}
            {isSubmitting ? "Processing..." : "Pay Bill"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillPayments;