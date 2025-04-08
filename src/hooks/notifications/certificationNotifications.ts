
import { addDays, isPast, isBefore } from 'date-fns';
import { CertificationNotificationConfig } from './notificationTypes';

export const checkCertificationNotifications = ({ equipment, addNotification }: CertificationNotificationConfig) => {
  const today = new Date();
  const thirtyDaysFromNow = addDays(today, 30);
  
  equipment.forEach(item => {
    if (item.certificationRequired && item.certificationExpiry) {
      const expiryDate = new Date(item.certificationExpiry);
      
      // Check if certification is expired
      if (isPast(expiryDate)) {
        addNotification({
          type: 'certification_expired',
          title: 'Certification Expired',
          message: `Certification for ${item.name} has expired on ${expiryDate.toLocaleDateString()}.`,
          priority: 'critical',
          equipmentId: item.id,
          equipmentName: item.name,
          actionUrl: `/inventory?equipment=${item.id}`
        });
      } 
      // Check if certification is expiring within 30 days
      else if (isBefore(expiryDate, thirtyDaysFromNow) && !isPast(expiryDate)) {
        addNotification({
          type: 'certification_expiring',
          title: 'Certification Expiring Soon',
          message: `Certification for ${item.name} will expire on ${expiryDate.toLocaleDateString()}.`,
          priority: 'high',
          equipmentId: item.id,
          equipmentName: item.name,
          actionUrl: `/inventory?equipment=${item.id}`
        });
      }
    }
  });
};
