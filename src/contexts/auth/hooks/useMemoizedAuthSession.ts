
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { isSessionValid, sessionNeedsRefresh } from '../utils/sessionUtils';
import { SecureCache } from '../utils/secureCache';

export const useMemoizedAuthSession = (onUserChange?: (userId: string | null) => void) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  
  // Memoize the validate session function
  const validateSession = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) return false;
    
    // Check if token is about to expire (within 5 minutes)
    const expiresAt = currentSession.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesInSeconds = 5 * 60;
    
    if (expiresAt && expiresAt - now < fiveMinutesInSeconds) {
      const cacheKey = `refresh_attempt:${currentSession.user.id}`;
      
      // Don't retry refresh if we just tried
      if (SecureCache.has(cacheKey)) {
        return false;
      }
      
      logAuth('AUTH-SESSION', 'Session token expiring soon, refreshing', {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      try {
        const { data, error } = await supabase.auth.refreshSession();
        
        // Cache this refresh attempt to prevent excessive refresh calls
        SecureCache.set(cacheKey, true, 10); // 10 seconds
        
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
  
  // Memoize user metadata for derived values
  const userMetadata = useMemo(() => {
    if (!user) return null;
    return user.user_metadata || {};
  }, [user]);
  
  // Memoize role
  const userRole = useMemo(() => {
    if (!userMetadata) return null;
    return userMetadata.role as string || 'viewer';
  }, [userMetadata]);
  
  // Handle auth state changes
  useEffect(() => {
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
              return;
            }
          }

          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (onUserChange) {
            onUserChange(currentSession?.user?.id || null);
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
    sessionError,
    userMetadata,
    userRole
  };
};
