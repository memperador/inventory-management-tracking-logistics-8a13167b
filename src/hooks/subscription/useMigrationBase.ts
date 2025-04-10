
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';

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
    
    // Check if the response is valid before trying to parse it
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error response:', errorText);
      throw new Error(`Edge function returned error status ${response.status}: ${errorText || 'No error details'}`);
    }
    
    const responseText = await response.text();
    console.log('Edge function raw response:', responseText);
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Edge function returned empty response');
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error(`Failed to parse response: ${responseText}`);
    }
    
    if (!result.success) {
      throw new Error(result?.error || result?.message || 'Failed with tenant operation');
    }
    
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
