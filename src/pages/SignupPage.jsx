import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { toast } = useToast();

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const success = await signup(email, password);
    setLoading(false);

    if (success) {
      navigate('/verify-otp', { state: { email } });
    }
  };

  return (
    <div className="min-h-full bg-black flex flex-col">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-white hover:text-gray-300 transition-colors z-10"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <img
              src="/undraw_details_sgb2 1.svg"
              alt="Create Account"
              className="w-56 h-auto"
            />
          </div>

          <h1 className="text-white text-3xl font-bold text-center mb-8">
            Create Your Wallet
          </h1>

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D9D9D9] z-10" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="h-14 pl-14 pr-5 bg-black border border-gray-700 rounded-full text-white placeholder:text-[#D9D9D9] focus:border-[hsl(180,60%,50%)] focus:ring-0"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D9D9D9] z-10" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="h-14 pl-14 pr-14 bg-black border border-gray-700 rounded-full text-white placeholder:text-[#D9D9D9] focus:border-[hsl(180,60%,50%)] focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#D9D9D9] hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D9D9D9] z-10" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                className="h-14 pl-14 pr-14 bg-black border border-gray-700 rounded-full text-white placeholder:text-[#D9D9D9] focus:border-[hsl(180,60%,50%)] focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#D9D9D9] hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full h-14 bg-[hsl(180,60%,50%)] hover:bg-[hsl(180,60%,45%)] text-white font-semibold text-lg rounded-full shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="h-5 w-5 border-2 border-transparent border-t-white rounded-full mr-2"
                    />
                    Creating Account...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[hsl(180,60%,50%)] hover:brightness-110 font-semibold transition-all">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;