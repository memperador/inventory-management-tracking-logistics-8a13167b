
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const signUp = async (email: string, password: string, firstName: string, lastName: string, companyName: string = '') => {
  try {
    // Log the signup attempt with detailed information
    logAuth('SIGNUP', `Attempting signup for ${email} with company name: '${companyName}'`, {
      level: AUTH_LOG_LEVELS.INFO,
      force: true,
      data: { firstName, lastName, companyNameProvided: !!companyName }
    });

    // Get the absolute URL of the current origin for redirect
    const domain = window.location.origin;
    console.log("Using domain for verification:", domain);
    
    // Create the user account with Supabase with proper redirect URL
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          company_name: companyName || `${firstName}'s Company`, // Ensure company name is always set
          needs_subscription: true, // Add flag to indicate subscription needed
          role: 'admin', // Set the initial user role to admin
          is_new_tenant: true, // Flag to indicate this is a new tenant creation
          is_tenant_admin: true // Flag to mark user as tenant admin
        },
        // Use the full URL to /auth route with a query parameter to indicate verification
        emailRedirectTo: `${domain}/auth?email_confirmed=true`,
      },
    });

    if (error) throw error;
    
    logAuth('SIGNUP', `User signup successful for ${email}`, {
      level: AUTH_LOG_LEVELS.INFO,
      force: true,
      data: { 
        userId: data.user?.id,
        companyName: companyName || `${firstName}'s Company`,
        metadata: data.user?.user_metadata 
      }
    });
    
    // After signup, create tenant (this will be handled through RLS triggers)
    const tenantCreation = {
      email,
      userId: data.user?.id,
      success: true
    };

    logAuth('SIGNUP', `Tenant creation process initiated`, {
      level: AUTH_LOG_LEVELS.INFO,
      data: tenantCreation
    });
    
    // Show success toast
    toast({
      title: 'Account created',
      description: 'Please check your email and spam folder for the verification link',
    });
    
    // Return data so we can track the email for verification status
    return { email, data };
    
  } catch (error: any) {
    // Log the signup error
    logAuth('SIGNUP', `Signup failed for ${email}: ${error.message}`, {
      level: AUTH_LOG_LEVELS.ERROR,
      force: true,
      data: error
    });
    
    // Display appropriate error message
    if (error.message?.includes('Organization Already Exists') || 
        error.message?.includes('already exist in our system')) {
      toast({
        title: 'Organization Already Exists',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign up',
        variant: 'destructive',
      });
    }
    throw error;
  }
};
