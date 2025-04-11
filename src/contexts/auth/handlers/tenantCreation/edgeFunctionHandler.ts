
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

/**
 * Call the create-tenant edge function
 */
export async function callCreateTenantEdgeFunction(
  accessToken: string,
  tenantName: string,
  userId: string
): Promise<boolean> {
  logAuth('TENANT-EDGE', `Attempting to use edge function for tenant creation`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    // Try to call the edge function to create tenant
    const response = await fetch(`${process.env.SUPABASE_FUNCTIONS_URL || 'https://wscoyigjjcevriqqyxwo.supabase.co/functions/v1'}/create-tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        tenant_name: tenantName,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Edge function returned status ${response.status}`);
    }
    
    const result = await response.json();
    
    logAuth('TENANT-EDGE', `Edge function tenant creation result:`, {
      level: AUTH_LOG_LEVELS.INFO,
      data: result
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error from edge function');
    }
    
    return result.success;
  } catch (error) {
    logAuth('TENANT-EDGE', `Edge function error: ${error instanceof Error ? error.message : String(error)}`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    return false;
  }
}
