
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { signUp, signIn, signOut, resetPassword, refreshSession as refreshSessionUtil } from '@/utils/auth';
import { handleAuthStateChange } from './authStateChangeHandler';
import { logAuth, AUTH_LOG_LEVELS, dumpAuthLogs } from '@/utils/debug/authLogger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, companyName: string) => Promise<{ email: string; data: any }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  debugAuth: () => any[]; // New debug function
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
    logAuth('AUTH', 'AuthProvider initializing...', {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    // Track the last auth event to prevent duplicate processing
    let lastAuthEvent = '';
    let lastAuthTime = 0;
    let lastAuthUserId = '';
    
    // Clear any existing session storage that might cause loops
    logAuth('AUTH', 'Clearing any previous session storage items that might cause loops', {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.startsWith('auth_processed_') || 
        key.startsWith('processing_') || 
        key === 'login_toast_shown'
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove items in a separate loop to avoid index issues
    keysToRemove.forEach(key => {
      logAuth('AUTH', `Removing session storage key: ${key}`, {
        level: AUTH_LOG_LEVELS.DEBUG
      });
      sessionStorage.removeItem(key);
    });
    
    // First set up the auth state change listener
    logAuth('AUTH', 'Setting up auth state change listener', {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        logAuth('AUTH', `Auth state changed: ${event}`, {
          level: AUTH_LOG_LEVELS.INFO,
          data: {
            hasSession: !!currentSession,
            userId: currentSession?.user?.id || 'none',
            currentPath: window.location.pathname,
            timestamp: new Date().toISOString()
          }
        });
        
        // Skip duplicate events for the same user within a short timeframe
        const currentUserId = currentSession?.user?.id || '';
        const currentTime = Date.now();
        const eventKey = `${event}-${currentUserId}`;
        
        if (eventKey === lastAuthEvent && currentTime - lastAuthTime < 3000) {
          logAuth('AUTH', `Skipping duplicate auth event: ${event} for user: ${currentUserId.substring(0, 8) || 'none'}... (${currentTime - lastAuthTime}ms since last event)`, {
            level: AUTH_LOG_LEVELS.INFO
          });
          return;
        }
        
        logAuth('AUTH', `Processing auth event: ${event} for user: ${currentUserId.substring(0, 8) || 'none'}`, {
          level: AUTH_LOG_LEVELS.INFO
        });
        
        lastAuthEvent = eventKey;
        lastAuthTime = currentTime;
        lastAuthUserId = currentUserId;
        
        setSession(currentSession);
        const newUser = currentSession?.user ?? null;
        setUser(newUser);
        
        // Call the onUserChange callback with the user ID
        if (onUserChange) {
          logAuth('AUTH', `Calling onUserChange with userId: ${newUser?.id || 'null'}`, {
            level: AUTH_LOG_LEVELS.DEBUG
          });
          onUserChange(newUser?.id || null);
        }
        
        // Handle navigation based on auth events using our extracted handler
        if (event === 'SIGNED_IN') {
          logAuth('AUTH', 'SIGNED_IN event detected - handling navigation', {
            level: AUTH_LOG_LEVELS.INFO
          });
          handleAuthStateChange(event, currentSession);
        } else if (event === 'SIGNED_OUT') {
          logAuth('AUTH', 'SIGNED_OUT event detected - cleaning up and navigating to /auth', {
            level: AUTH_LOG_LEVELS.INFO
          });
          
          // Clean up any session storage keys that might cause redirect loops
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (
              key.startsWith('auth_processed_') || 
              key.startsWith('processing_') || 
              key === 'login_toast_shown'
            )) {
              logAuth('AUTH', `Removing session storage key on signout: ${key}`, {
                level: AUTH_LOG_LEVELS.DEBUG
              });
              sessionStorage.removeItem(key);
            }
          }
          
          toast({
            title: 'Signed out',
            description: 'You have been signed out successfully.',
          });
          
          logAuth('AUTH', 'Redirecting to /auth after signout', {
            level: AUTH_LOG_LEVELS.INFO
          });
          window.location.href = '/auth';
        } else if (event === 'PASSWORD_RECOVERY') {
          logAuth('AUTH', 'PASSWORD_RECOVERY event detected - navigating to /auth/reset-password', {
            level: AUTH_LOG_LEVELS.INFO
          });
          window.location.href = '/auth/reset-password';
        } else if (event === 'INITIAL_SESSION') {
          logAuth('AUTH', 'INITIAL_SESSION event detected', {
            level: AUTH_LOG_LEVELS.INFO
          });
        }
      }
    );

    // Then get the initial session
    logAuth('AUTH', 'Checking for initial session', {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      logAuth('AUTH', `Initial session check: ${initialSession ? 'Authenticated' : 'Not authenticated'}`, {
        level: AUTH_LOG_LEVELS.INFO,
        data: {
          userId: initialSession?.user?.id || 'none',
          currentPath: window.location.pathname
        }
      });
      
      setSession(initialSession);
      const currentUser = initialSession?.user ?? null;
      setUser(currentUser);
      
      // Call the onUserChange callback with the user ID
      if (onUserChange) {
        logAuth('AUTH', `Initial session - calling onUserChange with userId: ${currentUser?.id || 'null'}`, {
          level: AUTH_LOG_LEVELS.INFO
        });
        onUserChange(currentUser?.id || null);
      }
      
      logAuth('AUTH', 'AuthProvider initialization complete', {
        level: AUTH_LOG_LEVELS.INFO
      });
      setLoading(false);
    });

    return () => {
      logAuth('AUTH', 'Cleaning up auth subscription', {
        level: AUTH_LOG_LEVELS.INFO
      });
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
    logAuth('AUTH', `Sign up initiated for email: ${email}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return await signUp(email, password, firstName, lastName, companyName);
  };

  const handleSignIn = async (email: string, password: string) => {
    logAuth('AUTH', `Sign in initiated for email: ${email}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    await signIn(email, password);
  };

  const refreshSessionWrapper = async () => {
    logAuth('AUTH', 'Refreshing session', {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    try {
      const data = await refreshSessionUtil();
      
      logAuth('AUTH', 'Session refreshed successfully', {
        level: AUTH_LOG_LEVELS.INFO,
        data: {
          userId: data.session?.user?.id || 'none'
        }
      });
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      // Call the onUserChange callback with the user ID
      if (onUserChange && data.session?.user) {
        logAuth('AUTH', `After refresh - calling onUserChange with userId: ${data.session.user.id}`, {
          level: AUTH_LOG_LEVELS.INFO
        });
        onUserChange(data.session.user.id);
      }
    } catch (error) {
      logAuth('AUTH', 'Failed to refresh session:', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      throw error;
    }
  };

  // New debug function
  const debugAuth = () => {
    logAuth('AUTH-DEBUG', 'Dumping auth logs to console', {
      level: AUTH_LOG_LEVELS.INFO
    });
    return dumpAuthLogs();
  };

  const value = {
    user,
    session,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut,
    resetPassword,
    refreshSession: refreshSessionWrapper,
    debugAuth // Expose the debug function
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
