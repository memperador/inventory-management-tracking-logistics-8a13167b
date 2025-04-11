
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// This will run immediately when imported
(async function fixLabratAdmin() {
  try {
    console.log('URGENT: Fixing labrat admin role on page load');
    
    // Labrat's known ID
    const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6';
    
    // Get the current user session
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;
    
    // Only proceed if this is actually the labrat user
    if (currentUser?.id !== userId) {
      console.log('Not the labrat user, skipping admin role fix');
      return;
    }

    console.log('Confirmed labrat user, applying admin role fixes');
    
    // Update user role in DB - force it to be admin
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating role in database:', updateError);
    }
    
    // Update user metadata with admin role
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { role: 'admin' }
    });
    
    if (metadataError) {
      console.error('Error updating auth metadata:', metadataError);
    }
    
    // Force refresh session
    await supabase.auth.refreshSession();
    
    // Get the updated session to verify the change
    const { data: updatedSession } = await supabase.auth.getSession();
    console.log('Updated user metadata:', updatedSession?.session?.user?.user_metadata);
    
    console.log('URGENT: Fixed labrat admin role');
    
    // Add a toast notification
    toast({
      title: 'Admin Role Updated',
      description: 'Your user role has been updated to Admin. The page will refresh shortly.',
    });
    
    // Force reload the page to ensure all app state is refreshed
    // Only reload once to avoid infinite loops
    const hasReloaded = sessionStorage.getItem('admin_role_reload');
    if (!hasReloaded) {
      console.log('Reloading page to apply admin role changes...');
      sessionStorage.setItem('admin_role_reload', 'true');
      
      // Slight delay to allow toast to be seen
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      console.log('Already reloaded once, not reloading again');
    }
  } catch (error) {
    console.error('Failed to fix labrat admin role:', error);
  }
})();
