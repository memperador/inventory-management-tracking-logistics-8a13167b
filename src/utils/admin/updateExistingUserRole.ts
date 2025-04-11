
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { toast } from '@/hooks/use-toast';

/**
 * Update an existing user's role in the database
 * This can be called from a custom admin page or directly executed
 */
export async function updateUserToAdmin(userEmail: string): Promise<boolean> {
  try {
    // First we need to get the user ID from the email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) {
      logAuth('ADMIN', `Failed to list users: ${getUserError.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: getUserError
      });
      return false;
    }
    
    const targetUser = users.find(user => user.email === userEmail);
    if (!targetUser) {
      logAuth('ADMIN', `User with email ${userEmail} not found`, {
        level: AUTH_LOG_LEVELS.ERROR
      });
      return false;
    }
    
    // Update the user's role in the users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', targetUser.id);
    
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
    // This is a specific fix for the labrat@iaware.com user
    const { data, error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', '9e32e738-5f44-44f8-bc15-6946b27296a6') // If you know the user ID, use it directly
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
