
import React from 'react';

const BillingTab: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
      <p className="text-muted-foreground mb-6">
        View and manage your billing information and payment methods.
      </p>
      
      <div className="border rounded-md p-6 mb-6 bg-card">
        <h3 className="text-lg font-medium mb-3">Payment Methods</h3>
        <p className="text-sm text-muted-foreground mb-4">
          No payment methods have been added yet.
        </p>
        
        <button className="text-sm text-primary hover:underline">
          + Add Payment Method
        </button>
      </div>
      
      <div className="border rounded-md p-6 bg-card">
        <h3 className="text-lg font-medium mb-3">Billing History</h3>
        <p className="text-sm text-muted-foreground">
          No billing history available.
        </p>
      </div>
    </div>
  );
};

export default BillingTab;
