
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  loading: boolean;
  disabled: boolean;
  amount: number;
  paymentType: string;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  loading,
  disabled,
  amount,
  paymentType
}) => {
  // Format the displayed amount based on payment type
  const formattedAmount = (amount / 100).toFixed(2);
  const buttonText = paymentType === 'annual' 
    ? `Subscribe: $${formattedAmount}/year`
    : `Subscribe: $${formattedAmount}/month`;

  return (
    <Button 
      type="submit" 
      disabled={loading || disabled} 
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : buttonText}
    </Button>
  );
};
