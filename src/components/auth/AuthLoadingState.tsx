
import React from 'react';

const AuthLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-inventory-blue border-t-transparent"></div>
      <p className="text-sm text-gray-500">Loading authentication status...</p>
    </div>
  );
};

export default AuthLoadingState;
