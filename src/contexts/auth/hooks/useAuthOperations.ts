
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuthOperations = () => {
  const signIn = async (email: string, password: string) => {
    try {
      console.log(`Signing in user: ${email}`);
      
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully',
      });
      
      return data;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, companyName: string) => {
    try {
      console.log(`Signing up user: ${email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            company_name: companyName || `${firstName}'s Company`,
            role: 'admin'
          },
          emailRedirectTo: `${window.location.origin}/auth?email_confirmed=true`,
        },
      });

      if (error) throw error;
      
      toast({
        title: 'Account created',
        description: 'Please check your email for verification link',
      });
      
      return { email, data };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign up',
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the password reset link',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email',
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  const refreshSession = async () => {
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

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession
  };
};
