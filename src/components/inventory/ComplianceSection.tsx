
import React, { useEffect } from 'react';
import { ComplianceAlerts } from '@/components/inventory/compliance/ComplianceAlerts';
import { ComplianceStatus } from '@/components/inventory/compliance/ComplianceStatus';
import { ComplianceReports } from '@/components/inventory/compliance/ComplianceReports';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMaintenanceTracker } from '@/components/inventory/compliance/useMaintenanceTracker';
import { useToast } from "@/hooks/use-toast";
import { ComplianceNotifications } from '@/components/inventory/compliance/ComplianceNotifications';
import { useNotificationContext } from '@/contexts/NotificationContext';

export const ComplianceSection: React.FC = () => {
  const { maintenanceUpdates } = useMaintenanceTracker(equipmentData);
  const { toast } = useToast();
  const { addNotification } = useNotificationContext();
  
  // Check equipment notifications
  useEffect(() => {
    const expiringEquipment = equipmentData.filter(eq => {
      // Check if certification is expiring soon
      if (eq.certificationRequired && eq.certificationExpiry) {
        const certExpiry = new Date(eq.certificationExpiry);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        if (certExpiry <= thirtyDaysFromNow && certExpiry > new Date()) {
          return true;
        }
      }
      
      return false;
    });
    
    if (expiringEquipment.length > 0) {
      addNotification(
        'certification_expiring',
        'Certifications Expiring Soon',
        `${expiringEquipment.length} equipment items have certifications expiring in the next 30 days`,
        'high',
        undefined,
        undefined,
        '/inventory',
        false // Don't show toast as we'll use the existing compliance alerts
      );
    }
  }, [addNotification]);
  
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
        
        // Add to notification center
        addNotification(
          recentUpdate.maintenanceType === 'completed' ? 'maintenance_due' : 'maintenance_due',
          `Maintenance ${action}`,
          `${recentUpdate.equipmentName} maintenance has been ${action} for ${new Date(recentUpdate.date).toLocaleDateString()}`,
          'medium',
          recentUpdate.equipmentId,
          recentUpdate.equipmentName,
          `/inventory?equipment=${recentUpdate.equipmentId}`,
          false // Don't show toast as we already did
        );
      }
    }
  }, [maintenanceUpdates, toast, addNotification]);

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
