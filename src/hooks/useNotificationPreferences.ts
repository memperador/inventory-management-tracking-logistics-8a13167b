
import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { NotificationType } from '@/components/types/notification';

export type NotificationChannel = 'in-app' | 'email' | 'sms';

export interface NotificationPreference {
  type: NotificationType;
  enabled: boolean;
  channels: NotificationChannel[];
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  { type: 'maintenance_due', enabled: true, channels: ['in-app'] },
  { type: 'maintenance_overdue', enabled: true, channels: ['in-app', 'email'] },
  { type: 'certification_expiring', enabled: true, channels: ['in-app'] },
  { type: 'certification_expired', enabled: true, channels: ['in-app', 'email'] },
  { type: 'inspection_due', enabled: true, channels: ['in-app'] },
  { type: 'inspection_overdue', enabled: true, channels: ['in-app', 'email'] },
  { type: 'status_change', enabled: true, channels: ['in-app'] },
  { type: 'equipment_added', enabled: true, channels: ['in-app'] },
  { type: 'equipment_updated', enabled: true, channels: ['in-app'] },
  { type: 'general', enabled: true, channels: ['in-app'] },
];

export interface NotificationCategory {
  id: string;
  name: string;
  types: NotificationType[];
}

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    id: 'maintenance',
    name: 'Maintenance',
    types: ['maintenance_due', 'maintenance_overdue']
  },
  {
    id: 'certification',
    name: 'Certification',
    types: ['certification_expiring', 'certification_expired']
  },
  {
    id: 'inspection',
    name: 'Inspection',
    types: ['inspection_due', 'inspection_overdue']
  },
  {
    id: 'equipment',
    name: 'Equipment',
    types: ['status_change', 'equipment_added', 'equipment_updated']
  },
  {
    id: 'general',
    name: 'General',
    types: ['general']
  }
];

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage<NotificationPreference[]>(
    'notification_preferences',
    DEFAULT_PREFERENCES
  );

  const updatePreference = (type: NotificationType, updates: Partial<NotificationPreference>) => {
    setPreferences(
      preferences.map(pref => 
        pref.type === type ? { ...pref, ...updates } : pref
      )
    );
  };

  const getPreference = (type: NotificationType): NotificationPreference => {
    const preference = preferences.find(pref => pref.type === type);
    return preference || { type, enabled: true, channels: ['in-app'] };
  };

  const isNotificationEnabled = (type: NotificationType): boolean => {
    return getPreference(type).enabled;
  };

  const getEnabledChannels = (type: NotificationType): NotificationChannel[] => {
    return getPreference(type).channels;
  };

  const toggleNotificationType = (type: NotificationType) => {
    const preference = getPreference(type);
    updatePreference(type, { enabled: !preference.enabled });
  };

  const toggleChannel = (type: NotificationType, channel: NotificationChannel) => {
    const preference = getPreference(type);
    const channels = preference.channels.includes(channel)
      ? preference.channels.filter(ch => ch !== channel)
      : [...preference.channels, channel];
    
    updatePreference(type, { channels });
  };

  const toggleCategoryEnabled = (categoryId: string, enabled: boolean) => {
    const category = NOTIFICATION_CATEGORIES.find(cat => cat.id === categoryId);
    if (category) {
      category.types.forEach(type => {
        updatePreference(type, { enabled });
      });
    }
  };

  const isCategoryEnabled = (categoryId: string): boolean => {
    const category = NOTIFICATION_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) return false;
    
    return category.types.every(type => isNotificationEnabled(type));
  };

  const isCategoryPartiallyEnabled = (categoryId: string): boolean => {
    const category = NOTIFICATION_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) return false;
    
    const enabledTypes = category.types.filter(type => isNotificationEnabled(type));
    return enabledTypes.length > 0 && enabledTypes.length < category.types.length;
  };

  return {
    preferences,
    updatePreference,
    getPreference,
    isNotificationEnabled,
    getEnabledChannels,
    toggleNotificationType,
    toggleChannel,
    toggleCategoryEnabled,
    isCategoryEnabled,
    isCategoryPartiallyEnabled,
    categories: NOTIFICATION_CATEGORIES
  };
};
