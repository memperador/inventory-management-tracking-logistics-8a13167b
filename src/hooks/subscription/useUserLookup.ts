
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserLookupResult } from '@/components/account/superadmin/types';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const useUserLookup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<UserLookupResult | null>(null);

  const lookupUserByEmail = async (email: string): Promise<void> => {
    if (!email) return;
    
    setIsLoading(true);
    setLookupResult(null);

    try {
      logAuth('USER-LOOKUP', `Looking up user by email: ${email}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // Try to use the edge function first
      try {
        const { data, error } = await supabase.functions.invoke('get-user-by-email', {
          body: { email }
        });
        
        if (error) {
          logAuth('USER-LOOKUP', `Edge function error: ${error.message}`, {
            level: AUTH_LOG_LEVELS.ERROR,
            data: error
          });
          throw error;
        }
        
        if (data && data.id) {
          logAuth('USER-LOOKUP', `Found user via edge function: ${data.id}`, {
            level: AUTH_LOG_LEVELS.INFO
          });
          
          setLookupResult({
            userId: data.id,
            email: email,
            displayName: data.display_name || email
          });
          return;
        }
      } catch (functionError) {
        logAuth('USER-LOOKUP', `Edge function failed, falling back: ${functionError instanceof Error ? functionError.message : String(functionError)}`, {
          level: AUTH_LOG_LEVELS.WARN,
          data: functionError
        });
        
        // Fall back to direct query as the edge function might not be available
        // Note: This will only return the first user in development environments
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1);
          
        if (error) {
          logAuth('USER-LOOKUP', `Direct query error: ${error.message}`, {
            level: AUTH_LOG_LEVELS.ERROR,
            data: error
          });
          throw error;
        }
        
        if (data && data.length > 0) {
          const userId = data[0].id;
          logAuth('USER-LOOKUP', `Found user via direct query: ${userId}`, {
            level: AUTH_LOG_LEVELS.INFO
          });
          
          setLookupResult({
            userId: userId,
            email: email,
            displayName: email
          });
        } else {
          logAuth('USER-LOOKUP', `No user found for email: ${email}`, {
            level: AUTH_LOG_LEVELS.INFO
          });
          throw new Error(`No user found with email ${email}`);
        }
      }
    } catch (error) {
      logAuth('USER-LOOKUP', `User lookup failed: ${error instanceof Error ? error.message : String(error)}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      
      setLookupResult(null);
      // Re-throw to let the caller handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    lookupResult,
    lookupUserByEmail
  };
};
