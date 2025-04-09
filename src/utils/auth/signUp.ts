
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    // Get the absolute URL of the current origin - ensure it's fully formatted
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
        emailRedirectTo: `${domain}/auth?email_confirmed=true`,
      },
    });

    if (error) throw error;
    console.log("User signup successful:", data);

    // 2. If signup was successful, send our custom branded verification email
    if (data?.user) {
      try {
        // Get the user ID for verification
        const userId = data.user.id;
        
        console.log("Sending custom verification email to:", email);
        console.log("Using domain:", domain);
        
        // Use our SMTP-based verification email function
        const functionUrl = "https://wscoyigjjcevriqqyxwo.supabase.co/functions/v1/custom-verification-email";
        console.log("Using function URL:", functionUrl);
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session?.access_token || ''}`,
          },
          body: JSON.stringify({
            email,
            user_id: userId,
            domain,
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
          console.log("Attempting fallback verification via Supabase");
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
            toast({
              title: 'Verification Email Sent',
              description: 'Please check your email to verify your account.',
            });
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
        
        // Try the fallback method if custom email fails
        try {
          const { error: fallbackError } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
              emailRedirectTo: `${domain}/auth?email_confirmed=true`
            }
          });
          
          if (!fallbackError) {
            toast({
              title: 'Verification Email Sent',
              description: 'Please check your email to verify your account.',
            });
          }
        } catch (fallbackErr) {
          console.error("Fallback email method also failed:", fallbackErr);
        }
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
