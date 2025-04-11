
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { findTenantByEmail } from '@/contexts/auth/handlers/checkTenant';

export const signIn = async (email: string, password: string) => {
  logAuth('AUTH-SIGNIN', `Sign in initiated for email: ${email}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    // Clear any previous login state to prevent loops
    logAuth('AUTH-SIGNIN', 'Clearing previous session storage items', {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    const keysToRemove = [];
    sessionStorage.removeItem(`auth_processed_${email}`);
    
    // Also clear any other session storage items that might cause loops
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
      logAuth('AUTH-SIGNIN', `Removing session storage key: ${key}`, {
        level: AUTH_LOG_LEVELS.DEBUG
      });
      sessionStorage.removeItem(key);
    });
    
    // Check if there is an existing tenant for this email before signing in
    // This will help with returning users who already have a tenant
    logAuth('AUTH-SIGNIN', `Checking for existing tenant before login for email: ${email}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    const preLoginTenantCheck = await findTenantByEmail(email);
    const existingTenantId = preLoginTenantCheck.tenantId;
    const existingTenantName = preLoginTenantCheck.tenantName;
    
    logAuth('AUTH-SIGNIN', `Calling supabase.auth.signInWithPassword`, {
      level: AUTH_LOG_LEVELS.INFO,
      data: {
        existingTenantFound: !!existingTenantId,
        tenantName: existingTenantName
      }
    });
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    logAuth('AUTH-SIGNIN', 'Sign in response received', { 
      level: AUTH_LOG_LEVELS.INFO,
      data: {
        success: !error,
        hasSession: !!data?.session,
        hasUser: !!data?.user
      }
    });
    
    if (error) throw error;
    
    if (data?.session === null && data?.user !== null) {
      logAuth('AUTH-SIGNIN', 'Session is null but user is not null - checking for MFA', {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      const { data: factorData } = await supabase.auth.mfa.listFactors();
      
      if (factorData?.totp && factorData.totp.length > 0) {
        logAuth('AUTH-SIGNIN', 'MFA required, redirecting to two-factor page', {
          level: AUTH_LOG_LEVELS.INFO
        });
        localStorage.setItem('pendingTwoFactorEmail', email);
        localStorage.setItem('factorId', factorData.totp[0].id);
        window.location.href = '/auth/two-factor';
        return;
      }
    }

    // Check if this is a returning user who already has a tenant
    const userId = data?.user?.id;
    if (userId) {
      logAuth('AUTH-SIGNIN', `Checking for existing tenant for user: ${userId}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // If we already found a tenant before login, use that
      if (existingTenantId) {
        logAuth('AUTH-SIGNIN', `Using tenant found before login: ${existingTenantId}`, {
          level: AUTH_LOG_LEVELS.INFO
        });
        
        // Associate this user with the existing tenant if needed
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', userId)
          .single();
          
        if (!userError && !userData?.tenant_id) {
          // User exists but doesn't have a tenant association, connect them
          logAuth('AUTH-SIGNIN', `Associating user with existing tenant: ${existingTenantId}`, {
            level: AUTH_LOG_LEVELS.INFO
          });
          
          await supabase
            .from('users')
            .update({ tenant_id: existingTenantId })
            .eq('id', userId);
        }
        
        // Store tenant information in user metadata
        await supabase.auth.updateUser({
          data: { 
            tenant_id: existingTenantId,
            tenant_name: existingTenantName,
            needs_subscription: false // They're joining an existing tenant, so no subscription needed
          }
        });
      } else {
        // Query for existing tenant association if we didn't find one earlier
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', userId)
          .single();
          
        if (!userError && userData?.tenant_id) {
          logAuth('AUTH-SIGNIN', `Found existing tenant for user: ${userData.tenant_id}`, {
            level: AUTH_LOG_LEVELS.INFO
          });
          
          // Store tenant information in user metadata if it's not already there
          if (!data.user.user_metadata?.tenant_id) {
            await supabase.auth.updateUser({
              data: { 
                tenant_id: userData.tenant_id,
                needs_subscription: false
              }
            });
            
            logAuth('AUTH-SIGNIN', `Updated user metadata with existing tenant_id: ${userData.tenant_id}`, {
              level: AUTH_LOG_LEVELS.INFO
            });
          }
        }
      }
    }
    
    // Set a flag to prevent duplicate toasts with a unique timestamp
    const toastId = `login_toast_${Date.now()}`;
    if (!sessionStorage.getItem('login_toast_shown')) {
      logAuth('AUTH-SIGNIN', 'Showing login toast notification', {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully',
      });
      sessionStorage.setItem('login_toast_shown', toastId);
      
      // Clear this flag after 5 seconds
      logAuth('AUTH-SIGNIN', 'Setting timeout to clear login toast flag', {
        level: AUTH_LOG_LEVELS.DEBUG
      });
      
      setTimeout(() => {
        if (sessionStorage.getItem('login_toast_shown') === toastId) {
          logAuth('AUTH-SIGNIN', 'Clearing login toast flag', {
            level: AUTH_LOG_LEVELS.DEBUG
          });
          sessionStorage.removeItem('login_toast_shown');
        }
      }, 5000);
    }
    
    logAuth('AUTH-SIGNIN', 'Sign in process completed successfully', {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    // Return the session and user data
    return { session: data.session, user: data.user };
    
  } catch (error: any) {
    logAuth('AUTH-SIGNIN', 'Error during sign in:', {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    
    toast({
      title: 'Error',
      description: error.message || 'Failed to sign in',
      variant: 'destructive',
    });
    throw error;
  }
};
