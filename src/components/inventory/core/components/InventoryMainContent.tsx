
import React from 'react';
import { InventoryFeatureControls } from '@/components/inventory/inventory-tabs/InventoryFeatureControls';
import { InventoryTabsContainer } from '@/components/inventory/tabs/InventoryTabsContainer';
import { Equipment, Document as EquipmentDocument } from '@/components/equipment/types';

interface InventoryMainContentProps {
  filteredEquipment: Equipment[];
  equipmentData: Equipment[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: any;
  setActiveCategory: (category: any) => void;
  activeStatus: string;
  setActiveStatus: (status: string) => void;
  advancedFilters: any;
  setAdvancedFilters: (filters: any) => void;
  activeTab: any;
  setActiveTab: (tab: any) => void;
  handleClearFilters: () => void;
  onCheckout: (equipment: Equipment, name: string, returnDate: Date) => void;
  onCheckin: (equipment: Equipment) => void;
  onAddDocument: (equipment: Equipment, document: EquipmentDocument) => void;
  onApplySavedFilter: (filter: any) => void;
  onAddItem: () => void;
  isMobile: boolean;
}

export const InventoryMainContent: React.FC<InventoryMainContentProps> = ({
  filteredEquipment,
  equipmentData,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  activeStatus,
  setActiveStatus,
  advancedFilters,
  setAdvancedFilters,
  activeTab,
  setActiveTab,
  handleClearFilters,
  onCheckout,
  onCheckin,
  onAddDocument,
  onApplySavedFilter,
  onAddItem,
  isMobile
}) => {
  return (
    <>
      <InventoryFeatureControls 
        filteredEquipment={filteredEquipment}
        searchQuery={searchQuery}
        activeCategory={activeCategory}
        activeStatus={activeStatus}
        advancedFilters={advancedFilters}
        onApplyFilter={onApplySavedFilter}
        onCheckout={onCheckout}
        onCheckin={onCheckin}
        onAddDocument={onAddDocument}
        isMobile={isMobile}
      />
      
      <InventoryTabsContainer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredEquipment={filteredEquipment}
        equipmentData={equipmentData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        advancedFilters={advancedFilters}
        onAdvancedFilterChange={setAdvancedFilters}
        onClearFilters={handleClearFilters}
        onAddItem={onAddItem}
        isMobile={isMobile}
      />
    </>
  );
};
