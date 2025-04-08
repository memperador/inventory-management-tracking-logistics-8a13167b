
import { NotificationType } from '@/components/types/notification';
import { Equipment } from '@/components/equipment/types';

export interface NotificationOptions {
  type: NotificationType;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  equipmentId?: string;
  equipmentName?: string;
  actionUrl?: string;
  showToast?: boolean;
}

export interface MaintenanceNotificationConfig {
  equipment: Equipment[];
  addNotification: (options: NotificationOptions) => void;
}

export interface CertificationNotificationConfig {
  equipment: Equipment[];
  addNotification: (options: NotificationOptions) => void;
}

export interface InspectionNotificationConfig {
  equipment: Equipment[];
  addNotification: (options: NotificationOptions) => void;
}
