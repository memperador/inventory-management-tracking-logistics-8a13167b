import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { signUp, signIn, signOut, resetPassword, refreshSession as refreshSessionUtil } from '@/utils/authUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: 'Welcome to Inventory Track Pro!',
            description: 'You have been successfully signed in.',
          });
          
          const returnTo = new URLSearchParams(window.location.search).get('returnTo');
          if (returnTo) {
            window.location.href = decodeURIComponent(returnTo);
          } else if (window.location.pathname === '/auth') {
            window.location.href = '/dashboard';
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: 'Signed out',
            description: 'You have been signed out successfully.',
          });
          window.location.href = '/auth';
        } else if (event === 'PASSWORD_RECOVERY') {
          window.location.href = '/auth/reset-password';
        } else if (event === 'USER_UPDATED') {
          toast({
            title: 'Account updated',
            description: 'Your account information has been updated.',
          });
        } else if (event === 'MFA_CHALLENGE_VERIFIED') {
          toast({
            title: 'Two-factor verification complete',
            description: 'You have been authenticated successfully.',
          });
        } 
        
        const url = new URL(window.location.href);
        const emailConfirmed = url.searchParams.get('email_confirmed') === 'true';
        
        if (emailConfirmed) {
          toast({
            title: 'Email confirmed!',
            description: 'Your email has been verified successfully.',
          });
          window.location.href = '/dashboard';
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Authenticated' : 'Not authenticated');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshSessionWrapper = async () => {
    try {
      const data = await refreshSessionUtil();
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error) {
      console.error("Failed to refresh session:", error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
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
