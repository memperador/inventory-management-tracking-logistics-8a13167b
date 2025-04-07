
import { useState, useEffect } from 'react';
import { Equipment } from '@/components/equipment/types';

export const useMaintenanceTracker = (equipmentData: Equipment[]) => {
  const [maintenanceUpdates, setMaintenanceUpdates] = useState<Array<{
    equipmentId: string;
    equipmentName: string;
    maintenanceType: 'scheduled' | 'completed';
    date: string;
    recordedAt: string;
  }>>([]);

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
        const updates = [];
        
        if (previousItem) {
          // Check if last maintenance was updated
          if (previousItem.lastMaintenance !== currentItem.lastMaintenance && currentItem.lastMaintenance) {
            updates.push({
              equipmentId: currentItem.id,
              equipmentName: currentItem.name,
              maintenanceType: 'completed',
              date: currentItem.lastMaintenance,
              recordedAt: new Date().toISOString()
            });
          }
          
          // Check if next maintenance was updated
          if (previousItem.nextMaintenance !== currentItem.nextMaintenance && currentItem.nextMaintenance) {
            updates.push({
              equipmentId: currentItem.id,
              equipmentName: currentItem.name,
              maintenanceType: 'scheduled',
              date: currentItem.nextMaintenance,
              recordedAt: new Date().toISOString()
            });
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
  }, [equipmentData, maintenanceUpdates]);

  // Function to resolve alerts related to equipment that had maintenance completed
  const resolveRelatedAlerts = (equipmentIds: string[]) => {
    const storedAlerts = localStorage.getItem('complianceAlerts');
    
    if (!storedAlerts) return;
    
    const alerts = JSON.parse(storedAlerts);
    let alertsUpdated = false;
    
    const updatedAlerts = alerts.map(alert => {
      if (
        alert.status !== 'Resolved' && 
        alert.alertType === 'Maintenance' && 
        equipmentIds.includes(alert.equipmentId)
      ) {
        alertsUpdated = true;
        return {
          ...alert,
          status: 'Resolved',
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
