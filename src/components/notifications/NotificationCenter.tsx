
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, CheckCheck, Trash2, Bell, AlertCircle, Calendar, Certificate, Tool, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { NotificationType } from '@/components/types/notification';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotificationContext();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | NotificationType>('all');
  
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.read) {
      return false;
    }
    
    if (activeTypeFilter !== 'all' && notification.type !== activeTypeFilter) {
      return false;
    }
    
    return true;
  });

  const handleReadClick = (id: string) => {
    markAsRead(id);
  };

  const handleDeleteClick = (id: string) => {
    deleteNotification(id);
  };
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'maintenance_due':
      case 'maintenance_overdue':
        return <Tool className="h-4 w-4" />;
      case 'certification_expiring':
      case 'certification_expired':
        return <Certificate className="h-4 w-4" />;
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle>Notifications</SheetTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead} 
                disabled={notifications.filter(n => !n.read).length === 0}
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only">Mark all read</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
                title="Clear all notifications"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only">Clear all</span>
              </Button>
            </div>
          </div>
          <SheetDescription className="text-sm text-muted-foreground">
            You have {notifications.filter(n => !n.read).length} unread notifications
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')} className="w-full">
          <div className="px-4 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex gap-1 p-2 overflow-x-auto border-b">
            <Badge 
              variant={activeTypeFilter === 'all' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setActiveTypeFilter('all')}
            >
              All
            </Badge>
            <Badge 
              variant={activeTypeFilter === 'maintenance_due' || activeTypeFilter === 'maintenance_overdue' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setActiveTypeFilter(
                activeTypeFilter === 'maintenance_due' || activeTypeFilter === 'maintenance_overdue' 
                  ? 'all' 
                  : 'maintenance_due'
              )}
            >
              <Tool className="h-3 w-3 mr-1" />
              Maintenance
            </Badge>
            <Badge 
              variant={activeTypeFilter === 'certification_expired' || activeTypeFilter === 'certification_expiring' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setActiveTypeFilter(
                activeTypeFilter === 'certification_expired' || activeTypeFilter === 'certification_expiring' 
                  ? 'all' 
                  : 'certification_expired'
              )}
            >
              <Certificate className="h-3 w-3 mr-1" />
              Certification
            </Badge>
            <Badge 
              variant={activeTypeFilter === 'inspection_due' || activeTypeFilter === 'inspection_overdue' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setActiveTypeFilter(
                activeTypeFilter === 'inspection_due' || activeTypeFilter === 'inspection_overdue' 
                  ? 'all' 
                  : 'inspection_due'
              )}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Inspection
            </Badge>
          </div>

          <TabsContent value="all" className="mt-0 p-0">
            <NotificationList 
              notifications={filteredNotifications} 
              onReadClick={handleReadClick}
              onDeleteClick={handleDeleteClick}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
            />
          </TabsContent>
          
          <TabsContent value="unread" className="mt-0 p-0">
            <NotificationList 
              notifications={filteredNotifications} 
              onReadClick={handleReadClick}
              onDeleteClick={handleDeleteClick}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

interface NotificationListProps {
  notifications: Array<any>;
  onReadClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
  getNotificationIcon: (type: NotificationType) => JSX.Element;
  getNotificationColor: (priority: string) => string;
}

const NotificationList = ({ 
  notifications, 
  onReadClick, 
  onDeleteClick,
  getNotificationIcon,
  getNotificationColor
}: NotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <Bell className="h-12 w-12 text-gray-300 mb-2" />
        <p className="text-muted-foreground">No notifications to display</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="p-2 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-3 rounded-md border flex flex-col",
              getNotificationColor(notification.priority),
              !notification.read && "font-medium",
              notification.read && "opacity-80"
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{notification.title}</div>
                  <p className="text-sm">{notification.message}</p>
                  {notification.actionUrl && (
                    <a 
                      href={notification.actionUrl} 
                      className="text-xs flex items-center text-blue-600 hover:text-blue-800 mt-1"
                    >
                      View details
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {!notification.read && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => onReadClick(notification.id)}
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => onDeleteClick(notification.id)}
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
