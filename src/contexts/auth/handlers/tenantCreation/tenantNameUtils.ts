import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

/**
 * Generate a tenant name from user information
 */
export async function generateTenantName(userId: string, userEmail?: string | null): Promise<string> {
  // Get tenant name from user metadata or email
  const { data: { user } } = await supabase.auth.getUser();
  
  // If there's a company name in user metadata, use that
  if (user?.user_metadata?.company_name) {
    return user.user_metadata.company_name;
  }
  
  // Otherwise, try to create a name from the email
  if (userEmail) {
    return `${userEmail.split('@')[0]}'s Organization`;
  }
  
  // If all else fails, use a generic name
  return 'New Organization';
}
