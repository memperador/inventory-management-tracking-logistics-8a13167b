
import { addDays, isPast, isBefore } from 'date-fns';
import { MaintenanceNotificationConfig } from './notificationTypes';

export const checkMaintenanceNotifications = ({ equipment, addNotification }: MaintenanceNotificationConfig) => {
  const today = new Date();
  const sevenDaysFromNow = addDays(today, 7);
  
  equipment.forEach(item => {
    if (item.nextMaintenance) {
      const maintenanceDate = new Date(item.nextMaintenance);
      
      // Check if maintenance is overdue
      if (isPast(maintenanceDate)) {
        addNotification({
          type: 'maintenance_overdue',
          title: 'Maintenance Overdue',
          message: `Maintenance for ${item.name} is overdue. It was scheduled for ${maintenanceDate.toLocaleDateString()}.`,
          priority: 'high',
          equipmentId: item.id,
          equipmentName: item.name,
          actionUrl: `/inventory?equipment=${item.id}`
        });
      } 
      // Check if maintenance is due within 7 days
      else if (isBefore(maintenanceDate, sevenDaysFromNow) && !isPast(maintenanceDate)) {
        addNotification({
          type: 'maintenance_due',
          title: 'Maintenance Due Soon',
          message: `Maintenance for ${item.name} is due on ${maintenanceDate.toLocaleDateString()}.`,
          priority: 'medium',
          equipmentId: item.id,
          equipmentName: item.name,
          actionUrl: `/inventory?equipment=${item.id}`
        });
      }
    }
  });
};
