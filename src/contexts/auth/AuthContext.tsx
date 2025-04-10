
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { signUp, signIn, signOut, resetPassword, refreshSession as refreshSessionUtil } from '@/utils/auth';
import { handleAuthStateChange } from './authStateChangeHandler';

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
  
  useEffect(() => {
    // Track the last auth event to prevent duplicate processing
    let lastAuthEvent = '';
    let lastAuthUserId = '';
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        // Skip duplicate events for the same user
        const currentUserId = currentSession?.user?.id || '';
        const eventKey = `${event}-${currentUserId}`;
        
        if (eventKey === lastAuthEvent) {
          console.log('Skipping duplicate auth event:', event);
          return;
        }
        
        lastAuthEvent = eventKey;
        lastAuthUserId = currentUserId;
        
        setSession(currentSession);
        const newUser = currentSession?.user ?? null;
        setUser(newUser);
        
        // Call the onUserChange callback with the user ID
        if (onUserChange) {
          onUserChange(newUser?.id || null);
        }
        
        // Handle navigation based on auth events using our extracted handler
        if (event === 'SIGNED_IN') {
          handleAuthStateChange(event, currentSession);
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: 'Signed out',
            description: 'You have been signed out successfully.',
          });
          window.location.href = '/auth';
        } else if (event === 'PASSWORD_RECOVERY') {
          window.location.href = '/auth/reset-password';
        }
      }
    );

    // Then get the initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('Initial session check:', initialSession ? 'Authenticated' : 'Not authenticated');
      setSession(initialSession);
      const currentUser = initialSession?.user ?? null;
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
