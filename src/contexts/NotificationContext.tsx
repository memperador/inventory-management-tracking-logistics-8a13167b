
import { createContext, ReactNode, useContext } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, NotificationType } from '@/components/types/notification';
import { Equipment } from '@/components/equipment/types';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    priority?: 'low' | 'medium' | 'high' | 'critical',
    equipmentId?: string,
    equipmentName?: string,
    actionUrl?: string,
    showToast?: boolean
  ) => Notification | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  checkEquipmentNotifications: (equipment: Equipment[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const notificationMethods = useNotifications();
  const { isNotificationEnabled } = useNotificationPreferences();
  
  // Wrap the addNotification method to check preferences
  const addNotification = (
    type: NotificationType,
    title: string,
    message: string,
    priority?: 'low' | 'medium' | 'high' | 'critical',
    equipmentId?: string,
    equipmentName?: string,
    actionUrl?: string,
    showToast?: boolean
  ) => {
    // Check if notification type is enabled in preferences
    if (isNotificationEnabled(type)) {
      return notificationMethods.addNotification({
        type,
        title,
        message,
        priority: priority || 'medium',
        equipmentId,
        equipmentName,
        actionUrl,
        showToast
      });
    }
    return null;
  };
  
  return (
    <NotificationContext.Provider value={{
      ...notificationMethods,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  
  return context;
};
