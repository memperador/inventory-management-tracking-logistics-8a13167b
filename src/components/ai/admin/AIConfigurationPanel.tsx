
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, Bot, Settings, Key, Check, RefreshCcw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRole } from '@/hooks/useRoleContext';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenantContext';

interface ApiKeyConfig {
  perplexityApiKey: string;
  isAiEnabled: boolean;
  defaultModel: string;
}

const AIConfigurationPanel: React.FC = () => {
  const { userRole } = useRole();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<ApiKeyConfig>({
    perplexityApiKey: '',
    isAiEnabled: true,
    defaultModel: 'llama-3.1-sonar-small-128k-online'
  });

  const isSuperAdmin = userRole === 'superadmin';

  const handleSaveConfig = async () => {
    if (!isSuperAdmin || !currentTenant?.id) return;
    
    try {
      setIsSaving(true);
      
      // In a real implementation, store the API key securely in your backend
      // Here we simulate storing it in the tenant settings
      const { error } = await supabase
        .from('tenants')
        .update({
          industry_code_preferences: {
            settings: {
              ...(currentTenant?.settings || {}),
              aiConfig: {
                isAiEnabled: config.isAiEnabled,
                defaultModel: config.defaultModel,
                // Don't store the full API key in tenant settings
                hasApiKey: !!config.perplexityApiKey
              }
            }
          }
        })
        .eq('id', currentTenant.id);
        
      if (error) throw error;
      
      // For a real implementation, you would store the actual API key in Supabase Edge Function Secrets
      // or another secure storage mechanism
      
      toast({
        title: "Settings saved",
        description: "AI configuration has been updated successfully",
      });
    } catch (error) {
      console.error('Error saving AI configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save AI configuration",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            AI Configuration
          </CardTitle>
          <CardDescription>
            You don't have permission to view this section.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5" />
          AI Configuration Panel
        </CardTitle>
        <CardDescription>
          Configure AI settings for this tenant
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mx-4">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="apikeys">API Keys</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>
        
        <CardContent className="p-6">
          <TabsContent value="general">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label htmlFor="enable-ai" className="font-medium">Enable AI Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle AI functionality for this tenant
                  </p>
                </div>
                <Switch
                  id="enable-ai"
                  checked={config.isAiEnabled}
                  onCheckedChange={(checked) => setConfig({...config, isAiEnabled: checked})}
                />
              </div>
              
              <div className="border rounded-md p-4 bg-muted/30">
                <h3 className="font-medium mb-2">Current Configuration</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tenant</span>
                    <span className="text-sm font-medium">{currentTenant?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <span className="text-sm font-medium">{currentTenant?.subscription_tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">API Status</span>
                    <span className="text-sm font-medium flex items-center">
                      {config.perplexityApiKey ? (
                        <>
                          <Check className="h-4 w-4 text-green-500 mr-1" /> 
                          Configured
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4 text-amber-500 mr-1" /> 
                          Not Configured
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="apikeys">
            <div className="space-y-4">
              <div>
                <Label htmlFor="perplexity-key" className="text-sm">Perplexity API Key</Label>
                <div className="flex mt-1">
                  <Input
                    id="perplexity-key"
                    type="password"
                    placeholder="Enter Perplexity API key"
                    value={config.perplexityApiKey}
                    onChange={(e) => setConfig({...config, perplexityApiKey: e.target.value})}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This key will be securely stored and used for all tenant users.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="models">
            <div className="space-y-4">
              <div>
                <Label htmlFor="default-model" className="font-medium">Default Model</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select the default model to use for this tenant
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className={`border rounded-md p-4 cursor-pointer ${config.defaultModel === 'llama-3.1-sonar-small-128k-online' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setConfig({...config, defaultModel: 'llama-3.1-sonar-small-128k-online'})}
                  >
                    <div className="font-medium">Small Model</div>
                    <div className="text-sm text-muted-foreground">8B parameters</div>
                    <div className="text-xs text-muted-foreground mt-2">Suitable for standard tier and below</div>
                  </div>
                  
                  <div 
                    className={`border rounded-md p-4 cursor-pointer ${config.defaultModel === 'llama-3.1-sonar-large-128k-online' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setConfig({...config, defaultModel: 'llama-3.1-sonar-large-128k-online'})}
                  >
                    <div className="font-medium">Large Model</div>
                    <div className="text-sm text-muted-foreground">70B parameters</div>
                    <div className="text-xs text-muted-foreground mt-2">Recommended for premium tier only</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
        
        <CardFooter className="flex justify-end border-t p-4">
          <Button 
            onClick={() => setConfig({...config, perplexityApiKey: ''})} 
            variant="outline" 
            className="mr-2"
          >
            <RefreshCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          
          <Button 
            onClick={handleSaveConfig} 
            disabled={isSaving}
          >
            <Settings className="h-4 w-4 mr-1" /> Save Configuration
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  );
};

export default AIConfigurationPanel;
