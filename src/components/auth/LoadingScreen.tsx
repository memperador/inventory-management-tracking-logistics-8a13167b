
import React from 'react';

export const LoadingScreen = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-inventory-blue border-t-transparent"></div>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
};
