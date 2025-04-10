
import React from 'react';

const SignupWelcomeBanner: React.FC = () => {
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
      <h2 className="text-xl font-semibold mb-2">Welcome to Inventory Track Pro!</h2>
      <p>Please select a subscription plan to continue, or start with our free trial.</p>
    </div>
  );
};

export default SignupWelcomeBanner;
