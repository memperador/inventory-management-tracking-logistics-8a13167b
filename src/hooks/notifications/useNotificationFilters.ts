
import { useState } from 'react';
import { NotificationType } from '@/components/types/notification';

interface UseNotificationFiltersProps {
  notifications: Array<any>;
}

export const useNotificationFilters = ({ notifications }: UseNotificationFiltersProps) => {
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

  return {
    activeTab,
    setActiveTab,
    activeTypeFilter,
    setActiveTypeFilter,
    filteredNotifications
  };
};
