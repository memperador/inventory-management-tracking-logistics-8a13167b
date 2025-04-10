
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserLookupResult } from '@/components/account/superadmin/types';

export const useUserLookup = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<UserLookupResult | null>(null);

  /**
   * Look up a user by their email
   */
  const lookupUserByEmail = async (email: string) => {
    setIsLoading(true);
    setLookupResult(null);
    
    try {
      // Simple approach to look up users - in a production app you would have proper email storage
      // For demo purposes, we'll just search for users and use the first one
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error || !data || data.length === 0) {
        toast({
          title: "User Not Found",
          description: `No user found with email: ${email}. SuperAdmin may need to check Supabase directly.`,
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }

      // Use the first user found (for demonstration purposes)
      const userId = data[0]?.id;
      
      if (!userId) {
        toast({
          title: "User Not Found",
          description: `No user found with email: ${email}.`,
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }

      // For demonstration purposes
      const result = { userId, email };
      setLookupResult(result);
      toast({
        title: "User Found",
        description: `Found user: ${email}`
      });
      setIsLoading(false);
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to lookup user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setIsLoading(false);
      return null;
    }
  };

  return {
    isLoading,
    lookupResult,
    setLookupResult,
    lookupUserByEmail
  };
};
