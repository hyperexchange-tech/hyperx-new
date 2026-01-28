import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TransferTypeModal = ({ isOpen, onClose, onSelectType }) => {
  const handleTypeSelect = (type) => {
    onSelectType(type);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <Card className="crypto-card border-none shadow-2xl">
              <CardHeader className="relative text-center pb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle className="text-xl font-bold">Choose Transfer Type</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Select how you want to send your cryptocurrency
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4 pb-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto p-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200"
                    onClick={() => handleTypeSelect("internal")}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-base">Internal Transfer</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Send to another HyperX user instantly
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-primary">
                      <span>Free • Instant</span>
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </div>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto p-6 flex flex-col items-center gap-3 hover:bg-accent/5 hover:border-accent/50 transition-all duration-200"
                    onClick={() => handleTypeSelect("external")}
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-accent" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-base">External Transfer</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Send to any wallet address on the blockchain
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-accent">
                      <span>Network fees apply</span>
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </div>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransferTypeModal;