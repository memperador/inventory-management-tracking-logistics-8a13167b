
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    // Use the current origin as the redirect URL
    const domain = window.location.origin;
    console.log("Current domain for redirect:", domain);
    
    // Regular signup with Supabase - but don't use the email redirect option
    // This prevents Supabase from sending its own verification email
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        },
        // Don't set emailRedirectTo here - we'll handle this in our custom email
      },
    });

    if (error) throw error;

    // If signup was successful, send our own custom verification email
    if (data?.user) {
      try {
        // Create a confirmation URL for our custom email
        // This should point to the actual origin, not localhost
        const confirmationUrl = `${domain}/auth?email_confirmed=true`;
        
        console.log("Signup successful, sending custom verification email");
        console.log("Email:", email);
        console.log("Confirmation URL:", confirmationUrl);
        
        // Call our custom Edge Function to send the branded email
        // Use the full Supabase URL with project ID
        const functionUrl = 'https://wscoyigjjcevriqqyxwo.supabase.co/functions/v1/custom-verification-email';
        console.log("Calling function URL:", functionUrl);
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session?.access_token || ''}`,
          },
          body: JSON.stringify({
            email,
            confirmation_url: confirmationUrl,
          }),
        });

        const responseData = await response.json();
        console.log("Response status:", response.status);
        console.log("Response data:", responseData);

        if (!response.ok) {
          console.error('Failed to send custom verification email:', responseData);
          toast({
            title: 'Verification Email Issue',
            description: 'There was a problem sending the verification email. Please try again or contact support.',
            variant: 'destructive',
          });
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
          description: 'Failed to send verification email. Please try again later.',
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
