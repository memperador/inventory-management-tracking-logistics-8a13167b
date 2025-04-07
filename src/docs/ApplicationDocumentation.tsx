
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

// Import all the tab content components
import InventoryDocumentation from './tabs/InventoryDocumentation';
import ComplianceDocumentation from './tabs/ComplianceDocumentation';
import GPSIntegrationDocumentation from './tabs/GPSIntegrationDocumentation';
import AssetTrackingDocumentation from './tabs/AssetTrackingDocumentation';
import AIAssistantTab from './tabs/AIAssistantTab';
import GeneralDocumentation from './tabs/GeneralDocumentation';

const ApplicationDocumentation = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Application Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive documentation of features and functionality
        </p>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="grid grid-cols-6 w-full mb-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="gps-integration">GPS Integration</TabsTrigger>
          <TabsTrigger value="asset-tracking">Asset Tracking</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryDocumentation />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ComplianceDocumentation />
        </TabsContent>

        <TabsContent value="gps-integration" className="space-y-4">
          <GPSIntegrationDocumentation />
        </TabsContent>

        <TabsContent value="asset-tracking" className="space-y-4">
          <AssetTrackingDocumentation />
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-4">
          <AIAssistantTab />
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <GeneralDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicationDocumentation;
