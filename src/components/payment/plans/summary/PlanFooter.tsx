
import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export const PlanFooter: React.FC = () => {
  return (
    <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="h-4 w-4" />
        <span>Your payment information is securely processed.</span>
      </div>
      <p>You can upgrade or downgrade your plan at any time.</p>
    </CardFooter>
  );
};
