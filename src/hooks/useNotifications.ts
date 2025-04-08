
import { useState, useEffect } from 'react';
import { Notification, NotificationType } from '@/components/types/notification';
import { useToast } from '@/hooks/use-toast';
import { Equipment } from '@/components/equipment/types';
import { checkMaintenanceNotifications } from './notifications/maintenanceNotifications';
import { checkCertificationNotifications } from './notifications/certificationNotifications';
import { checkInspectionNotifications } from './notifications/inspectionNotifications';
import { NotificationOptions } from './notifications/notificationTypes';
import { isDuplicateNotification } from './notifications/notificationUtils';
import { useLocalStorage } from './useLocalStorage';

export const useNotifications = () => {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  
  // Set unread count whenever notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Function to create a new notification
  const addNotification = ({
    type,
    title,
    message,
    priority = 'medium',
    equipmentId,
    equipmentName,
    actionUrl,
    showToast = true
  }: NotificationOptions): Notification | null => {
    // Check for duplicate notifications
    if (equipmentId && isDuplicateNotification(notifications, equipmentId, type)) {
      return null;
    }
    
    const newNotification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      equipmentId,
      equipmentName,
      actionUrl,
      priority
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Keep only the latest 100 notifications
    
    if (showToast) {
      toast({
        title: title,
        description: message,
        variant: priority === 'critical' ? 'destructive' : 'default',
      });
    }
    
    return newNotification;
  };

  // Function to mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Function to delete a notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Function to clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Generate notifications for equipment based on maintenance, certification, and inspection status
  const checkEquipmentNotifications = (equipment: Equipment[]) => {
    // Use the extracted utility functions to check each notification type
    checkMaintenanceNotifications({ equipment, addNotification });
    checkCertificationNotifications({ equipment, addNotification });
    checkInspectionNotifications({ equipment, addNotification });
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    checkEquipmentNotifications
  };
};
