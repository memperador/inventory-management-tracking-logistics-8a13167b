
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Set up auth state listener
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
          
          // Get the return URL from query params if available
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
        
        // Handle email confirmation separately
        // Check URL params for email confirmation status
        const url = new URL(window.location.href);
        const emailConfirmed = url.searchParams.get('email_confirmed') === 'true';
        
        if (emailConfirmed) {
          toast({
            title: 'Email confirmed!',
            description: 'Your email has been verified successfully.',
          });
          // Redirect to dashboard after email confirmation
          window.location.href = '/dashboard';
        }
      }
    );

    // Check for existing session
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

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Error refreshing session:", error);
        throw error;
      }
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      return data;
    } catch (error) {
      console.error("Failed to refresh session:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Get the current domain for site URL
      const domain = window.location.origin;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          },
          emailRedirectTo: `${domain}/auth`,
        },
      });

      if (error) throw error;
      toast({
        title: 'Account created',
        description: 'Please check your email and spam folder for the verification link',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign up',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      // Check if 2FA is required
      if (data?.session === null && data?.user !== null) {
        // This indicates that 2FA is required
        const { data: factorData } = await supabase.auth.mfa.listFactors();
        
        if (factorData?.totp.length > 0) {
          // Store email for 2FA page
          localStorage.setItem('pendingTwoFactorEmail', email);
          
          // Store the factor ID
          localStorage.setItem('factorId', factorData.totp[0].id);
          
          // Redirect to 2FA page
          window.location.href = '/auth/two-factor';
          return;
        }
      }
      
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email',
        variant: 'destructive',
      });
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
    refreshSession
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
