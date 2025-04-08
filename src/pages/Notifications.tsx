
import { useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { CheckCheck, Trash2, Bell, Settings } from 'lucide-react';
import NotificationsTabs from '@/components/notifications/NotificationsTabs';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

      <Tabs defaultValue="list">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications List
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <NotificationsTabs 
            notifications={notifications}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
          />
        </TabsContent>
        
        <TabsContent value="preferences">
          <NotificationPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
