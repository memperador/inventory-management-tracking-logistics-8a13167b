
import React from 'react';
import { Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VendorIntegrationProps } from './types';
import { useVendorIntegration } from './hooks/useVendorIntegration';
import { ConnectTab } from './components/ConnectTab';
import { WebhookTab } from './components/WebhookTab';
import { VendorsTab } from './components/VendorsTab';
import { LogsTab } from './components/LogsTab';

export const VendorIntegration: React.FC<VendorIntegrationProps> = () => {
  const {
    activeTab,
    setActiveTab,
    apiKey,
    setApiKey,
    vendorUrl,
    setVendorUrl,
    webhooks,
    testingWebhook,
    testStatus,
    handleConnect,
    addWebhook,
    toggleWebhookStatus,
    deleteWebhook,
    testWebhook
  } = useVendorIntegration();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Vendor Integration
        </CardTitle>
        <CardDescription>
          Connect to your vendor purchasing systems to streamline inventory management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connect" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="webhook">Webhooks</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="pt-4">
            <ConnectTab
              vendorUrl={vendorUrl}
              setVendorUrl={setVendorUrl}
              apiKey={apiKey}
              setApiKey={setApiKey}
              handleConnect={handleConnect}
            />
          </TabsContent>
          
          <TabsContent value="webhook" className="pt-4">
            <WebhookTab
              webhooks={webhooks}
              testingWebhook={testingWebhook}
              testStatus={testStatus}
              onAddWebhook={addWebhook}
              onToggleWebhookStatus={toggleWebhookStatus}
              onDeleteWebhook={deleteWebhook}
              onTestWebhook={testWebhook}
            />
          </TabsContent>
          
          <TabsContent value="vendors" className="pt-4">
            <VendorsTab />
          </TabsContent>
          
          <TabsContent value="logs" className="pt-4">
            <LogsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
