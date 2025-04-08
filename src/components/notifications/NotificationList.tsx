
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { NotificationType } from '@/components/types/notification';

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

export default NotificationList;
