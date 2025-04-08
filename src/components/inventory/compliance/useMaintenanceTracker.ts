import { useState, useEffect } from 'react';
import { Equipment, ComplianceAlert } from '@/components/equipment/types';
import { useNotificationContext } from '@/contexts/NotificationContext';

interface MaintenanceUpdate {
  equipmentId: string;
  equipmentName: string;
  maintenanceType: 'scheduled' | 'completed';
  date: string;
  recordedAt: string;
}

export const useMaintenanceTracker = (equipmentData: Equipment[]) => {
  const [maintenanceUpdates, setMaintenanceUpdates] = useState<MaintenanceUpdate[]>([]);
  const { addNotification } = useNotificationContext();

  // Load maintenance updates from localStorage
  useEffect(() => {
    const storedUpdates = localStorage.getItem('maintenanceUpdates');
    if (storedUpdates) {
      setMaintenanceUpdates(JSON.parse(storedUpdates));
    }
  }, []);

  // Track changes in equipment maintenance dates
  useEffect(() => {
    const storedEquipmentState = localStorage.getItem('previousEquipmentState');
    
    if (storedEquipmentState) {
      const previousEquipment = JSON.parse(storedEquipmentState) as Equipment[];
      
      // Check for maintenance updates
      const newUpdates = equipmentData.flatMap(currentItem => {
        const previousItem = previousEquipment.find(item => item.id === currentItem.id);
        const updates: MaintenanceUpdate[] = [];
        
        if (previousItem) {
          // Check if last maintenance was updated
          if (previousItem.lastMaintenance !== currentItem.lastMaintenance && currentItem.lastMaintenance) {
            const update = {
              equipmentId: currentItem.id,
              equipmentName: currentItem.name,
              maintenanceType: 'completed' as const,
              date: currentItem.lastMaintenance,
              recordedAt: new Date().toISOString()
            };
            
            updates.push(update);
            
            // Also create notification
            addNotification(
              'maintenance_due',
              'Maintenance Completed',
              `${currentItem.name} maintenance has been completed`,
              'medium',
              currentItem.id,
              currentItem.name,
              `/inventory?equipment=${currentItem.id}`,
              true
            );
          }
          
          // Check if next maintenance was updated
          if (previousItem.nextMaintenance !== currentItem.nextMaintenance && currentItem.nextMaintenance) {
            const update = {
              equipmentId: currentItem.id,
              equipmentName: currentItem.name,
              maintenanceType: 'scheduled' as const,
              date: currentItem.nextMaintenance,
              recordedAt: new Date().toISOString()
            };
            
            updates.push(update);
            
            // Also create notification
            addNotification(
              'maintenance_due',
              'Maintenance Scheduled',
              `${currentItem.name} has been scheduled for maintenance on ${new Date(currentItem.nextMaintenance).toLocaleDateString()}`,
              'low',
              currentItem.id,
              currentItem.name,
              `/inventory?equipment=${currentItem.id}`,
              true
            );
          }
        }
        
        return updates;
      });
      
      if (newUpdates.length > 0) {
        const combinedUpdates = [...maintenanceUpdates, ...newUpdates];
        setMaintenanceUpdates(combinedUpdates);
        localStorage.setItem('maintenanceUpdates', JSON.stringify(combinedUpdates));
        
        // Clear any resolved alerts for maintenance that was completed
        const resolvedMaintenanceIds = newUpdates
          .filter(update => update.maintenanceType === 'completed')
          .map(update => update.equipmentId);
        
        if (resolvedMaintenanceIds.length > 0) {
          resolveRelatedAlerts(resolvedMaintenanceIds);
        }
      }
    }
    
    // Store current equipment state for future comparison
    localStorage.setItem('previousEquipmentState', JSON.stringify(equipmentData));
  }, [equipmentData, maintenanceUpdates, addNotification]);

  // Function to resolve alerts related to equipment that had maintenance completed
  const resolveRelatedAlerts = (equipmentIds: string[]) => {
    const storedAlerts = localStorage.getItem('complianceAlerts');
    
    if (!storedAlerts) return;
    
    const alerts = JSON.parse(storedAlerts) as ComplianceAlert[];
    let alertsUpdated = false;
    
    const updatedAlerts = alerts.map(alert => {
      if (
        alert.status !== 'Resolved' && 
        alert.alertType === 'Maintenance' && 
        equipmentIds.includes(alert.equipmentId)
      ) {
        alertsUpdated = true;
        
        // Create a notification for resolved alert
        addNotification(
          'general',
          'Maintenance Alert Automatically Resolved',
          `Maintenance alert for ${alert.equipmentName} has been automatically resolved due to completed maintenance`,
          'low',
          alert.equipmentId,
          alert.equipmentName,
          undefined,
          false // Don't show a toast for each item
        );
        
        return {
          ...alert,
          status: 'Resolved' as const,
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          resolutionNote: 'Automatically resolved due to maintenance completion'
        };
      }
      return alert;
    });
    
    if (alertsUpdated) {
      localStorage.setItem('complianceAlerts', JSON.stringify(updatedAlerts));
    }
  };

  return {
    maintenanceUpdates,
    resolveRelatedAlerts
  };
};
