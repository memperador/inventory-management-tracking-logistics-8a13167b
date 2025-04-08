
import React from 'react';
import { InventoryTabType } from '@/components/inventory/hooks/useInventoryTabs';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, ActivitySquare, Bell, FileText, ShoppingCart, QrCode, Map } from 'lucide-react';

interface InventoryTabListProps {
  activeTab: InventoryTabType;
  onTabChange: (tab: InventoryTabType) => void;
}

export const InventoryTabList: React.FC<InventoryTabListProps> = ({
  activeTab,
  onTabChange
}) => {
  // Tab configuration with icons and responsive display
  const tabs = [
    { id: 'inventory' as const, label: 'Inventory', icon: <LayoutGrid className="h-4 w-4" /> },
    { id: 'procurement' as const, label: 'Procurement', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'qrcode' as const, label: 'QR Codes', icon: <QrCode className="h-4 w-4" /> },
    { id: 'gps' as const, label: 'GPS Tracker', icon: <Map className="h-4 w-4" /> },
    { id: 'analytics' as const, label: 'Analytics', icon: <ActivitySquare className="h-4 w-4" /> },
    { id: 'alerts' as const, label: 'Alerts', icon: <Bell className="h-4 w-4" /> },
    { id: 'audit' as const, label: 'Audit', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <TabsList className="mb-4">
      {tabs.map(tab => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          className="flex items-center gap-2 flex-shrink-0"
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.id === 'procurement' ? 'Orders' : tab.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
