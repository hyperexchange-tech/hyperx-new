import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/context/WalletContext";

const InternalFiatTransfer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { fiatBalances } = useWallet();

  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [activeTab, setActiveTab] = useState("userid");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    const currency = fiatBalances.find((c) => c.code === selectedCurrency);
    if (currency) {
      setAmount(currency.balance.toString());
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
    
    // Simulate internal transfer
    setTimeout(() => {
      toast({
        title: "Transfer Successful",
        description: `Sent ${selectedCurrencyData.symbol}${amount} to ${recipient}`,
      });
      
      setIsSubmitting(false);
      setAmount("");
      setRecipientId("");
      setRecipientEmail("");
      
      setTimeout(() => {
        navigate("/", { state: { showFiat: true, transactionCompleted: true } });
      }, 1500);
    }, 1000);
  };

  const selectedCurrencyData = fiatBalances.find((c) => c.code === selectedCurrency);
  const maxAmount = selectedCurrencyData ? selectedCurrencyData.balance : 0;

  return (
    <div className="min-h-screen bg-background bg-mesh flex flex-col">
      {/* Content */}
      <div className="flex-1 px-4 pt-6 pb-6 space-y-6">
        {/* Page Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Internal Fiat Transfer</h1>
          <p className="text-sm text-muted-foreground">Send fiat to HyperX users</p>
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

        {/* Amount Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
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

        {/* Recipient Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">Send To</h2>
          <div className="bg-card/80 rounded-xl p-4 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-background/50">
                <TabsTrigger value="userid" className="text-sm">User ID</TabsTrigger>
                <TabsTrigger value="email" className="text-sm">Email</TabsTrigger>
              </TabsList>
              
              <TabsContent value="userid" className="mt-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    placeholder="Enter User ID (e.g., @john_doe)"
                    className="h-12 pl-12 bg-background/50 border-border/50 rounded-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Enter the recipient's HyperX User ID
                </p>
              </TabsContent>
              
              <TabsContent value="email" className="mt-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="h-12 pl-12 bg-background/50 border-border/50 rounded-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Enter the recipient's registered email address
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card/80 rounded-xl p-4 space-y-3"
        >
          <h3 className="text-sm font-medium">Transaction Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Transfer Fee</span>
              <span className="text-sm font-medium text-green-500">FREE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Processing Time</span>
              <span className="text-sm text-primary font-medium">Instant</span>
            </div>
            <div className="h-px bg-border/50 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">You will send</span>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {selectedCurrencyData?.symbol}{amount || "0"}
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
                navigate("/", { state: { showFiat: true, transactionCompleted: true } });
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
            disabled={!selectedCurrency || !amount || (!recipientId && !recipientEmail) || isSubmitting}
          >
            {isSubmitting ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="h-5 w-5 border-2 border-transparent border-t-white rounded-full"
              />
            ) : (
              <Users className="h-5 w-5" />
            )}
            {isSubmitting ? "Processing..." : "Send to HyperX"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InternalFiatTransfer;