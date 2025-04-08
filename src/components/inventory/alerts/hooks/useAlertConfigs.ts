
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InventoryAlertConfig } from '../types';

export const useAlertConfigs = () => {
  const [alertConfigs, setAlertConfigs] = useState<InventoryAlertConfig[]>([
    { 
      inventoryLevel: 5,
      emailEnabled: true,
      pushEnabled: true,
      type: 'low-inventory',
      name: 'Low Inventory Alert'
    },
    { 
      inventoryLevel: 14, // days
      emailEnabled: true,
      pushEnabled: true,
      type: 'maintenance-due',
      name: 'Maintenance Due Alert'
    },
    { 
      inventoryLevel: 30, // days
      emailEnabled: true,
      pushEnabled: true,
      type: 'certification-expiring',
      name: 'Certification Expiring Alert'
    }
  ]);
  
  const { toast } = useToast();

  // Function to toggle alert notification channels
  const toggleAlertChannel = (index: number, channel: 'emailEnabled' | 'pushEnabled') => {
    const newConfigs = [...alertConfigs];
    newConfigs[index][channel] = !newConfigs[index][channel];
    setAlertConfigs(newConfigs);
    
    toast({
      title: "Alert Setting Updated",
      description: `${channel === 'emailEnabled' ? 'Email' : 'Push'} notifications ${newConfigs[index][channel] ? 'enabled' : 'disabled'} for ${newConfigs[index].name}`,
    });
  };

  // Update inventory level threshold
  const updateInventoryLevel = (index: number, value: number) => {
    const newConfigs = [...alertConfigs];
    newConfigs[index].inventoryLevel = value;
    setAlertConfigs(newConfigs);
  };

  return {
    alertConfigs,
    toggleAlertChannel,
    updateInventoryLevel
  };
};
