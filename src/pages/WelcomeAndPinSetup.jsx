import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Shield, Check, AlertCircle } from 'lucide-react';

const WelcomeAndPinSetup = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState('welcome'); // 'welcome', 'create-pin', 'confirm-pin'
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNumberPress = (number, isConfirm = false) => {
    if (isConfirm) {
      if (confirmPin.length < 4) {
        const newPin = confirmPin + number;
        setConfirmPin(newPin);
        
        // Auto-submit when 4 digits are entered for confirmation
        if (newPin.length === 4) {
          setTimeout(() => handleCreatePin(pin, newPin), 200);
        }
      }
    } else {
      if (pin.length < 4) {
        const newPin = pin + number;
        setPin(newPin);
        
        // Move to confirm step when 4 digits are entered
        if (newPin.length === 4) {
          setTimeout(() => setStep('confirm-pin'), 200);
        }
      }
    }
  };

  const handleBackspace = (isConfirm = false) => {
    if (isConfirm) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleCreatePin = async (pinValue, confirmPinValue) => {
    if (pinValue !== confirmPinValue) {
      toast({
        title: "PIN Mismatch",
        description: "The PINs you entered do not match. Please try again.",
        variant: "destructive",
      });
      setPin('');
      setConfirmPin('');
      setStep('create-pin');
      return;
    }

    if (!user?.id) {
      toast({
        title: "User Error",
        description: "User information not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await authAPI.createPin(user.id, pinValue);
      
      if (response && response.success) {
        toast({
          title: "PIN Created Successfully",
          description: "Your payment PIN has been set up. Welcome to HyperX!",
        });
        
        // Navigate to dashboard after successful PIN creation
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        toast({
          title: "PIN Creation Failed",
          description: response?.message || "Failed to create PIN. Please try again.",
          variant: "destructive",
        });
        setPin('');
        setConfirmPin('');
        setStep('create-pin');
      }
    } catch (error) {
      console.error('PIN creation error:', error);
      toast({
        title: "PIN Creation Failed",
        description: error.message || "Network error. Please try again.",
        variant: "destructive",
      });
      setPin('');
      setConfirmPin('');
      setStep('create-pin');
    } finally {
      setIsCreating(false);
    }
  };

  const renderPinDots = (currentPin) => {
    return (
      <div className="flex justify-center gap-4 mb-8">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold ${
              index < currentPin.length
                ? "bg-primary/20 border-primary text-primary"
                : "bg-muted/30 border-border/50 text-muted-foreground"
            }`}
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: index < currentPin.length ? 1.1 : 1,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
          >
            {index < currentPin.length && (
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

  const renderKeypad = (isConfirm = false) => {
    const numbers = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      ["", 0, "backspace"]
    ];

    return (
      <div className="space-y-4">
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
                    onClick={() => handleBackspace(isConfirm)}
                    disabled={isConfirm ? confirmPin.length === 0 : pin.length === 0 || isCreating}
                  >
                    <span className="text-lg">⌫</span>
                  </motion.button>
                );
              }
              
              if (item === "") {
                return <div key={colIndex} className="w-20 h-14"></div>;
              }

              return (
                <motion.button
                  key={colIndex}
                  className="w-20 h-14 bg-card hover:bg-muted/30 rounded-2xl flex items-center justify-center text-xl font-semibold transition-colors duration-200 border border-border/30 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumberPress(item.toString(), isConfirm)}
                  disabled={isConfirm ? confirmPin.length >= 4 : pin.length >= 4 || isCreating}
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

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-background bg-mesh flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="w-full max-w-md"
        >
          <Card className="crypto-card border-none shadow-2xl">
            <CardHeader className="text-center p-8">
              <div className="flex justify-center items-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-foreground mb-2">
                Welcome to HyperX!
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Your account has been verified successfully.
              </p>
            </CardHeader>
            
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-foreground">Email verified</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment PIN setup required</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  To secure your transactions, please create a 4-digit payment PIN.
                </p>
              </div>

              <Button 
                onClick={() => setStep('create-pin')}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base rounded-xl"
              >
                <Lock className="h-5 w-5 mr-2" />
                Create Payment PIN
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <Card className="crypto-card border-none shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold">
              {step === 'create-pin' ? 'Create Payment PIN' : 'Confirm Payment PIN'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {step === 'create-pin' 
                ? 'Enter a 4-digit PIN to secure your transactions'
                : 'Re-enter your PIN to confirm'
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-6">
            {/* PIN Dots Display */}
            {renderPinDots(step === 'create-pin' ? pin : confirmPin)}
            
            {/* Loading State */}
            {isCreating && (
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
                Creating PIN...
              </motion.div>
            )}

            {/* Back Button for Confirm Step */}
            {step === 'confirm-pin' && !isCreating && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep('create-pin');
                    setConfirmPin('');
                  }}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  ← Back to PIN entry
                </Button>
              </div>
            )}

            {/* Numeric Keypad */}
            {!isCreating && renderKeypad(step === 'confirm-pin')}

            {/* Security Notice */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Your PIN is encrypted and secure</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WelcomeAndPinSetup;