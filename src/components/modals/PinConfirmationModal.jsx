import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, AlertCircle, Delete, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/lib/api";

const PinConfirmationModal = ({ isOpen, onClose, onConfirm, transactionType = "transaction" }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setModalOpen } = useModal();
  const { user } = useAuth();

  useEffect(() => {
    setModalOpen(isOpen);
    if (isOpen) {
      setPin("");
      setError("");
      setIsSubmitting(false);

      const token = localStorage.getItem('accessToken');
      console.log('PIN Modal opened - Token status:', token ? 'Present' : 'Missing');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiresAt = new Date(payload.exp * 1000);
          console.log('Token expires at:', expiresAt.toLocaleString());
          if (Date.now() >= payload.exp * 1000) {
            console.warn('⚠ Token has expired!');
          }
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
    }
  }, [isOpen, setModalOpen]);

  const handleNumberPress = (number) => {
    if (pin.length < 4) {
      const newPin = pin + number;
      setPin(newPin);
      if (error) setError("");
      
      // Auto-submit when 4 digits are entered
      if (newPin.length === 4) {
        setTimeout(() => handleSubmit(newPin), 200);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    if (error) setError("");
  };

  const handleSubmit = async (pinToSubmit = pin) => {
    if (pinToSubmit.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    if (!user?.id) {
      setError("User information not found");
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authAPI.verifyPin(user.id, pinToSubmit);

      if (response && response.success) {
        onConfirm(pinToSubmit);
        onClose();
      } else {
        setError(response?.message || "Incorrect PIN. Please try again.");
        setPin("");
      }
    } catch (error) {
      console.error('PIN verification error:', error);

      const errorMessage = error.message || "Network error. Please try again.";
      if (errorMessage.includes("wallet provisioning") || errorMessage.includes("502")) {
        setError("Server temporarily unavailable. Please try again.");
      } else if (errorMessage.includes("Session expired") || errorMessage.includes("401")) {
        setError("Session expired. Please log in again.");
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(errorMessage);
      }
      setPin("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPinDots = () => {
    return (
      <div className="flex justify-center gap-4 mb-8">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold ${
              index < pin.length
                ? "bg-primary/20 border-primary text-primary"
                : "bg-muted/30 border-border/50 text-muted-foreground"
            }`}
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: index < pin.length ? 1.1 : 1,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
          >
            {index < pin.length && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 bg-primary rounded-full"
              />
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderKeypad = () => {
    const numbers = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      ["fingerprint", 0, "backspace"]
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">✓</span>
          </div>
          <span>HyperX Secure Numeric Keypad</span>
        </div>
        
        {numbers.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-4">
            {row.map((item, colIndex) => {
              if (item === "backspace") {
                return (
                  <motion.button
                    key={colIndex}
                    className="w-20 h-14 bg-muted/30 hover:bg-muted/50 rounded-2xl flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackspace}
                    disabled={pin.length === 0 || isSubmitting}
                  >
                    <Delete className="h-6 w-6 text-muted-foreground" />
                  </motion.button>
                );
              }
              
              if (item === "fingerprint") {
                return (
                  <motion.button
                    key={colIndex}
                    className="w-20 h-14 bg-primary/10 hover:bg-primary/20 rounded-2xl flex items-center justify-center transition-colors duration-200 border border-primary/30 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Placeholder for biometric authentication
                      // In a real app, this would trigger fingerprint/face ID authentication
                      console.log("Biometric authentication requested");
                    }}
                    disabled={isSubmitting}
                  >
                    <Fingerprint className="h-6 w-6 text-primary" />
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={colIndex}
                  className="w-20 h-14 bg-card hover:bg-muted/30 rounded-2xl flex items-center justify-center text-xl font-semibold transition-colors duration-200 border border-border/30 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumberPress(item.toString())}
                  disabled={pin.length >= 4 || isSubmitting}
                >
                  {item}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    );
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-sm bg-card rounded-t-2xl border border-border/50 shadow-2xl max-h-[85vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="relative text-center pb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex justify-center items-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">Enter Payment PIN</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6 pb-6">
                {/* PIN Dots Display */}
                {renderPinDots()}
                
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}

                {/* Loading State */}
                {isSubmitting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-sm text-primary"
                  >
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                      className="h-4 w-4 border-2 border-transparent border-t-primary rounded-full"
                    />
                    Verifying PIN...
                  </motion.div>
                )}

                {/* Forgot PIN Link */}
                {!isSubmitting && (
                  <div className="text-center">
                    <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Forgot Payment PIN?
                    </button>
                  </div>
                )}

                {/* Numeric Keypad */}
                {renderKeypad()}

              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PinConfirmationModal;