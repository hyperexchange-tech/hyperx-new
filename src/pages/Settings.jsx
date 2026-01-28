import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Moon, Sun, Settings as SettingsIconLucide, Save, Banknote, PlusCircle, Edit3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [hasSavedDetails, setHasSavedDetails] = useState(false);

  useEffect(() => {
    const savedBankDetails = localStorage.getItem("fiatWithdrawalAccount");
    if (savedBankDetails) {
      const parsedDetails = JSON.parse(savedBankDetails);
      setBankDetails(parsedDetails);
      setHasSavedDetails(true);
    }
  }, []);

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBankDetails = (e) => {
    e.preventDefault();
    if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all bank account fields.",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("fiatWithdrawalAccount", JSON.stringify(bankDetails));
    toast({
      title: "Bank Details Saved",
      description: "Your fiat withdrawal account information has been saved locally.",
    });
    setIsFormVisible(false);
    setHasSavedDetails(true);
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
     if (hasSavedDetails && !isFormVisible) {
      const savedBankDetails = localStorage.getItem("fiatWithdrawalAccount");
      if (savedBankDetails) {
        setBankDetails(JSON.parse(savedBankDetails));
      }
    }
  };
  
  const maskAccountNumber = (number) => {
    if (!number || number.length < 4) return "****";
    return `**** **** **** ${number.slice(-4)}`;
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="gap-2 mb-2" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIconLucide className="h-7 w-7 text-primary" />
          App Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your application preferences and account details.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="crypto-card border-none">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <span className="text-sm">
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                aria-label="Toggle theme"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-primary" />
                  Fiat Withdrawal Account
                </CardTitle>
                <CardDescription>
                  {hasSavedDetails && !isFormVisible ? "Review your saved bank details or update them." :
                   hasSavedDetails && isFormVisible ? "Update your bank account details." :
                   "Save your bank details for fiat currency withdrawals."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isFormVisible && hasSavedDetails && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 border rounded-md bg-muted/30 space-y-2"
              >
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Bank Name</p>
                  <p className="text-sm font-semibold">{bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Account Holder Name</p>
                  <p className="text-sm font-semibold">{bankDetails.accountName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Account Number</p>
                  <p className="text-sm font-semibold">{maskAccountNumber(bankDetails.accountNumber)}</p>
                </div>
              </motion.div>
            )}

            {!isFormVisible && (
              <Button 
                onClick={toggleFormVisibility} 
                className={`w-full crypto-gradient ${hasSavedDetails ? "" : "text-black dark:text-black"}`}
                variant={hasSavedDetails ? "outline" : "default"}
              >
                {hasSavedDetails ? <Edit3 className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {hasSavedDetails ? "Change Account Details" : "Add Account Details"}
              </Button>
            )}
            <AnimatePresence>
              {isFormVisible && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSaveBankDetails} 
                  className="space-y-4 mt-4 overflow-hidden"
                >
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      placeholder="e.g., First National Bank"
                      value={bankDetails.bankName}
                      onChange={handleBankDetailsChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      placeholder="e.g., 1234567890"
                      value={bankDetails.accountNumber}
                      onChange={handleBankDetailsChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountName">Account Holder Name</Label>
                    <Input
                      id="accountName"
                      name="accountName"
                      placeholder="e.g., John Doe"
                      value={bankDetails.accountName}
                      onChange={handleBankDetailsChange}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={toggleFormVisibility} className="w-1/2">
                      Cancel
                    </Button>
                    <Button type="submit" className="w-1/2 crypto-gradient text-black dark:text-black">
                      <Save className="mr-2 h-4 w-4" /> 
                      {hasSavedDetails ? "Update Details" : "Submit Details"}
                    </Button>
                  </div>
                  
                </motion.form>
              )}
            </AnimatePresence>
            <p className="text-xs text-muted-foreground text-center pt-4">
              Note: Account details are currently saved in local browser storage. For enhanced security and persistence, integrating a backend service like Supabase is recommended for production environments.
            </p>
          </CardContent>
        </Card>
        
        <Card className="crypto-card border-none">
          <CardHeader>
            <CardTitle>App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Version</h3>
              <p className="text-sm text-muted-foreground">1.0.2</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium">Data Storage</h3>
              <p className="text-sm text-muted-foreground">
                Using local storage (demo only)
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium">About</h3>
              <p className="text-sm text-muted-foreground">
                HyperX is a demo crypto wallet application. In a real application, you would connect to blockchain networks.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card border-none">
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
            <Button variant="outline" className="w-full">
              Enable 2FA
            </Button>
            <Button variant="outline" className="w-full">
              Backup Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Settings;