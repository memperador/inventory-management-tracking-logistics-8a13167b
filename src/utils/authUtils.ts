import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    // Get the domain for the redirect URL - handle both production and development environments
    const domain = window.location.origin;
    console.log("Current domain for verification:", domain);
    
    // 1. First create the user account with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        },
        // Do not set emailRedirectTo here to prevent default email
      },
    });

    if (error) throw error;
    console.log("User signup successful:", data);

    // 2. If signup was successful, send our custom branded verification email
    if (data?.user) {
      try {
        // Get the user ID for verification
        const userId = data.user.id;
        
        // Call our edge function for sending the custom email
        const functionUrl = `${domain}/functions/v1/custom-verification-email`;
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session?.access_token || ''}`,
            'Origin': domain,
            'x-client-domain': domain,
          },
          body: JSON.stringify({
            email,
            user_id: userId,
            domain: domain,
          }),
        });

        const responseData = await response.json();
        console.log("Verification email function response:", responseData);

        if (!response.ok) {
          console.error('Failed to send custom verification email:', responseData);
          toast({
            title: 'Email Verification Issue',
            description: 'There was a problem sending your verification email. Please try again or check your spam folder.',
            variant: 'destructive',
          });
          
          // Fall back to Supabase's default verification method as backup
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
              emailRedirectTo: `${domain}/auth?email_confirmed=true`
            }
          });
          
          if (resendError) {
            console.error("Fallback verification failed:", resendError);
          } else {
            console.log("Fallback verification email sent");
          }
        } else {
          console.log('Custom verification email sent successfully');
          toast({
            title: 'Account created',
            description: 'Please check your email and spam folder for the verification link',
          });
        }
      } catch (emailError) {
        console.error('Error sending custom verification email:', emailError);
        toast({
          title: 'Verification Email Error',
          description: 'Failed to send verification email. Please try again later or check your spam folder.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Account created',
        description: 'Please check your email and spam folder for the verification link',
      });
    }
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
