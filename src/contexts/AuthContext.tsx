import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { signUp, signIn, signOut, resetPassword, refreshSession as refreshSessionUtil } from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, companyName: string) => Promise<{ email: string; data: any }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  onUserChange?: (userId: string | null) => void;
}

export const AuthProvider = ({ children, onUserChange }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Keep track of whether a navigation has been processed
  const [navigationInProgress, setNavigationInProgress] = useState(false);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        const newUser = session?.user ?? null;
        setUser(newUser);
        
        // Call the onUserChange callback with the user ID
        if (onUserChange) {
          onUserChange(newUser?.id || null);
        }
        
        // Handle navigation only for signed in events and only if not already navigating
        if (event === 'SIGNED_IN' && !navigationInProgress && window.location.pathname === '/auth') {
          setNavigationInProgress(true);
          console.log('Processing sign-in redirect...');
          
          // Use setTimeout to ensure state updates complete before navigation
          setTimeout(() => {
            const needsSubscription = session?.user?.user_metadata?.needs_subscription === true;
            const returnTo = new URLSearchParams(window.location.search).get('returnTo');
            
            if (needsSubscription) {
              console.log('Redirecting to payment page...');
              window.location.href = '/payment';
            } else if (returnTo) {
              console.log(`Redirecting to: ${returnTo}`);
              window.location.href = decodeURIComponent(returnTo);
            } else {
              console.log('Redirecting to dashboard...');
              window.location.href = '/dashboard';
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: 'Signed out',
            description: 'You have been signed out successfully.',
          });
          setNavigationInProgress(false);
          window.location.href = '/auth';
        } else if (event === 'PASSWORD_RECOVERY') {
          window.location.href = '/auth/reset-password';
        }
      }
    );

    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Authenticated' : 'Not authenticated');
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Call the onUserChange callback with the user ID
      if (onUserChange) {
        onUserChange(currentUser?.id || null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onUserChange]);

  const handleSignUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    companyName: string
  ) => {
    return await signUp(email, password, firstName, lastName, companyName);
  };

  const refreshSessionWrapper = async () => {
    try {
      const data = await refreshSessionUtil();
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      // Call the onUserChange callback with the user ID
      if (onUserChange && data.session?.user) {
        onUserChange(data.session.user.id);
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp: handleSignUp,
    signIn,
    signOut,
    resetPassword,
    refreshSession: refreshSessionWrapper
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
