
import { supabase } from '@/integrations/supabase/client';

// This function will run automatically when imported
(async function fixLabratUser() {
  try {
    console.log('Attempting to fix labrat user role...');
    
    // Try to update the user role to admin directly
    await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', '9e32e738-5f44-44f8-bc15-6946b27296a6') // If you know the user ID
      
    console.log('Labrat user role update attempted');
  } catch (error) {
    console.error('Failed to fix labrat user role:', error);
  }
})();
