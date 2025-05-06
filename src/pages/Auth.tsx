
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthCard from '@/components/auth/AuthCard';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

const Auth = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if email is confirmed from URL params
  const emailConfirmed = searchParams.get('email_confirmed') === 'true';
  
  // Detect and break potential auth loops
  useEffect(() => {
    if (searchParams.get('bypass') === 'loop') {
      logAuth('AUTH-PAGE', 'Loop breaker parameter detected, setting session flags', {
        level: AUTH_LOG_LEVELS.WARN
      });
      sessionStorage.setItem('break_auth_loop', 'true');
    }
  }, [searchParams]);
  
  // Redirect authenticated users to the dashboard or the page they were trying to access
  useEffect(() => {
    if (user && !loading) {
      const returnTo = searchParams.get('returnTo');
      const redirectPath = returnTo ? decodeURIComponent(returnTo) : '/dashboard';
      
      logAuth('AUTH-PAGE', `User already authenticated, redirecting to: ${redirectPath}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    }
  }, [user, loading, navigate, searchParams]);
  
  // Handle signup completion
  const handleSignupComplete = (email: string) => {
    logAuth('AUTH-PAGE', `Signup completed for ${email}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
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
