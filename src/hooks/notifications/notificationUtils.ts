
import { Notification } from '@/components/types/notification';
import { addDays } from 'date-fns';

export const isDuplicateNotification = (
  notifications: Notification[],
  equipmentId: string | undefined,
  type: string,
  timeWindow: number = 1 // Default to 1 day
): boolean => {
  const today = new Date();
  
  return notifications.some(n => 
    n.equipmentId === equipmentId && 
    n.type === type && 
    new Date(n.timestamp) > addDays(today, -timeWindow)
  );
};
