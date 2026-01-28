import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await requestPasswordReset(email);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="w-full max-w-sm"
      >
        <Card className="bg-card/80 backdrop-blur-lg border-primary/30 shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="text-center p-8 bg-primary/10">
            <div className="flex justify-center items-center mb-4">
              <KeyRound className="h-20 w-20 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email to receive reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-background/70 border-border/50 focus:border-primary h-12 text-base"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full crypto-gradient text-lg py-3 h-12 font-semibold tracking-wider hover:opacity-90 transition-opacity duration-300" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-5 w-5 border-2 border-transparent border-t-white rounded-full mr-2" />
                ) : (
                  <Mail className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center p-8 bg-primary/5">
            <Link to="/login" className="flex items-center text-sm text-primary hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default PasswordReset;