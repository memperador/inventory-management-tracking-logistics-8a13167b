
export type NotificationType = 
  | 'maintenance_due' 
  | 'maintenance_overdue' 
  | 'certification_expiring' 
  | 'certification_expired' 
  | 'inspection_due'
  | 'inspection_overdue'
  | 'status_change'
  | 'equipment_added'
  | 'equipment_updated'
  | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  equipmentId?: string;
  equipmentName?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}
