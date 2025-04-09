
import { supabase } from '@/integrations/supabase/client';

export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Error refreshing session:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to refresh session:", error);
    throw error;
  }
};
