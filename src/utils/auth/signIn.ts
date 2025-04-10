
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const signIn = async (email: string, password: string) => {
  try {
    // Clear any previous login state to prevent loops
    sessionStorage.removeItem(`auth_processed_${email}`);
    
    // Also clear any other session storage items that might cause loops
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.startsWith('auth_processed_') || 
        key.startsWith('processing_') || 
        key === 'login_toast_shown'
      )) {
        sessionStorage.removeItem(key);
      }
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) throw error;
    
    if (data?.session === null && data?.user !== null) {
      const { data: factorData } = await supabase.auth.mfa.listFactors();
      
      if (factorData?.totp.length > 0) {
        localStorage.setItem('pendingTwoFactorEmail', email);
        localStorage.setItem('factorId', factorData.totp[0].id);
        window.location.href = '/auth/two-factor';
        return;
      }
    }
    
    // Set a flag to prevent duplicate toasts with a unique timestamp
    const toastId = `login_toast_${Date.now()}`;
    if (!sessionStorage.getItem('login_toast_shown')) {
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully',
      });
      sessionStorage.setItem('login_toast_shown', toastId);
      
      // Clear this flag after 5 seconds
      setTimeout(() => {
        if (sessionStorage.getItem('login_toast_shown') === toastId) {
          sessionStorage.removeItem('login_toast_shown');
        }
      }, 5000);
    }
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to sign in',
      variant: 'destructive',
    });
    throw error;
  }
};
