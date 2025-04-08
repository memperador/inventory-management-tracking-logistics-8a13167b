
import { useState, useEffect } from 'react';
import { Notification, NotificationType } from '@/components/types/notification';
import { useToast } from '@/hooks/use-toast';
import { Equipment } from '@/components/equipment/types';
import { addDays, isPast, isBefore } from 'date-fns';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  
  // Load notifications from localStorage on component mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications) as Notification[];
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter(n => !n.read).length);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Function to create a new notification
  const addNotification = (
    type: NotificationType,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    equipmentId?: string,
    equipmentName?: string,
    actionUrl?: string,
    showToast: boolean = true
  ) => {
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
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    const sevenDaysFromNow = addDays(today, 7);
    
    equipment.forEach(item => {
      // Check for maintenance due dates
      if (item.nextMaintenance) {
        const maintenanceDate = new Date(item.nextMaintenance);
        
        // Check if maintenance is overdue
        if (isPast(maintenanceDate) && !notifications.some(n => 
          n.equipmentId === item.id && 
          n.type === 'maintenance_overdue' && 
          new Date(n.timestamp) > addDays(today, -1) // Don't create duplicate notifications within 24h
        )) {
          addNotification(
            'maintenance_overdue',
            'Maintenance Overdue',
            `Maintenance for ${item.name} is overdue. It was scheduled for ${maintenanceDate.toLocaleDateString()}.`,
            'high',
            item.id,
            item.name,
            `/inventory?equipment=${item.id}`
          );
        } 
        // Check if maintenance is due within 7 days
        else if (isBefore(maintenanceDate, sevenDaysFromNow) && !isPast(maintenanceDate) && !notifications.some(n => 
          n.equipmentId === item.id && 
          n.type === 'maintenance_due' && 
          new Date(n.timestamp) > addDays(today, -1)
        )) {
          addNotification(
            'maintenance_due',
            'Maintenance Due Soon',
            `Maintenance for ${item.name} is due on ${maintenanceDate.toLocaleDateString()}.`,
            'medium',
            item.id,
            item.name,
            `/inventory?equipment=${item.id}`
          );
        }
      }
      
      // Check for certification expiry
      if (item.certificationRequired && item.certificationExpiry) {
        const expiryDate = new Date(item.certificationExpiry);
        
        // Check if certification is expired
        if (isPast(expiryDate) && !notifications.some(n => 
          n.equipmentId === item.id && 
          n.type === 'certification_expired' && 
          new Date(n.timestamp) > addDays(today, -1)
        )) {
          addNotification(
            'certification_expired',
            'Certification Expired',
            `Certification for ${item.name} has expired on ${expiryDate.toLocaleDateString()}.`,
            'critical',
            item.id,
            item.name,
            `/inventory?equipment=${item.id}`
          );
        } 
        // Check if certification is expiring within 30 days
        else if (isBefore(expiryDate, thirtyDaysFromNow) && !isPast(expiryDate) && !notifications.some(n => 
          n.equipmentId === item.id && 
          n.type === 'certification_expiring' && 
          new Date(n.timestamp) > addDays(today, -3)
        )) {
          addNotification(
            'certification_expiring',
            'Certification Expiring Soon',
            `Certification for ${item.name} will expire on ${expiryDate.toLocaleDateString()}.`,
            'high',
            item.id,
            item.name,
            `/inventory?equipment=${item.id}`
          );
        }
      }
      
      // Check for inspection due dates
      if (item.nextInspection) {
        const inspectionDate = new Date(item.nextInspection);
        
        // Check if inspection is overdue
        if (isPast(inspectionDate) && !notifications.some(n => 
          n.equipmentId === item.id && 
          n.type === 'inspection_overdue' && 
          new Date(n.timestamp) > addDays(today, -1)
        )) {
          addNotification(
            'inspection_overdue',
            'Inspection Overdue',
            `Inspection for ${item.name} is overdue. It was scheduled for ${inspectionDate.toLocaleDateString()}.`,
            'high',
            item.id,
            item.name,
            `/inventory?equipment=${item.id}`
          );
        } 
        // Check if inspection is due within 14 days
        else if (isBefore(inspectionDate, addDays(today, 14)) && !isPast(inspectionDate) && !notifications.some(n => 
          n.equipmentId === item.id && 
          n.type === 'inspection_due' && 
          new Date(n.timestamp) > addDays(today, -3)
        )) {
          addNotification(
            'inspection_due',
            'Inspection Due Soon',
            `Inspection for ${item.name} is due on ${inspectionDate.toLocaleDateString()}.`,
            'medium',
            item.id,
            item.name,
            `/inventory?equipment=${item.id}`
          );
        }
      }
    });
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
