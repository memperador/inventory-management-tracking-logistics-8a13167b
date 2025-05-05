
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const useAuthSession = (onUserChange?: (userId: string | null) => void) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<Error | null>(null);

  // Function to validate the session token
  const validateSession = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) return false;
    
    // Check if token is about to expire (within 5 minutes)
    const expiresAt = currentSession.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesInSeconds = 5 * 60;
    
    if (expiresAt && expiresAt - now < fiveMinutesInSeconds) {
      logAuth('AUTH-SESSION', 'Session token expiring soon, refreshing', {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return !!data.session;
      } catch (error) {
        logAuth('AUTH-SESSION', 'Failed to refresh session', {
          level: AUTH_LOG_LEVELS.ERROR,
          data: error
        });
        return false;
      }
    }
    
    return true;
  }, []);

  useEffect(() => {
    // Set up auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        logAuth('AUTH-EVENT', `Auth event: ${event}`, {
          level: AUTH_LOG_LEVELS.INFO,
          data: { email: currentSession?.user?.email }
        });
        
        try {
          // Validate session on relevant events
          if (currentSession && ['SIGNED_IN', 'TOKEN_REFRESHED'].includes(event)) {
            const isValid = await validateSession(currentSession);
            
            if (!isValid) {
              logAuth('AUTH-SESSION', 'Invalid session detected, signing out', {
                level: AUTH_LOG_LEVELS.WARN
              });
              await supabase.auth.signOut();
              toast({
                title: 'Session expired',
                description: 'Your session has expired. Please sign in again.',
              });
              return;
            }
          }

          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (onUserChange) {
            onUserChange(currentSession?.user?.id || null);
          }
          
          if (event === 'SIGNED_OUT') {
            toast({
              title: 'Signed out',
              description: 'You have been signed out successfully.',
            });
            window.location.href = '/auth';
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Unknown auth error');
          setSessionError(err);
          logAuth('AUTH-SESSION', 'Error handling auth state change', {
            level: AUTH_LOG_LEVELS.ERROR,
            data: err
          });
        }
      }
    );

    // Initial session check
    (async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Validate the initial session
        if (initialSession) {
          const isValid = await validateSession(initialSession);
          
          if (!isValid) {
            logAuth('AUTH-SESSION', 'Invalid initial session, signing out', {
              level: AUTH_LOG_LEVELS.WARN
            });
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          } else {
            setSession(initialSession);
            setUser(initialSession.user);
            
            if (onUserChange) {
              onUserChange(initialSession.user.id);
            }
          }
        } else {
          setSession(null);
          setUser(null);
          
          if (onUserChange) {
            onUserChange(null);
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown session error');
        setSessionError(err);
        logAuth('AUTH-SESSION', 'Error getting initial session', {
          level: AUTH_LOG_LEVELS.ERROR,
          data: err
        });
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      subscription.unsubscribe();
    };
  }, [onUserChange, validateSession]);

  return {
    user,
    session,
    loading,
    sessionError
  };
};
