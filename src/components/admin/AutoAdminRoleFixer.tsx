
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LABRAT_EMAIL, LABRAT_USER_ID } from '@/utils/auth/labratUserUtils';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const AutoAdminRoleFixer: React.FC = () => {
  const { user, refreshSession } = useAuth();
  
  // Auto-detect and fix labrat user issues
  useEffect(() => {
    if (user?.email === LABRAT_EMAIL) {
      const fixLabratAdmin = async () => {
        try {
          logAuth('AUTO-FIXER', 'Automatically fixing labrat admin role', {
            level: AUTH_LOG_LEVELS.INFO
          });
          
          // Fix user role in database
          await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', LABRAT_USER_ID);
          
          // Fix role in auth metadata
          await supabase.auth.updateUser({
            data: { role: 'admin' }
          });
          
          // Refresh session to apply changes
          await refreshSession();
          
          logAuth('AUTO-FIXER', 'Labrat admin role fixed automatically', {
            level: AUTH_LOG_LEVELS.INFO
          });
          
          // If we got redirected to auth page when logged in, force dashboard redirect
          if (window.location.pathname === '/auth' || window.location.pathname === '/login') {
            sessionStorage.setItem('force_dashboard_redirect', 'true');
            window.location.href = '/dashboard';
          }
        } catch (error) {
          console.error('Error in automatic labrat fix:', error);
        }
      };
      
      fixLabratAdmin();
    }
  }, [user, refreshSession]);
  
  // This component doesn't render anything
  return null;
};

export default AutoAdminRoleFixer;
