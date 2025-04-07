
import { useMemo } from 'react';
import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';
import { equipmentData } from '@/components/equipment/EquipmentData';
import { calculateDepreciation } from '@/utils/depreciationUtils';

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
    
    // Calculate total original cost
    const totalOriginalCost = equipmentData.reduce((sum, eq) => sum + (eq.cost || 0), 0);
    
    // Calculate total depreciated value
    const totalDepreciatedValue = equipmentData.reduce((sum, eq) => sum + calculateDepreciation(eq), 0);
    
    // Calculate depreciation percentage
    const depreciationPercentage = totalOriginalCost > 0 
      ? Math.round(((totalOriginalCost - totalDepreciatedValue) / totalOriginalCost) * 100) 
      : 0;
    
    return {
      maintenanceDue,
      totalEquipment,
      utilizationRate,
      criticalAlerts,
      totalOriginalCost,
      totalDepreciatedValue,
      depreciationPercentage
    };
  }, []);
  
  return stats;
};
