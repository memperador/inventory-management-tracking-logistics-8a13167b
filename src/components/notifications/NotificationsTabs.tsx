
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import NotificationsList from './NotificationsList';
import { getNotificationIcon, getNotificationColor } from './notificationUtils';
import { NotificationType } from '@/components/types/notification';

interface NotificationsTabsProps {
  notifications: Array<any>;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
}

const NotificationsTabs: React.FC<NotificationsTabsProps> = ({
  notifications,
  markAsRead,
  deleteNotification
}) => {
  return (
    <Card>
      <CardHeader className="pb-0">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">Unread ({notifications.filter(n => !n.read).length})</TabsTrigger>
            <TabsTrigger value="maintenance" className="flex-1">Maintenance</TabsTrigger>
            <TabsTrigger value="certification" className="flex-1">Certification</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-6">
        <TabsContent value="all" className="m-0">
          <NotificationsList 
            notifications={notifications}
            getNotificationIcon={getNotificationIcon}
            getNotificationColor={getNotificationColor}
            onReadClick={markAsRead}
            onDeleteClick={deleteNotification}
          />
        </TabsContent>

        <TabsContent value="unread" className="m-0">
          <NotificationsList 
            notifications={notifications.filter(n => !n.read)}
            getNotificationIcon={getNotificationIcon}
            getNotificationColor={getNotificationColor}
            onReadClick={markAsRead}
            onDeleteClick={deleteNotification}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="m-0">
          <NotificationsList 
            notifications={notifications.filter(n => 
              n.type === 'maintenance_due' || n.type === 'maintenance_overdue'
            )}
            getNotificationIcon={getNotificationIcon}
            getNotificationColor={getNotificationColor}
            onReadClick={markAsRead}
            onDeleteClick={deleteNotification}
          />
        </TabsContent>

        <TabsContent value="certification" className="m-0">
          <NotificationsList 
            notifications={notifications.filter(n => 
              n.type === 'certification_expired' || n.type === 'certification_expiring'
            )}
            getNotificationIcon={getNotificationIcon}
            getNotificationColor={getNotificationColor}
            onReadClick={markAsRead}
            onDeleteClick={deleteNotification}
          />
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default NotificationsTabs;
