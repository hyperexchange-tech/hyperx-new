import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProgressStepper = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-6 px-4">
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center relative z-10">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted || isCurrent
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--background))',
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                  isCompleted && "border-primary bg-primary",
                  isCurrent && "border-primary bg-primary shadow-lg shadow-primary/30",
                  isUpcoming && "border-border bg-background"
                )}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isCurrent && "text-primary-foreground",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {stepNumber}
                  </span>
                )}
              </motion.div>

              <motion.p
                initial={false}
                animate={{
                  color: isCurrent || isCompleted
                    ? 'hsl(var(--foreground))'
                    : 'hsl(var(--muted-foreground))',
                  fontWeight: isCurrent ? 600 : 500,
                }}
                className="text-xs mt-2 text-center max-w-[70px]"
              >
                {step.label}
              </motion.p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;
