
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const signUp = async (email: string, password: string, firstName: string, lastName: string, companyName: string = '') => {
  try {
    // Get the absolute URL of the current origin
    // Use muq.munetworks.io for production, but fallback to current origin for local development
    const isProd = window.location.hostname === "muq.munetworks.io";
    const domain = isProd ? "https://muq.munetworks.io" : window.location.origin;
    console.log("Using domain for verification:", domain);
    
    // Create the user account with Supabase with proper redirect URL
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          company_name: companyName, // Add company name to user metadata
          needs_subscription: true // Add flag to indicate subscription needed
        },
        // Use the full URL to /auth route with a query parameter to indicate verification
        // Don't add the new_user flag here, we'll handle it in the verification flow
        emailRedirectTo: `${domain}/auth?email_confirmed=true`,
      },
    });

    if (error) throw error;
    console.log("User signup successful:", data);
    console.log("Signup complete for " + email + ", showing verification notice");

    // Show success toast
    toast({
      title: 'Account created',
      description: 'Please check your email and spam folder for the verification link',
    });
    
    // Return data so we can track the email for verification status
    return { email, data };
    
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to sign up',
      variant: 'destructive',
    });
    throw error;
  }
};
