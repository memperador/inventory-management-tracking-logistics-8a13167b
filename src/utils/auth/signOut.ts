
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const signOut = async () => {
  try {
    // Get the user's current status before signing out
    const { data: { user } } = await supabase.auth.getUser();
    const needsSubscription = user?.user_metadata?.needs_subscription === true;
    const isTrialing = user?.user_metadata?.subscription_status === 'trialing';
    
    // Sign the user out
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully',
    });
    
    // If the user is on trial or needs subscription, store this in localStorage
    // so we can redirect them appropriately on next login
    if (needsSubscription || isTrialing) {
      localStorage.setItem('redirect_to_subscription', 'true');
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
