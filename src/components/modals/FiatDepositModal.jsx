import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FiatDepositModal = ({ isOpen, onClose, currency }) => {
  const [copied, setCopied] = React.useState(null);

  const accountDetails = {
    NGN: {
      bankName: "Wema Bank",
      accountName: "HyperX - John Doe",
      accountNumber: "0123456789",
    },
    ZAR: {
      bankName: "Standard Bank",
      accountName: "HyperX - John Doe",
      accountNumber: "9876543210",
    },
    GHS: {
      bankName: "GCB Bank",
      accountName: "HyperX - John Doe",
      accountNumber: "5432109876",
    },
    KES: {
      bankName: "Equity Bank",
      accountName: "HyperX - John Doe",
      accountNumber: "1234509876",
    },
  };

  const details = accountDetails[currency] || accountDetails.NGN;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Deposit {currency}</h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Transfer funds to the account below. Your balance will be updated automatically once the deposit is confirmed.
                </p>

                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Bank Name</p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{details.bankName}</p>
                        <button
                          onClick={() => handleCopy(details.bankName, "bank")}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          {copied === "bank" ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Account Name</p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{details.accountName}</p>
                        <button
                          onClick={() => handleCopy(details.accountName, "name")}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          {copied === "name" ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold">{details.accountNumber}</p>
                        <button
                          onClick={() => handleCopy(details.accountNumber, "number")}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          {copied === "number" ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Please use the exact account details above. Deposits typically reflect within 5-10 minutes.
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Button
                  onClick={onClose}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FiatDepositModal;
