
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    const domain = window.location.origin;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        },
        emailRedirectTo: `${domain}/auth`,
      },
    });

    if (error) throw error;
    toast({
      title: 'Account created',
      description: 'Please check your email and spam folder for the verification link',
    });
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to sign up',
      variant: 'destructive',
    });
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
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
    
    toast({
      title: 'Welcome back!',
      description: 'You have been signed in successfully',
    });
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to sign in',
      variant: 'destructive',
    });
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully',
    });
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to sign out',
      variant: 'destructive',
    });
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to send password reset email',
      variant: 'destructive',
    });
    throw error;
  }
};

export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Error refreshing session:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to refresh session:", error);
    throw error;
  }
};
