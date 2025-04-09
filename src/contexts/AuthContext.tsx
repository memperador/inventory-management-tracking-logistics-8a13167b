
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
  
  // Track if we've already processed a redirect
  const [redirected, setRedirected] = useState(false);
  
  useEffect(() => {
    // To prevent multiple redirections, track if we've already processed a session
    let initialSessionProcessed = false;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        const newUser = session?.user ?? null;
        setUser(newUser);
        
        // Call the onUserChange callback with the user ID
        if (onUserChange) {
          onUserChange(newUser?.id || null);
        }
        
        if (event === 'SIGNED_IN') {
          toast({
            title: 'Welcome to Inventory Track Pro!',
            description: 'You have been successfully signed in.',
          });
          
          // Check if user needs subscription flow or was previously redirected
          const needsSubscription = session?.user?.user_metadata?.needs_subscription === true;
          const redirectToSubscription = localStorage.getItem('redirect_to_subscription') === 'true';
          
          // Only redirect if we haven't already processed a redirect and we're actually on the auth page
          if ((needsSubscription || redirectToSubscription) && !redirected && !initialSessionProcessed && window.location.pathname === '/auth') {
            initialSessionProcessed = true;
            setRedirected(true);
            localStorage.removeItem('redirect_to_subscription'); // Clear the flag
            
            // Use a delay to prevent race conditions
            setTimeout(() => {
              window.location.href = '/payment';
            }, 500);
            return;
          }
          
          if (!redirected && !initialSessionProcessed && window.location.pathname === '/auth') {
            initialSessionProcessed = true;
            setRedirected(true);
            const returnTo = new URLSearchParams(window.location.search).get('returnTo');
            
            // Use a delay to prevent race conditions
            setTimeout(() => {
              if (returnTo) {
                window.location.href = decodeURIComponent(returnTo);
              } else {
                window.location.href = '/dashboard';
              }
            }, 500);
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: 'Signed out',
            description: 'You have been signed out successfully.',
          });
          initialSessionProcessed = false;
          setRedirected(false);
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
      }
    );

    // Get the initial session just once
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
