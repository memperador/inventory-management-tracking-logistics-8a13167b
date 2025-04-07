
import { useMemo } from 'react';
import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';
import { equipmentData } from '@/components/equipment/EquipmentData';

export const useEquipmentStats = () => {
  const stats = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    
    // Count equipment due for maintenance in next 30 days
    const maintenanceDue = equipmentData.filter(equipment => {
      if (!equipment.nextMaintenance) return false;
      
      const maintenanceDate = parseISO(equipment.nextMaintenance);
      return isAfter(maintenanceDate, today) && 
             isBefore(maintenanceDate, thirtyDaysFromNow);
    }).length;
    
    // Get total equipment count
    const totalEquipment = equipmentData.length;
    
    // Calculate utilization rate
    const utilizationRate = Math.round(
      (equipmentData.filter(eq => eq.status === 'Operational').length / totalEquipment) * 100
    );
    
    // Count critical alerts
    const criticalAlerts = equipmentData.filter(eq => 
      eq.status === 'Out of Service' || 
      (eq.nextMaintenance && isBefore(parseISO(eq.nextMaintenance), today))
    ).length;
    
    return {
      maintenanceDue,
      totalEquipment,
      utilizationRate,
      criticalAlerts
    };
  }, []);
  
  return stats;
};
