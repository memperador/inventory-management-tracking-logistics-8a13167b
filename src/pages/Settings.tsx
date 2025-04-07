
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import PageHeader from '@/components/common/PageHeader';
import ThemeSettings from '@/components/settings/ThemeSettings';
import FeatureSettings from '@/components/settings/FeatureSettings';
import GeneralSettings from '@/components/settings/GeneralSettings';
import ImplementationStatus from '@/components/settings/ImplementationStatus';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container py-6">
      <PageHeader 
        title="Settings" 
        description="Manage your organization settings and preferences" 
      />

      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="implementation">Implementation Status</TabsTrigger>
          </TabsList>
          
          <Card className="p-6">
            <TabsContent value="general" className="space-y-6">
              <GeneralSettings />
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-6">
              <ThemeSettings />
            </TabsContent>
            
            <TabsContent value="features" className="space-y-6">
              <FeatureSettings />
            </TabsContent>

            <TabsContent value="implementation" className="space-y-6">
              <ImplementationStatus />
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
