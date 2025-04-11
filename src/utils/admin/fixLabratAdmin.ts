
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
    
    // If on payment page, redirect to dashboard
    if (window.location.pathname === '/payment') {
      console.log('Redirecting from payment to dashboard');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  } catch (error) {
    console.error('Failed to fix labrat admin role:', error);
  }
})();
