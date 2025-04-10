
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const signIn = async (email: string, password: string) => {
  console.log(`[AUTH-SIGNIN] Sign in initiated for email: ${email}`);
  try {
    // Clear any previous login state to prevent loops
    console.log('[AUTH-SIGNIN] Clearing previous session storage items');
    
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
      console.log(`[AUTH-SIGNIN] Removing session storage key: ${key}`);
      sessionStorage.removeItem(key);
    });
    
    console.log('[AUTH-SIGNIN] Calling supabase.auth.signInWithPassword');
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    console.log('[AUTH-SIGNIN] Sign in response received', { 
      success: !error,
      hasSession: !!data?.session,
      hasUser: !!data?.user
    });
    
    if (error) throw error;
    
    if (data?.session === null && data?.user !== null) {
      console.log('[AUTH-SIGNIN] Session is null but user is not null - checking for MFA');
      const { data: factorData } = await supabase.auth.mfa.listFactors();
      
      if (factorData?.totp.length > 0) {
        console.log('[AUTH-SIGNIN] MFA required, redirecting to two-factor page');
        localStorage.setItem('pendingTwoFactorEmail', email);
        localStorage.setItem('factorId', factorData.totp[0].id);
        window.location.href = '/auth/two-factor';
        return;
      }
    }
    
    // Set a flag to prevent duplicate toasts with a unique timestamp
    const toastId = `login_toast_${Date.now()}`;
    if (!sessionStorage.getItem('login_toast_shown')) {
      console.log('[AUTH-SIGNIN] Showing login toast notification');
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully',
      });
      sessionStorage.setItem('login_toast_shown', toastId);
      
      // Clear this flag after 5 seconds
      console.log('[AUTH-SIGNIN] Setting timeout to clear login toast flag');
      setTimeout(() => {
        if (sessionStorage.getItem('login_toast_shown') === toastId) {
          console.log('[AUTH-SIGNIN] Clearing login toast flag');
          sessionStorage.removeItem('login_toast_shown');
        }
      }, 5000);
    }
    
    console.log('[AUTH-SIGNIN] Sign in process completed successfully');
  } catch (error: any) {
    console.error('[AUTH-SIGNIN] Error during sign in:', error.message || 'Failed to sign in');
    toast({
      title: 'Error',
      description: error.message || 'Failed to sign in',
      variant: 'destructive',
    });
    throw error;
  }
};
