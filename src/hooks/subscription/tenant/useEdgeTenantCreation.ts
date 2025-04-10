
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { MigrationResult } from '../useMigrationBase';

/**
 * Hook with edge function tenant creation functionality
 */
export const useEdgeTenantCreation = () => {
  /**
   * Call the create-tenant edge function
   */
  const createTenantWithEdgeFunction = async (
    accessToken: string, 
    tenantName: string, 
    userId: string
  ): Promise<Response> => {
    const functionUrl = `/functions/v1/create-tenant`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        tenantName: tenantName,
        userId: userId
      })
    });
    
    // Log response details for debugging
    logAuth('MIGRATION', `Edge function response: status=${response.status}, type=${response.headers.get('Content-Type')}`, {
      level: AUTH_LOG_LEVELS.INFO, 
      force: true
    });
    
    return response;
  };
  
  /**
   * Parse and validate the response from the edge function
   */
  const parseEdgeFunctionResponse = async (response: Response): Promise<MigrationResult> => {
    // Check if the response is valid
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge function failed: ${errorText || response.statusText}`);
    }
    
    const responseText = await response.text();
    console.log('Edge function raw response:', responseText);
    logAuth('MIGRATION', `Edge function raw response: ${responseText}`, {
      level: AUTH_LOG_LEVELS.DEBUG,
      force: true
    });
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Edge function returned empty response');
    }
    
    // Try to parse the JSON response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      logAuth('MIGRATION', `Failed to parse response: ${responseText}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: parseError,
        force: true
      });
      throw new Error(`Failed to parse response: ${responseText}`);
    }
    
    if (!result.success) {
      throw new Error(result?.error || result?.message || 'Failed with tenant operation');
    }
    
    return {
      success: true,
      message: `Successfully created tenant and moved user`,
      newTenantId: result.newTenantId || result.tenant_id
    };
  };

  return {
    createTenantWithEdgeFunction,
    parseEdgeFunctionResponse
  };
};
