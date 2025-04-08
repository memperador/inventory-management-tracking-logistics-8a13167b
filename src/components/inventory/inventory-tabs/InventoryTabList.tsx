
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryTabType } from '../hooks/useInventoryTabs';

interface InventoryTabListProps {
  activeTab: InventoryTabType;
  onTabChange: (value: InventoryTabType) => void;
}

export const InventoryTabList: React.FC<InventoryTabListProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <TabsList className="w-full mb-4">
      <TabsTrigger 
        value="inventory" 
        onClick={() => onTabChange('inventory')}
      >
        Inventory
      </TabsTrigger>
      <TabsTrigger 
        value="procurement" 
        onClick={() => onTabChange('procurement')}
      >
        Procurement
      </TabsTrigger>
      <TabsTrigger 
        value="analytics" 
        onClick={() => onTabChange('analytics')}
      >
        Analytics
      </TabsTrigger>
      <TabsTrigger 
        value="alerts" 
        onClick={() => onTabChange('alerts')}
      >
        Alerts & Notifications
      </TabsTrigger>
      <TabsTrigger 
        value="audit" 
        onClick={() => onTabChange('audit')}
      >
        Audit Logs
      </TabsTrigger>
    </TabsList>
  );
};
