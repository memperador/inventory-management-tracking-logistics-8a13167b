
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    // Get the absolute URL of the current origin
    const domain = window.location.origin;
    console.log("Current domain for verification:", domain);
    
    // Create the user account with Supabase with proper redirect URL
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        },
        emailRedirectTo: `${domain}/auth?email_confirmed=true`,
      },
    });

    if (error) throw error;
    console.log("User signup successful:", data);

    // Show success toast
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
