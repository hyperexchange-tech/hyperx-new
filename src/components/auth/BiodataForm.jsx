import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';
import ProgressStepper from '@/components/ui/progress-stepper';
import { useToast } from "@/components/ui/use-toast";

const BiodataForm = ({ email, onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    identityType: 'BVN',
    identityNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, and hyphens';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, and hyphens';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.identityNumber.trim()) {
      newErrors.identityNumber = `${formData.identityType} is required`;
    } else if (!/^\d{11}$/.test(formData.identityNumber)) {
      newErrors.identityNumber = `${formData.identityType} must be exactly 11 digits`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIdentityNumberChange = (value) => {
    if (/^\d*$/.test(value) && value.length <= 11) {
      handleChange('identityNumber', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check all fields and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Error submitting biodata:', error);
      toast({
        title: "Submission Failed",
        description: "Unable to save your information. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
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

      <ProgressStepper steps={steps} currentStep={3} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Complete Your Profile</h2>
            <p className="text-sm text-muted-foreground">
              Please provide your personal information for verification
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">First Name</label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                className={`h-11 border-0 border-b-2 ${errors.firstName ? 'border-destructive' : 'border-border'} rounded-none bg-transparent focus:border-primary focus:ring-0 px-0 text-sm`}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive mt-1">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                className={`h-11 border-0 border-b-2 ${errors.lastName ? 'border-destructive' : 'border-border'} rounded-none bg-transparent focus:border-primary focus:ring-0 px-0 text-sm`}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive mt-1">{errors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Identity Verification</label>
              <div className="flex gap-4 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('identityType', 'BVN');
                    handleChange('identityNumber', '');
                  }}
                  className={`flex-1 h-12 rounded-xl border-2 transition-all duration-200 font-medium text-sm ${
                    formData.identityType === 'BVN'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  BVN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('identityType', 'NIN');
                    handleChange('identityNumber', '');
                  }}
                  className={`flex-1 h-12 rounded-xl border-2 transition-all duration-200 font-medium text-sm ${
                    formData.identityType === 'NIN'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  NIN
                </button>
              </div>

              <div className="relative">
                <CreditCard className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formData.identityNumber}
                  onChange={(e) => handleIdentityNumberChange(e.target.value)}
                  placeholder={`Enter your ${formData.identityType} number`}
                  className={`h-11 border-0 border-b-2 ${errors.identityNumber ? 'border-destructive' : 'border-border'} rounded-none bg-transparent focus:border-primary focus:ring-0 pl-6 text-sm`}
                  maxLength={11}
                />
                {errors.identityNumber && (
                  <p className="text-xs text-destructive mt-1">{errors.identityNumber}</p>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Your {formData.identityType} will be used for identity verification and compliance purposes only.
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base rounded-xl shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="h-4 w-4 border-2 border-transparent border-t-white rounded-full mr-2"
                    />
                    Completing Setup...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            </div>
          </form>

          {onBack && (
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-sm text-muted-foreground"
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <div className="text-center pb-6 pt-4">
        <p className="text-xs text-muted-foreground">
          Your data is encrypted and stored securely
        </p>
      </div>
    </div>
  );
};

export default BiodataForm;
