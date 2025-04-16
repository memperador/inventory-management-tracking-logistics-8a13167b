
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthCard from '@/components/auth/AuthCard';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

const Auth = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if email is confirmed from URL params
  const emailConfirmed = searchParams.get('email_confirmed') === 'true';
  
  // Redirect authenticated users to the dashboard or the page they were trying to access
  React.useEffect(() => {
    if (user && !loading) {
      const returnTo = searchParams.get('returnTo');
      navigate(returnTo ? decodeURIComponent(returnTo) : '/dashboard', { replace: true });
    }
  }, [user, loading, navigate, searchParams]);
  
  // Handle signup completion
  const handleSignupComplete = (email: string) => {
    console.log(`Signup completed for ${email}`);
  };
  
  // Display loading or auth card
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <AuthCard 
          emailConfirmed={emailConfirmed}
          onSignupComplete={handleSignupComplete}
        />
      </div>
    </div>
  );
};

export default Auth;
