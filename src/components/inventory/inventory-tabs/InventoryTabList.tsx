
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryTabType } from '../hooks/useInventoryTabs';
import { LayoutGrid, ShoppingCart, LineChart, Bell, FileText } from 'lucide-react';

interface InventoryTabListProps {
  activeTab: InventoryTabType;
  onTabChange: (value: InventoryTabType) => void;
}

export const InventoryTabList: React.FC<InventoryTabListProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <TabsList className="w-full mb-4 flex-wrap overflow-x-auto">
      <TabsTrigger 
        value="inventory" 
        onClick={() => onTabChange('inventory')}
        className="flex items-center gap-1"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Inventory</span>
      </TabsTrigger>
      <TabsTrigger 
        value="procurement" 
        onClick={() => onTabChange('procurement')}
        className="flex items-center gap-1"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden sm:inline">Procurement</span>
      </TabsTrigger>
      <TabsTrigger 
        value="analytics" 
        onClick={() => onTabChange('analytics')}
        className="flex items-center gap-1"
      >
        <LineChart className="h-4 w-4" />
        <span className="hidden sm:inline">Analytics</span>
      </TabsTrigger>
      <TabsTrigger 
        value="alerts" 
        onClick={() => onTabChange('alerts')}
        className="flex items-center gap-1"
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Alerts & Notifications</span>
      </TabsTrigger>
      <TabsTrigger 
        value="audit" 
        onClick={() => onTabChange('audit')}
        className="flex items-center gap-1"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Audit Logs</span>
      </TabsTrigger>
    </TabsList>
  );
};
