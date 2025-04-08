
import React from 'react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import NotificationList from './NotificationList';
import { getNotificationIcon, getNotificationColor } from './notificationUtils';
import { NotificationFilterBar } from './NotificationFilterBar';
import { NotificationControls } from './NotificationControls';
import { useNotificationFilters } from '@/hooks/notifications/useNotificationFilters';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotificationContext();
  const { 
    activeTab, 
    setActiveTab, 
    activeTypeFilter, 
    setActiveTypeFilter, 
    filteredNotifications 
  } = useNotificationFilters({ notifications });
  
  const handleReadClick = (id: string) => {
    markAsRead(id);
  };

  const handleDeleteClick = (id: string) => {
    deleteNotification(id);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <NotificationControls 
          unreadCount={notifications.filter(n => !n.read).length}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAllNotifications}
          notificationsCount={notifications.length}
        />

        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')} className="w-full">
          <div className="px-4 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
            </TabsList>
          </div>

          <NotificationFilterBar 
            activeTypeFilter={activeTypeFilter}
            setActiveTypeFilter={setActiveTypeFilter}
          />

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
