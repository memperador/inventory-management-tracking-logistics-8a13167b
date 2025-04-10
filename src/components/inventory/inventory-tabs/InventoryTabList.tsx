
import React from 'react';
import { InventoryTabType } from '@/components/inventory/hooks/useInventoryTabs';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, ShoppingCart, QrCode, Map, ActivitySquare, Bell, FileText } from 'lucide-react';

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
    { id: 'procurement' as const, label: 'Orders', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'qrcode' as const, label: 'QR Codes', icon: <QrCode className="h-4 w-4" /> },
    { id: 'gps' as const, label: 'GPS', icon: <Map className="h-4 w-4" /> },
    { id: 'analytics' as const, label: 'Analytics', icon: <ActivitySquare className="h-4 w-4" /> },
    { id: 'alerts' as const, label: 'Alerts', icon: <Bell className="h-4 w-4" /> },
    { id: 'audit' as const, label: 'Audit', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="mb-6 sticky top-0 z-10">
      <div className="bg-white rounded-md shadow border border-slate-200 overflow-hidden">
        <TabsList className="w-full flex-nowrap justify-start px-1 py-2 bg-gradient-to-r from-slate-50 to-white">
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5 flex-shrink-0 px-4 py-2 font-medium"
              onClick={() => onTabChange(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </div>
  );
};
