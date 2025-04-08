
import { useState, useEffect } from 'react';
import { ComplianceAlert, Equipment } from '@/components/equipment/types';
import { isPast, isAfter, addDays } from 'date-fns';
import { useNotificationContext } from '@/contexts/NotificationContext';

export const useComplianceAlerts = (equipmentData: Equipment[]) => {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [lastEquipmentUpdate, setLastEquipmentUpdate] = useState<string | null>(null);
  const { addNotification } = useNotificationContext();

  // Load alerts from localStorage on component mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('complianceAlerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
    
    const lastUpdate = localStorage.getItem('lastEquipmentUpdate');
    if (lastUpdate) {
      setLastEquipmentUpdate(lastUpdate);
    }
  }, []);

  // Generate alerts based on equipment data
  useEffect(() => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    const newAlerts: ComplianceAlert[] = [];
    
    const currentEquipmentState = JSON.stringify(equipmentData);
    const previousEquipmentState = localStorage.getItem('equipmentState');
    
    if (previousEquipmentState === currentEquipmentState && alerts.length > 0) {
      return;
    }
    
    localStorage.setItem('equipmentState', currentEquipmentState);
    localStorage.setItem('lastEquipmentUpdate', new Date().toISOString());
    setLastEquipmentUpdate(new Date().toISOString());
    
    const existingAlertsByKey = new Map();
    alerts.forEach(alert => {
      if (alert.status === 'Acknowledged' || alert.status === 'Resolved') {
        const key = `${alert.alertType}-${alert.equipmentId}-${alert.dueDate}`;
        existingAlertsByKey.set(key, alert);
      }
    });
    
    equipmentData.forEach(equipment => {
      // Check maintenance dates
      if (equipment.nextMaintenance) {
        const maintenanceDate = new Date(equipment.nextMaintenance);
        const alertKey = `Maintenance-${equipment.id}-${equipment.nextMaintenance}`;
        const existingAlert = existingAlertsByKey.get(alertKey);
        
        if (existingAlert) {
          newAlerts.push(existingAlert);
        } else if (isPast(maintenanceDate)) {
          const newAlert = {
            id: `maint-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Maintenance' as const,
            dueDate: equipment.nextMaintenance,
            priority: 'Critical' as const,
            status: 'Open' as const,
            description: 'Maintenance overdue',
            createdAt: new Date().toISOString()
          };
          
          newAlerts.push(newAlert);
          
          addNotification(
            'maintenance_overdue',
            'Maintenance Overdue',
            `Maintenance for ${equipment.name} is overdue. It was scheduled for ${maintenanceDate.toLocaleDateString()}.`,
            'critical',
            equipment.id,
            equipment.name,
            `/inventory?equipment=${equipment.id}`,
            false
          );
        } else if (isAfter(thirtyDaysFromNow, maintenanceDate)) {
          const newAlert = {
            id: `maint-soon-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Maintenance' as const,
            dueDate: equipment.nextMaintenance,
            priority: 'High' as const,
            status: 'Open' as const,
            description: 'Maintenance due soon',
            createdAt: new Date().toISOString()
          };
          
          newAlerts.push(newAlert);
          
          if (isAfter(addDays(today, 7), maintenanceDate)) {
            addNotification(
              'maintenance_due',
              'Maintenance Due Soon',
              `Maintenance for ${equipment.name} is due on ${maintenanceDate.toLocaleDateString()}.`,
              'high',
              equipment.id,
              equipment.name,
              `/inventory?equipment=${equipment.id}`,
              false
            );
          }
        }
      }
      
      // Check certification expiry
      if (equipment.certificationRequired && equipment.certificationExpiry) {
        const certExpiryDate = new Date(equipment.certificationExpiry);
        const alertKey = `Certification-${equipment.id}-${equipment.certificationExpiry}`;
        const existingAlert = existingAlertsByKey.get(alertKey);
        
        if (existingAlert) {
          newAlerts.push(existingAlert);
        } else if (isPast(certExpiryDate)) {
          const newAlert = {
            id: `cert-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Certification' as const,
            dueDate: equipment.certificationExpiry,
            priority: 'Critical' as const,
            status: 'Open' as const,
            description: 'Certification expired',
            createdAt: new Date().toISOString()
          };
          
          newAlerts.push(newAlert);
          
          addNotification(
            'certification_expired',
            'Certification Expired',
            `Certification for ${equipment.name} has expired on ${certExpiryDate.toLocaleDateString()}.`,
            'critical',
            equipment.id,
            equipment.name,
            `/inventory?equipment=${equipment.id}`,
            false
          );
        } else if (isAfter(thirtyDaysFromNow, certExpiryDate)) {
          const newAlert = {
            id: `cert-soon-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Certification' as const,
            dueDate: equipment.certificationExpiry,
            priority: 'High' as const,
            status: 'Open' as const,
            description: 'Certification expiring soon',
            createdAt: new Date().toISOString()
          };
          
          newAlerts.push(newAlert);
          
          if (isAfter(addDays(today, 7), certExpiryDate)) {
            addNotification(
              'certification_expiring',
              'Certification Expiring Soon',
              `Certification for ${equipment.name} will expire on ${certExpiryDate.toLocaleDateString()}.`,
              'high',
              equipment.id,
              equipment.name,
              `/inventory?equipment=${equipment.id}`,
              false
            );
          }
        }
      }
      
      // Check inspection dates
      if (equipment.nextInspection) {
        const inspectionDate = new Date(equipment.nextInspection);
        const alertKey = `Inspection-${equipment.id}-${equipment.nextInspection}`;
        const existingAlert = existingAlertsByKey.get(alertKey);
        
        if (existingAlert) {
          newAlerts.push(existingAlert);
        } else if (isPast(inspectionDate)) {
          const newAlert = {
            id: `insp-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Inspection' as const,
            dueDate: equipment.nextInspection,
            priority: 'Critical' as const,
            status: 'Open' as const,
            description: 'Inspection overdue',
            createdAt: new Date().toISOString()
          };
          
          newAlerts.push(newAlert);
          
          addNotification(
            'inspection_overdue',
            'Inspection Overdue',
            `Inspection for ${equipment.name} is overdue. It was scheduled for ${inspectionDate.toLocaleDateString()}.`,
            'high',
            equipment.id,
            equipment.name,
            `/inventory?equipment=${equipment.id}`,
            false
          );
        } else if (isAfter(thirtyDaysFromNow, inspectionDate)) {
          const newAlert = {
            id: `insp-soon-${equipment.id}-${Date.now()}`,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            alertType: 'Inspection' as const,
            dueDate: equipment.nextInspection,
            priority: 'Medium' as const,
            status: 'Open' as const,
            description: 'Inspection due soon',
            createdAt: new Date().toISOString()
          };
          
          newAlerts.push(newAlert);
          
          if (isAfter(addDays(today, 7), inspectionDate)) {
            addNotification(
              'inspection_due',
              'Inspection Due Soon',
              `Inspection for ${equipment.name} is due on ${inspectionDate.toLocaleDateString()}.`,
              'medium',
              equipment.id,
              equipment.name,
              `/inventory?equipment=${equipment.id}`,
              false
            );
          }
        }
      }
    });
    
    setAlerts(newAlerts);
    localStorage.setItem('complianceAlerts', JSON.stringify(newAlerts));
  }, [equipmentData, alerts, addNotification]);

  // Alert acknowledgement function
  const acknowledgeAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          status: 'Acknowledged' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return alert;
    });
    
    setAlerts(updatedAlerts);
    localStorage.setItem('complianceAlerts', JSON.stringify(updatedAlerts));
  };

  // Alert resolution function
  const resolveAlert = (alertId: string) => {
    const alertToResolve = alerts.find(a => a.id === alertId);
    
    if (!alertToResolve) return;
    
    const updatedAlerts = alerts.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          status: 'Resolved' as const,
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return alert;
    });
    
    setAlerts(updatedAlerts);
    localStorage.setItem('complianceAlerts', JSON.stringify(updatedAlerts));
    
    if (alertToResolve) {
      addNotification(
        'general',
        `${alertToResolve.alertType} Alert Resolved`,
        `${alertToResolve.alertType} alert for ${alertToResolve.equipmentName} has been resolved`,
        'low',
        alertToResolve.equipmentId,
        alertToResolve.equipmentName,
        undefined,
        false
      );
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status !== 'Resolved');
  
  return {
    alerts: activeAlerts,
    lastEquipmentUpdate,
    acknowledgeAlert,
    resolveAlert
  };
};
