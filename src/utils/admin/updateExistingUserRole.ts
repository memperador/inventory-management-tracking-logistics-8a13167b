
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { toast } from '@/hooks/use-toast';

/**
 * Update an existing user's role in the database
 * This can be called from a custom admin page or directly executed
 */
export async function updateUserToAdmin(userEmail: string): Promise<boolean> {
  try {
    // First we need to get the user ID for this email
    // This would normally require an edge function or a server-side component
    // For demo purposes, we'll try to find the user directly in the users table
    // Note: In a production app, you should use an edge function to get user data
    const { data: userData, error: userError } = await supabase
      .functions.invoke('get-user-by-email', {
        body: { email: userEmail }
      });
    
    if (userError || !userData) {
      logAuth('ADMIN', `Failed to find user with email ${userEmail}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: userError
      });
      return false;
    }
    
    const userId = userData.id;
    
    // Update the user's role in the users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId);
    
    if (updateError) {
      logAuth('ADMIN', `Failed to update user role: ${updateError.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: updateError
      });
      return false;
    }
    
    logAuth('ADMIN', `Successfully updated user ${userEmail} to admin role`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    toast({
      title: 'Role Updated',
      description: `User ${userEmail} is now an admin`
    });
    
    return true;
  } catch (error) {
    logAuth('ADMIN', `Error updating user role: ${error instanceof Error ? error.message : String(error)}`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    return false;
  }
}

/**
 * Function to check and update the role of a specific user (labrat@iaware.com)
 */
export async function fixLabratUserRole(): Promise<void> {
  try {
    // This is a specific fix for the labrat@iaware.com user with known ID
    const labratUserId = '9e32e738-5f44-44f8-bc15-6946b27296a6';
    
    const { data, error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', labratUserId)
      .select();
    
    if (error) {
      logAuth('ADMIN', `Failed to update labrat user role: ${error.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      return;
    }
    
    logAuth('ADMIN', 'Successfully updated labrat@iaware.com to admin role', {
      level: AUTH_LOG_LEVELS.INFO,
      data
    });
    
    toast({
      title: 'Role Updated',
      description: 'User labrat@iaware.com is now an admin'
    });
  } catch (error) {
    logAuth('ADMIN', `Error fixing labrat user role: ${error instanceof Error ? error.message : String(error)}`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
  }
}
