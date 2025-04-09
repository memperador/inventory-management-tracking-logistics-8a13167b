
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
  
  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        setSession(currentSession);
        const newUser = currentSession?.user ?? null;
        setUser(newUser);
        
        // Call the onUserChange callback with the user ID
        if (onUserChange) {
          onUserChange(newUser?.id || null);
        }
        
        // Handle navigation based on auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in, checking tenant and subscription status');
          
          // Use setTimeout to ensure state updates complete before navigation
          setTimeout(async () => {
            if (!currentSession?.user) return;
            
            try {
              // Check if user has an associated tenant
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('tenant_id')
                .eq('id', currentSession.user.id)
                .single();
                
              if (userError && userError.code !== 'PGRST116') {
                console.error('Error checking user tenant:', userError);
                return;
              }
              
              // If no tenant is associated, redirect to onboarding
              if (!userData?.tenant_id) {
                console.log('No tenant associated, redirecting to onboarding');
                window.location.href = '/onboarding';
                return;
              }
              
              // Check tenant subscription status
              const { data: tenantData, error: tenantError } = await supabase
                .from('tenants')
                .select('subscription_status, subscription_tier, trial_ends_at')
                .eq('id', userData.tenant_id)
                .single();
                
              if (tenantError) {
                console.error('Error checking tenant subscription:', tenantError);
                return;
              }
              
              const needsSubscription = currentSession.user.user_metadata?.needs_subscription === true;
              const returnTo = new URLSearchParams(window.location.search).get('returnTo');
              
              // Determine if subscription is active or in trial period
              const now = new Date();
              
              // Safe access to tenantData properties with null checks
              const trialEndsAtStr = tenantData !== null 
                ? (tenantData && typeof tenantData === 'object' && 'trial_ends_at' in tenantData 
                  ? String(tenantData.trial_ends_at) 
                  : null) 
                : null;
              
              const trialEndsAt = trialEndsAtStr ? new Date(trialEndsAtStr) : null;
              
              const hasActiveSubscription = tenantData !== null
                ? (tenantData && typeof tenantData === 'object' && 'subscription_status' in tenantData 
                  ? String(tenantData.subscription_status) === 'active'
                  : false)
                : false;
              
              const inTrialPeriod = trialEndsAt && trialEndsAt > now;
              
              // Redirect logic
              if (needsSubscription || (!hasActiveSubscription && !inTrialPeriod)) {
                console.log('User needs subscription, redirecting to payment page');
                window.location.href = '/payment';
              } else if (returnTo) {
                console.log(`Redirecting to returnTo URL: ${returnTo}`);
                window.location.href = decodeURIComponent(returnTo);
              } else if (window.location.pathname === '/auth') {
                console.log('Redirecting to dashboard');
                window.location.href = '/dashboard';
              }
            } catch (error) {
              console.error('Error during post-login checks:', error);
            }
          }, 0);
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
