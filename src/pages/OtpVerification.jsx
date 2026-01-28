import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/signup');
      return;
    }
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter all 6 digits',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('https://api.hyperx.llc/v1/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otpString }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
        }

        toast({
          title: 'Email Verified',
          description: 'Your email has been verified successfully',
        });
        setIsVerifying(false);
        navigate('/setup-pin');
      } else {
        toast({
          title: 'Verification Failed',
          description: data.message || 'Invalid verification code.',
          variant: 'destructive',
        });
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      toast({
        title: 'Verification Failed',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      const response = await fetch('https://api.hyperx.llc/v1/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Code Resent',
          description: 'A new verification code has been sent to your email',
        });
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
      } else {
        toast({
          title: 'Failed to Send',
          description: data.message || 'Could not send verification email.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        title: 'Failed to Send',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    }

    setIsResending(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-12 flex justify-center">
            <img
              src="/undraw_welcoming_42an_1.svg"
              alt="Email Verification"
              className="w-64 h-64 object-contain"
            />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">Verify Your Email</h1>
            <p className="text-gray-400 text-lg">
              Enter the 6 digit code sent to your email
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex gap-2 sm:gap-3 justify-center">
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
                  className="w-12 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-semibold border border-gray-700 bg-black rounded-xl text-white focus:border-[#479dba] focus:outline-none transition-all duration-200"
                  style={{ caretColor: '#479dba' }}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-[#479dba] hover:brightness-110 text-white font-semibold text-lg rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isVerifying || otp.join('').length !== 6}
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="h-5 w-5 border-2 border-transparent border-t-white rounded-full"
                  />
                  Verifying...
                </span>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </form>
        </motion.div>
      </div>

      <div className="pb-8 text-center px-6">
        <p className="text-white text-base">
          Didn't receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-[#479dba] font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Resending...' : 'Resend.'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;
