
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { InventoryTabList } from '@/components/inventory/inventory-tabs/InventoryTabList';
import { InventoryTabType } from '@/components/inventory/hooks/useInventoryTabs';
import { Equipment } from '@/components/equipment/types';
import { AdvancedFiltersType } from '../filters/types';
import { InventoryMainTabContent } from './InventoryTabContent';
import { ProcurementTabContent } from './ProcurementTabContent';
import { QRCodeTabContent } from './QRCodeTabContent';
import { GPSTabContent } from './GPSTabContent';
import { AnalyticsTabContent } from './AnalyticsTabContent';
import { AlertsTabContent } from './AlertsTabContent';
import { AuditTabContent } from './AuditTabContent';

interface InventoryTabsContainerProps {
  activeTab: InventoryTabType;
  setActiveTab: (tab: InventoryTabType) => void;
  filteredEquipment: Equipment[];
  equipmentData: Equipment[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: any;
  onCategoryChange: (category: any) => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  advancedFilters: AdvancedFiltersType;
  onAdvancedFilterChange: (filters: AdvancedFiltersType) => void;
  onClearFilters: () => void;
  onAddItem: () => void;
  isMobile: boolean;
}

export const InventoryTabsContainer: React.FC<InventoryTabsContainerProps> = ({
  activeTab, 
  setActiveTab,
  filteredEquipment,
  equipmentData,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activeStatus,
  onStatusChange,
  advancedFilters,
  onAdvancedFilterChange,
  onClearFilters,
  onAddItem,
  isMobile
}) => {
  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InventoryTabType)}>
      <InventoryTabList activeTab={activeTab} onTabChange={setActiveTab} />
      
      <TabsContent value="inventory">
        <InventoryMainTabContent
          filteredEquipment={filteredEquipment}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
          advancedFilters={advancedFilters}
          onAdvancedFilterChange={onAdvancedFilterChange}
          onClearFilters={onClearFilters}
          onAddItem={onAddItem}
          isMobile={isMobile}
        />
      </TabsContent>
      
      <TabsContent value="procurement">
        <ProcurementTabContent equipmentData={equipmentData} />
      </TabsContent>
      
      <TabsContent value="qrcode">
        <QRCodeTabContent filteredEquipment={filteredEquipment} />
      </TabsContent>
      
      <TabsContent value="gps">
        <GPSTabContent />
      </TabsContent>
      
      <TabsContent value="analytics">
        <AnalyticsTabContent equipmentData={equipmentData} />
      </TabsContent>
      
      <TabsContent value="alerts">
        <AlertsTabContent equipmentData={equipmentData} />
      </TabsContent>
      
      <TabsContent value="audit">
        <AuditTabContent equipmentData={equipmentData} />
      </TabsContent>
    </Tabs>
  );
};
