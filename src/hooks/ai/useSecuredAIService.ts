
import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/useTenantContext';
import { useRole } from '@/hooks/useRoleContext';
import { supabase } from '@/integrations/supabase/client';

interface UseSecuredAIServiceProps {
  fallbackToUserInput?: boolean;
}

export const useSecuredAIService = ({ fallbackToUserInput = true }: UseSecuredAIServiceProps = {}) => {
  const [isReady, setIsReady] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [model, setModel] = useState<string>("llama-3.1-sonar-small-128k-online");
  const { currentTenant } = useTenant();
  const { userRole } = useRole();
  
  // This would be populated from secure storage in a production app
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  const isSuperAdmin = userRole === 'superadmin';
  
  // Check if tenant has AI enabled and get configuration
  useEffect(() => {
    const checkAIConfig = async () => {
      if (!currentTenant) return;
      
      try {
        const settings = currentTenant.settings;
        const aiConfig = settings?.aiConfig;
        
        // If AI config exists in tenant settings
        if (aiConfig) {
          setIsEnabled(aiConfig.isAiEnabled !== false); // default to true
          if (aiConfig.defaultModel) {
            setModel(aiConfig.defaultModel);
          }
          
          // In a real implementation, you would fetch the API key from a secure source
          // such as Supabase Edge Function Secrets or environment variables
          // This is just a placeholder
          if (aiConfig.hasApiKey) {
            // Simulate API key retrieval - this would be an API call to a secure endpoint in production
            // Only superadmin would have access to view the full API key
            setApiKey("sk_perplexity_tenant_key");
            setIsReady(true);
          } else {
            setApiKey(null);
            setIsReady(false);
          }
        }
      } catch (error) {
        console.error("Error fetching AI configuration:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAIConfig();
  }, [currentTenant]);
  
  // Functions for superadmin to manage API keys
  const updateAPIKey = async (newApiKey: string) => {
    if (!isSuperAdmin || !currentTenant) {
      return false;
    }
    
    try {
      // In a real implementation, store the API key securely
      // For demonstration, we're just updating the hasApiKey flag in tenant settings
      const { error } = await supabase
        .from('tenants')
        .update({
          industry_code_preferences: {
            settings: {
              ...(currentTenant.settings || {}),
              aiConfig: {
                isAiEnabled: isEnabled,
                defaultModel: model,
                hasApiKey: !!newApiKey
              }
            }
          }
        })
        .eq('id', currentTenant.id);
      
      if (error) throw error;
      
      // Update local state
      setApiKey(newApiKey);
      setIsReady(!!newApiKey);
      return true;
    } catch (error) {
      console.error("Error updating API key:", error);
      return false;
    }
  };
  
  // Toggle AI features on/off
  const toggleAIFeatures = async (enabled: boolean) => {
    if (!isSuperAdmin || !currentTenant) {
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          industry_code_preferences: {
            settings: {
              ...(currentTenant.settings || {}),
              aiConfig: {
                isAiEnabled: enabled,
                defaultModel: model,
                hasApiKey: !!apiKey
              }
            }
          }
        })
        .eq('id', currentTenant.id);
      
      if (error) throw error;
      
      setIsEnabled(enabled);
      return true;
    } catch (error) {
      console.error("Error toggling AI features:", error);
      return false;
    }
  };
  
  return {
    apiKey,
    isReady,
    isEnabled,
    isLoading,
    model,
    isSuperAdmin,
    updateAPIKey,
    toggleAIFeatures,
    fallbackToUserInput,
    setApiKey: (key: string) => {
      // For non-superadmins, this will just be a temporary session key
      if (!isSuperAdmin) {
        setApiKey(key);
        setIsReady(!!key);
      }
    }
  };
};
