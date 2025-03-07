
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-ring disabled:opacity-50 disabled:pointer-events-none',
          
          // Variants
          variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
          variant === 'outline' && 'border border-input bg-background hover:bg-secondary hover:text-foreground',
          variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          variant === 'ghost' && 'hover:bg-secondary hover:text-foreground',
          variant === 'link' && 'text-primary underline-offset-4 hover:underline',
          variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          
          // Sizes
          size === 'default' && 'px-6 py-2.5 text-sm',
          size === 'sm' && 'px-4 py-2 text-xs',
          size === 'lg' && 'px-8 py-3 text-base',
          size === 'icon' && 'h-10 w-10',
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
