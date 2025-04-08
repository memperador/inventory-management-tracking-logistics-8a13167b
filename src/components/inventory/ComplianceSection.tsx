
import React, { useEffect } from 'react';
import { ComplianceAlerts } from '@/components/inventory/compliance/ComplianceAlerts';
import { ComplianceStatus } from '@/components/inventory/compliance/ComplianceStatus';
import { ComplianceReports } from '@/components/inventory/compliance/ComplianceReports';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMaintenanceTracker } from '@/components/inventory/compliance/useMaintenanceTracker';
import { useToast } from "@/hooks/use-toast";
import { ComplianceNotifications } from '@/components/inventory/compliance/ComplianceNotifications';

export const ComplianceSection: React.FC = () => {
  const { maintenanceUpdates } = useMaintenanceTracker(equipmentData);
  const { toast } = useToast();
  
  // Show toast when maintenance updates are detected
  useEffect(() => {
    if (maintenanceUpdates.length > 0) {
      const recentUpdate = maintenanceUpdates[maintenanceUpdates.length - 1];
      const isRecent = new Date().getTime() - new Date(recentUpdate.recordedAt).getTime() < 5000;
      
      if (isRecent) {
        const action = recentUpdate.maintenanceType === 'completed' ? 'completed' : 'scheduled';
        toast({
          title: `Maintenance ${action}`,
          description: `${recentUpdate.equipmentName} maintenance has been ${action}`,
        });
      }
    }
  }, [maintenanceUpdates, toast]);

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Industry Compliance</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceNotifications equipmentData={equipmentData} />
        <ComplianceAlerts equipmentData={equipmentData} />
      </div>
      
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
