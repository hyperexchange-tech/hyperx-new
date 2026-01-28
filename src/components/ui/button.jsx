import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'native-touch inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] active:shadow-none',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-mobile hover:shadow-mobile-lg',
				destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-mobile hover:shadow-mobile-lg',
				outline:
          'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-mobile hover:shadow-mobile-lg hover:border-accent/50',
				secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-mobile hover:shadow-mobile-lg',
				ghost: 'hover:bg-accent/50 hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-12 px-5 py-3 text-base md:h-10 md:px-4 md:py-2 md:text-sm',
				sm: 'h-10 px-4 text-sm md:h-9 md:px-3',
				lg: 'h-14 px-8 text-lg md:h-11 md:text-base',
				icon: 'h-12 w-12 md:h-10 md:w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };