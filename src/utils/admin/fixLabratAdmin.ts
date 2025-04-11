
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// This will run immediately when imported
(async function fixLabratAdmin() {
  try {
    console.log('URGENT: Fixing labrat admin role on page load');
    
    // Labrat's known ID
    const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6';
    
    // Update user role in DB
    await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId);
    
    // Update user metadata
    await supabase.auth.updateUser({
      data: { role: 'admin' }
    });
    
    // Force refresh session
    await supabase.auth.refreshSession();
    
    console.log('URGENT: Fixed labrat admin role');
    
    // Add a toast notification
    toast({
      title: 'Admin Role Updated',
      description: 'Your user role has been updated to Admin. The UI will refresh shortly.',
    });
    
    // Force reload the page to ensure all app state is refreshed
    // Only reload once to avoid infinite loops
    const hasReloaded = sessionStorage.getItem('admin_role_reload');
    if (!hasReloaded && window.location.pathname !== '/auth') {
      console.log('Reloading page to apply admin role changes...');
      sessionStorage.setItem('admin_role_reload', 'true');
      
      // Slight delay to allow toast to be seen
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  } catch (error) {
    console.error('Failed to fix labrat admin role:', error);
  }
})();
