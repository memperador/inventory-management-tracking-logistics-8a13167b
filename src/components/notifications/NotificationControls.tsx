
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck, Trash2 } from 'lucide-react';
import { SheetTitle, SheetDescription } from '@/components/ui/sheet';

interface NotificationControlsProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  notificationsCount: number;
}

export const NotificationControls: React.FC<NotificationControlsProps> = ({
  unreadCount,
  onMarkAllAsRead,
  onClearAll,
  notificationsCount
}) => {
  return (
    <div className="p-4 border-b">
      <div className="flex justify-between items-center">
        <SheetTitle>Notifications</SheetTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onMarkAllAsRead} 
            disabled={unreadCount === 0}
            title="Mark all as read"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            <span className="sr-only sm:not-sr-only">Mark all read</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearAll}
            disabled={notificationsCount === 0}
            title="Clear all notifications"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="sr-only sm:not-sr-only">Clear all</span>
          </Button>
        </div>
      </div>
      <SheetDescription className="text-sm text-muted-foreground">
        You have {unreadCount} unread notifications
      </SheetDescription>
    </div>
  );
};
