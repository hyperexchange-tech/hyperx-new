import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Bitcoin } from "lucide-react";
import { Button } from "@/components/ui/button";

const DepositTypeModal = ({ isOpen, onClose, onSelectType }) => {
  const handleTypeSelect = (type) => {
    onSelectType(type);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-xs bg-card/90 backdrop-blur-lg rounded-t-2xl border border-border/50 shadow-2xl"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <h3 className="text-lg font-semibold">Deposit Options</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-14 flex items-center justify-start gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200"
                  onClick={() => handleTypeSelect("fiat")}
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Deposit with Fiat</p>
                    <p className="text-xs text-muted-foreground">Bank transfer, card payment</p>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-14 flex items-center justify-start gap-3 hover:bg-accent/5 hover:border-accent/50 transition-all duration-200"
                  onClick={() => handleTypeSelect("crypto")}
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Bitcoin className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Deposit with Crypto</p>
                    <p className="text-xs text-muted-foreground">Transfer from another wallet</p>
                  </div>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DepositTypeModal;