
import { useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { CheckCheck, Trash2 } from 'lucide-react';
import NotificationsTabs from '@/components/notifications/NotificationsTabs';

const NotificationsPage = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    unreadCount
  } = useNotificationContext();
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader 
        title="Notifications"
        description="Manage your notifications and alerts"
        actions={
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          </div>
        }
      />

      <NotificationsTabs 
        notifications={notifications}
        markAsRead={markAsRead}
        deleteNotification={deleteNotification}
      />
    </div>
  );
};

export default NotificationsPage;
