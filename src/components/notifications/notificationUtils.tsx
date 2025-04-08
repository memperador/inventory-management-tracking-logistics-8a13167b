
import { Bell, AlertCircle, Calendar, FileText, Wrench } from 'lucide-react';
import { NotificationType } from '@/components/types/notification';

export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'maintenance_due':
    case 'maintenance_overdue':
      return <Wrench className="h-4 w-4" />;
    case 'certification_expiring':
    case 'certification_expired':
      return <FileText className="h-4 w-4" />;
    case 'inspection_due':
    case 'inspection_overdue':
      return <Calendar className="h-4 w-4" />;
    case 'status_change':
      return <AlertCircle className="h-4 w-4" />;
    case 'equipment_added':
    case 'equipment_updated':
      return <Bell className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export const getNotificationColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    case 'high':
      return 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    case 'low':
      return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    default:
      return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  }
};
