import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const QrScannerModal = ({ isOpen, onClose, onScan }) => {
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const { toast } = useToast();

  const handleResult = (result, error) => {
    if (result) {
      const scannedText = result?.text || result;
      console.log('QR Code scanned:', scannedText);
      
      // Validate if the scanned text looks like a wallet address
      if (scannedText && scannedText.length > 10) {
        setIsScanning(false);
        onScan(scannedText);
        toast({
          title: "QR Code Scanned",
          description: "Wallet address has been filled automatically",
        });
        onClose();
      } else {
        setError("Invalid QR code. Please scan a valid wallet address.");
        setTimeout(() => setError(""), 3000);
      }
    }

    if (error) {
      console.error('QR Scanner error:', error);
      setError("Camera access failed. Please check permissions.");
    }
  };

  const handleClose = () => {
    setIsScanning(false);
    setError("");
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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <Card className="crypto-card border-none shadow-2xl overflow-hidden">
              <CardHeader className="relative text-center pb-4 bg-card/95">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex justify-center items-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">Scan QR Code</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Point your camera at a wallet address QR code
                </p>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* QR Scanner Placeholder */}
                <div className="relative aspect-square bg-black flex items-center justify-center">
                  <div className="text-center p-8">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-white text-sm">QR Scanner requires camera access</p>
                    <p className="text-muted-foreground text-xs mt-2">Feature temporarily unavailable</p>
                  </div>

                  {/* Scanning overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Corner brackets */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary opacity-30"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary opacity-30"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary opacity-30"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary opacity-30"></div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-destructive/10 border-t border-destructive/20"
                  >
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  </motion.div>
                )}

                {/* Instructions */}
                <div className="p-4 bg-muted/30 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    <span>Position the QR code within the frame</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-card/95">
                  <Button
                    variant="outline"
                    className="w-full h-12 bg-card/80 border-border/50 hover:bg-muted/30 text-foreground"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QrScannerModal;