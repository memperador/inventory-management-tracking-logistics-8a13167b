
import { useEffect } from 'react';
import PageTitle from '@/components/common/PageTitle';
import PageHeader from '@/components/common/PageHeader';
import PageDescription from '@/components/common/PageDescription';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCheck, Trash2, Clock, AlertCircle, Calendar, FileText, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationType } from '@/components/types/notification';
import { cn } from '@/lib/utils';

const NotificationsPage = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    unreadCount
  } = useNotificationContext();
  
  const getNotificationIcon = (type: NotificationType) => {
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
  
  const getNotificationColor = (priority: string) => {
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader>
        <div className="flex items-center justify-between">
          <PageTitle>Notifications</PageTitle>
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
        </div>
        <PageDescription>
          Manage your notifications and alerts
        </PageDescription>
      </PageHeader>

      <Card>
        <CardHeader className="pb-0">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">Unread ({unreadCount})</TabsTrigger>
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
    </div>
  );
};

interface NotificationsListProps {
  notifications: Array<any>;
  onReadClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
  getNotificationIcon: (type: NotificationType) => JSX.Element;
  getNotificationColor: (priority: string) => string;
}

const NotificationsList = ({ 
  notifications, 
  onReadClick, 
  onDeleteClick,
  getNotificationIcon,
  getNotificationColor
}: NotificationsListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-gray-300 mb-2" />
        <p className="text-muted-foreground">No notifications to display</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-3 rounded-md border flex",
              getNotificationColor(notification.priority),
              !notification.read && "font-medium",
              notification.read && "opacity-75"
            )}
          >
            <div className="flex items-start gap-3 w-full">
              <div className="mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm mt-1">{notification.message}</p>
                    {notification.actionUrl && (
                      <a 
                        href={notification.actionUrl} 
                        className="text-xs flex items-center text-blue-600 hover:text-blue-800 mt-2"
                      >
                        View details
                      </a>
                    )}
                    <div className="text-xs text-gray-500 mt-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(parseISO(notification.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onReadClick(notification.id)}
                        title="Mark as read"
                      >
                        <CheckCheck className="h-4 w-4" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onDeleteClick(notification.id)}
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationsPage;
