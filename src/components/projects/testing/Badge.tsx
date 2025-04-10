
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  children: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        {
          "bg-primary text-primary-foreground": variant === 'default',
          "border border-input bg-background": variant === 'outline',
          "bg-secondary text-secondary-foreground": variant === 'secondary',
          "bg-destructive text-destructive-foreground": variant === 'destructive',
        },
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
