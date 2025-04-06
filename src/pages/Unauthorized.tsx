
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Unauthorized = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-lg bg-white p-8 shadow-lg">
        <div className="rounded-full bg-red-100 p-4">
          <ShieldAlert className="h-10 w-10 text-red-600" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>
        <Button asChild>
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
