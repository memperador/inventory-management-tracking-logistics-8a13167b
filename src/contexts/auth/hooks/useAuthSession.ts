
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuthSession = (onUserChange?: (userId: string | null) => void) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log(`Auth event: ${event}`, currentSession?.user?.email);
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
      }
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('Initial session check:', initialSession?.user?.email || 'No session');
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
      
      if (onUserChange) {
        onUserChange(initialSession?.user?.id || null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onUserChange]);

  return {
    user,
    session,
    loading,
  };
};
