
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const signOut = async () => {
  try {
    // Get the user's current status before signing out
    const { data: { user } } = await supabase.auth.getUser();
    const needsSubscription = user?.user_metadata?.needs_subscription === true;
    const isTrialing = user?.user_metadata?.subscription_status === 'trialing';
    const trialEndsAt = user?.user_metadata?.trial_ends_at;
    const subscriptionTier = user?.user_metadata?.subscription_tier;
    
    // Sign the user out
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully',
    });
    
    // Store subscription information for next login
    if (needsSubscription || isTrialing || subscriptionTier) {
      const redirectInfo = {
        redirect_to_subscription: needsSubscription === true,
        subscription_status: isTrialing ? 'trialing' : (subscriptionTier ? 'active' : undefined),
        trial_ends_at: trialEndsAt || undefined,
        subscription_tier: subscriptionTier || undefined
      };
      
      localStorage.setItem('subscription_info', JSON.stringify(redirectInfo));
    }
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to sign out',
      variant: 'destructive',
    });
    throw error;
  }
};
