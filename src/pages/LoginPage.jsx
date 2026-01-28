import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-full bg-black flex flex-col items-center justify-center p-6 py-8">
      {/* Illustration Section */}
      <motion.div
        className="flex items-center justify-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative w-64 h-64">
          <img
            src="/undraw_welcoming_42an_1.svg"
            alt="Welcome"
            className="w-full h-full object-contain"
          />
        </div>
      </motion.div>

      {/* Welcome Text */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
      </motion.div>

      {/* Login Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {/* Email Field */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9D9D9]">
            <Mail className="h-5 w-5" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full h-14 bg-black border border-gray-700 rounded-full pl-12 pr-4 text-white placeholder:text-[#D9D9D9] focus:outline-none focus:border-[hsl(180,60%,50%)] transition-colors"
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9D9D9]">
            <Lock className="h-5 w-5" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full h-14 bg-black border border-gray-700 rounded-full pl-12 pr-12 text-white placeholder:text-[#D9D9D9] focus:outline-none focus:border-[hsl(180,60%,50%)] transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D9D9D9] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-[hsl(180,60%,50%)] hover:brightness-110 text-sm font-medium transition-all"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign In Button */}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-[hsl(180,60%,50%)] hover:bg-[hsl(180,60%,45%)] text-white font-semibold text-lg rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-6 w-6 border-3 border-transparent border-t-white rounded-full mx-auto"
            />
          ) : (
            'Sign in'
          )}
        </motion.button>
      </motion.form>

      {/* Sign Up Link */}
      <motion.div
        className="text-center mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <p className="text-white text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[hsl(180,60%,50%)] hover:brightness-110 font-semibold transition-all">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
