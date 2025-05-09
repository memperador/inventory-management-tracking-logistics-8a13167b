
import { useState } from 'react';

export type InventoryTabType = 'inventory' | 'procurement' | 'qrcode' | 'gps' | 'analytics' | 'alerts' | 'audit';

export const useInventoryTabs = () => {
  const [activeTab, setActiveTab] = useState<InventoryTabType>('inventory');

  return {
    activeTab,
    setActiveTab
  };
};
