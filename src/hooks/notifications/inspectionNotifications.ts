
import { addDays, isPast, isBefore } from 'date-fns';
import { InspectionNotificationConfig } from './notificationTypes';

export const checkInspectionNotifications = ({ equipment, addNotification }: InspectionNotificationConfig) => {
  const today = new Date();
  const fourteenDaysFromNow = addDays(today, 14);
  
  equipment.forEach(item => {
    if (item.nextInspection) {
      const inspectionDate = new Date(item.nextInspection);
      
      // Check if inspection is overdue
      if (isPast(inspectionDate)) {
        addNotification({
          type: 'inspection_overdue',
          title: 'Inspection Overdue',
          message: `Inspection for ${item.name} is overdue. It was scheduled for ${inspectionDate.toLocaleDateString()}.`,
          priority: 'high',
          equipmentId: item.id,
          equipmentName: item.name,
          actionUrl: `/inventory?equipment=${item.id}`
        });
      } 
      // Check if inspection is due within 14 days
      else if (isBefore(inspectionDate, fourteenDaysFromNow) && !isPast(inspectionDate)) {
        addNotification({
          type: 'inspection_due',
          title: 'Inspection Due Soon',
          message: `Inspection for ${item.name} is due on ${inspectionDate.toLocaleDateString()}.`,
          priority: 'medium',
          equipmentId: item.id,
          equipmentName: item.name,
          actionUrl: `/inventory?equipment=${item.id}`
        });
      }
    }
  });
};
