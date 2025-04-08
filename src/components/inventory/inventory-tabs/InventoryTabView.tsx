
import React from 'react';
import { MobileInventoryView } from '@/components/inventory/mobile/MobileInventoryView';
import { InventoryTabContent } from '@/components/inventory/InventoryTabContent';
import { Equipment } from '@/components/equipment/types';
import { AdvancedFiltersType } from '../filters/types';

interface InventoryTabViewProps {
  filteredEquipment: Equipment[];
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

export const InventoryTabView: React.FC<InventoryTabViewProps> = ({
  filteredEquipment,
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
    <>
      {isMobile ? (
        <MobileInventoryView
          equipmentData={filteredEquipment}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
          onClearFilters={onClearFilters}
          onAddItem={onAddItem}
        />
      ) : (
        <InventoryTabContent
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
        />
      )}
    </>
  );
};
