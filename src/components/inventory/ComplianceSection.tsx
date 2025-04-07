
import React from 'react';
import { ComplianceAlerts } from '@/components/inventory/compliance/ComplianceAlerts';
import { ComplianceStatus } from '@/components/inventory/compliance/ComplianceStatus';
import { ComplianceReports } from '@/components/inventory/compliance/ComplianceReports';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ComplianceSection: React.FC = () => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Industry Compliance</h2>
      
      <ComplianceAlerts equipmentData={equipmentData} />
      
      <Tabs defaultValue="status" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">Compliance Status</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="mt-4">
          <ComplianceStatus equipmentData={equipmentData} />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-4">
          <ComplianceReports equipmentData={equipmentData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
