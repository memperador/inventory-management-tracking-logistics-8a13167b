
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useTenantUtils = () => {
  const { toast } = useToast();

  /**
   * Get tenant ID for a user
   */
  const getTenantIdForUser = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', userId)
        .single();
        
      if (error || !data) {
        toast({
          title: "Error",
          description: `Could not find tenant for user: ${error?.message || 'Unknown error'}`,
          variant: "destructive" 
        });
        return null;
      }
      
      return data.tenant_id;
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to get tenant ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    getTenantIdForUser
  };
};
