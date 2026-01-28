import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRightLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/context/WalletContext";

const FiatConvert = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { fiatBalances } = useWallet();

  const [fromCurrency, setFromCurrency] = useState("NGN");
  const [toCurrency, setToCurrency] = useState("ZAR");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    const currency = fiatBalances.find((c) => c.code === fromCurrency);
    if (currency) {
      setAmount(currency.balance.toString());
    }
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
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

    if (fromCurrency === toCurrency) {
      toast({
        title: "Invalid Conversion",
        description: "Cannot convert the same currency.",
        variant: "destructive",
      });
      return;
    }

    const fromCurrencyData = fiatBalances.find((c) => c.code === fromCurrency);
    if (parseFloat(amount) > fromCurrencyData.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromCurrencyData.code}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate currency conversion
    setTimeout(() => {
      const toCurrencyData = fiatBalances.find((c) => c.code === toCurrency);
      const convertedAmount = (parseFloat(amount) / fromCurrencyData.rate) * toCurrencyData.rate;
      
      toast({
        title: "Conversion Successful",
        description: `Converted ${fromCurrencyData.symbol}${amount} to ${toCurrencyData.symbol}${convertedAmount.toFixed(2)}`,
      });
      
      setIsSubmitting(false);
      setAmount("");
      
      setTimeout(() => {
        navigate("/", { state: { showFiat: true, transactionCompleted: true } });
      }, 1500);
    }, 2000);
  };

  const fromCurrencyData = fiatBalances.find((c) => c.code === fromCurrency);
  const toCurrencyData = fiatBalances.find((c) => c.code === toCurrency);
  const maxAmount = fromCurrencyData ? fromCurrencyData.balance : 0;

  const getConvertedAmount = () => {
    if (!amount || !fromCurrencyData || !toCurrencyData) return 0;
    const fee = 0.01; // 1% fee
    const amountAfterFee = parseFloat(amount) * (1 - fee);
    return (amountAfterFee / fromCurrencyData.rate) * toCurrencyData.rate;
  };

  const convertedAmount = getConvertedAmount();

  return (
    <div className="min-h-screen bg-background bg-mesh flex flex-col">
      {/* Content */}
      <div className="flex-1 px-4 pt-6 pb-6 space-y-6">
        {/* Page Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Convert Fiat</h1>
          <p className="text-sm text-muted-foreground">Exchange between currencies</p>
        </div>

        {/* From Currency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">From</h2>
            {fromCurrencyData && (
              <p className="text-xs text-muted-foreground">
                Balance: {fromCurrencyData.symbol}{maxAmount.toLocaleString()}
              </p>
            )}
          </div>
          
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger className="h-14 bg-card/80 border-border/50 rounded-xl">
              <SelectValue placeholder="Choose currency" />
            </SelectTrigger>
            <SelectContent>
              {fiatBalances.map((currency) => (
                <SelectItem 
                  key={currency.code} 
                  value={currency.code}
                  disabled={currency.code === toCurrency}
                >
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

          <div className="bg-card/80 rounded-xl p-4 space-y-4">
            <div className="text-center">
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="text-center text-2xl font-bold border-none bg-transparent focus:ring-0 h-auto p-0 text-foreground"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-full"
                onClick={() => setAmount((maxAmount * 0.25).toString())}
              >
                25%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-full"
                onClick={() => setAmount((maxAmount * 0.5).toString())}
              >
                50%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-full"
                onClick={() => setAmount((maxAmount * 0.75).toString())}
              >
                75%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-full"
                onClick={handleMaxAmount}
              >
                MAX
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12 border-2 hover:bg-primary/10 hover:border-primary/50"
            onClick={handleSwapCurrencies}
          >
            <RotateCcw className="h-5 w-5 text-primary" />
          </Button>
        </div>

        {/* To Currency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">To</h2>
          
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger className="h-14 bg-card/80 border-border/50 rounded-xl">
              <SelectValue placeholder="Choose currency" />
            </SelectTrigger>
            <SelectContent>
              {fiatBalances.map((currency) => (
                <SelectItem 
                  key={currency.code} 
                  value={currency.code}
                  disabled={currency.code === fromCurrency}
                >
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

          <div className="bg-card/80 rounded-xl p-4">
            <div className="text-center">
              <Input
                type="text"
                value={convertedAmount ? convertedAmount.toFixed(2) : ""}
                readOnly
                placeholder="0.00"
                className="text-center text-2xl font-bold border-none bg-transparent focus:ring-0 h-auto p-0 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground mt-1">
                You'll receive approximately
              </p>
            </div>
          </div>
        </motion.div>

        {/* Conversion Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card/80 rounded-xl p-4 space-y-3"
        >
          <h3 className="text-sm font-medium">Conversion Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Exchange Rate</span>
              <span className="text-sm font-medium">
                1 {fromCurrencyData?.code} = {fromCurrencyData && toCurrencyData ? 
                  (toCurrencyData.rate / fromCurrencyData.rate).toFixed(4) : "0"} {toCurrencyData?.code}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Conversion Fee</span>
              <span className="text-sm font-medium text-orange-500">
                1% ({fromCurrencyData?.symbol}{amount ? (parseFloat(amount) * 0.01).toFixed(2) : "0.00"})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Processing Time</span>
              <span className="text-sm text-primary font-medium">Instant</span>
            </div>
            <div className="h-px bg-border/50 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">You'll receive</span>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {toCurrencyData?.symbol}{convertedAmount.toFixed(2)}
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
            onClick={() => navigate("/", { state: { showFiat: true } })}
            className="h-14 px-6 rounded-xl font-semibold text-base"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-semibold text-base rounded-xl flex items-center justify-center gap-2 shadow-lg"
            disabled={!fromCurrency || !toCurrency || !amount || fromCurrency === toCurrency || isSubmitting}
          >
            {isSubmitting ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="h-5 w-5 border-2 border-transparent border-t-white rounded-full"
              />
            ) : (
              <ArrowRightLeft className="h-5 w-5" />
            )}
            {isSubmitting ? "Processing..." : "Convert"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiatConvert;