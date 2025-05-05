
import React, { createContext, useContext } from 'react';
import { useMemoizedAuthSession } from './hooks/useMemoizedAuthSession';
import { useAuthOperations } from './hooks/useAuthOperations';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import type { AuthContextType, AuthProviderProps } from './types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, onUserChange }) => {
  const { user, session, loading, sessionError } = useMemoizedAuthSession(onUserChange);
  const { 
    signIn, 
    signUp, 
    signOut, 
    resetPassword, 
    refreshSession,
    isProcessing
  } = useAuthOperations();

  const value: AuthContextType = {
    user,
    session,
    loading,
    sessionError,
    isProcessing,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
  };

  return (
    <AuthErrorBoundary>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </AuthErrorBoundary>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
