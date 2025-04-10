
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export type MigrationResult = {
  success: boolean;
  message: string;
  newTenantId?: string;
};

export const useMigrationBase = () => {
  const { toast } = useToast();
  const { user, refreshSession, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  // Helper function to handle migration responses
  const handleMigrationResponse = async (response: Response, targetUserId: string) => {
    // Log the status and headers for debugging
    console.log('Edge function response status:', response.status);
    console.log('Edge function response type:', response.headers.get('Content-Type'));
    
    logAuth('MIGRATION', `Edge function response: status=${response.status}, type=${response.headers.get('Content-Type')}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    // Check if the response is valid before trying to parse it
    if (!response.ok) {
      const errorText = await response.text();
      logAuth('MIGRATION', `Edge function error: ${errorText}`, {
        level: AUTH_LOG_LEVELS.ERROR
      });
      throw new Error(`Edge function returned error status ${response.status}: ${errorText || 'No error details'}`);
    }
    
    const responseText = await response.text();
    console.log('Edge function raw response:', responseText);
    logAuth('MIGRATION', `Edge function raw response: ${responseText}`, {
      level: AUTH_LOG_LEVELS.DEBUG
    });
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Edge function returned empty response');
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      logAuth('MIGRATION', `Failed to parse response: ${responseText}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: parseError
      });
      throw new Error(`Failed to parse response: ${responseText}`);
    }
    
    if (!result.success) {
      logAuth('MIGRATION', `Edge function reported failure: ${result?.error || result?.message || 'Unknown error'}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: result
      });
      throw new Error(result?.error || result?.message || 'Failed with tenant operation');
    }
    
    logAuth('MIGRATION', `Edge function successful response: ${JSON.stringify(result)}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    return result;
  };

  return {
    isLoading,
    setIsLoading,
    migrationResult,
    setMigrationResult,
    user,
    refreshSession,
    session,
    toast,
    handleMigrationResponse
  };
};
