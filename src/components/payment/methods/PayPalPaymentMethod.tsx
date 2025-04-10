
import React from 'react';

export const PayPalPaymentMethod: React.FC = () => {
  return (
    <div className="rounded-md border p-4 flex justify-center items-center h-20 bg-blue-50">
      <img 
        src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
        alt="PayPal" 
        className="h-8"
      />
      <p className="ml-2 text-blue-800">Pay with PayPal</p>
    </div>
  );
};
