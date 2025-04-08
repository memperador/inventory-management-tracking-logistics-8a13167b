
import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Bell, CheckCheck, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationType } from '@/components/types/notification';
import { cn } from '@/lib/utils';

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

export default NotificationsList;
