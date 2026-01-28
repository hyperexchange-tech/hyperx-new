import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import ProgressStepper from '@/components/ui/progress-stepper';

const EmailVerification = ({ email, onVerified, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const { verifyEmail, resendVerification } = useAuth();

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex].focus();
    } else {
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    setIsVerifying(true);
    const success = await verifyEmail(email, otpString);
    setIsVerifying(false);

    if (success) {
      if (onVerified) {
        onVerified();
      }
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    const success = await resendVerification(email);
    setIsResending(false);

    if (success) {
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    }
  };

  const steps = [
    { label: 'Credentials' },
    { label: 'Verify Email' },
    { label: 'Biodata' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      <div className="text-center pt-6 pb-2">
        <div className="flex justify-center items-center mb-3">
          <img
            src="/my-new-logo.png"
            alt="HyperX Logo"
            className="w-20 h-20 object-contain drop-shadow-lg"
          />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1">HyperX</h1>
        <p className="text-sm text-muted-foreground">by HyperX Inc.</p>
      </div>

      <ProgressStepper steps={steps} currentStep={2} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Verify Your Email</h2>
            <p className="text-sm text-muted-foreground">
              We've sent a 6-digit code to
            </p>
            <p className="text-sm font-medium text-foreground mt-1">{email}</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-semibold border-2 border-border rounded-lg bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base rounded-xl shadow-lg"
              disabled={isVerifying || otp.join('').length !== 6}
            >
              {isVerifying ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-4 w-4 border-2 border-transparent border-t-white rounded-full mr-2"
                  />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Didn't receive the code?
            </p>
            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={isResending || !canResend}
              className="text-primary font-medium"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : canResend ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              ) : (
                `Resend in ${timer}s`
              )}
            </Button>
          </div>

          {onBack && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={onBack}
                className="text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Signup
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <div className="text-center pb-6 pt-4">
        <p className="text-xs text-muted-foreground">
          Check your spam folder if you don't see the email
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;