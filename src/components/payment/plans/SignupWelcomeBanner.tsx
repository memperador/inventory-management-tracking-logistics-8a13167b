
import React from 'react';
import { TrendingDown } from 'lucide-react';

const SignupWelcomeBanner: React.FC = () => {
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
      <h2 className="text-xl font-semibold mb-2">Welcome to Inventory Track Pro!</h2>
      <p className="mb-1">Please select a subscription plan to continue, or start with our free trial.</p>
      <div className="flex items-center mt-2 text-emerald-600">
        <TrendingDown className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">Save 10% with annual billing</span>
      </div>
    </div>
  );
};

export default SignupWelcomeBanner;
