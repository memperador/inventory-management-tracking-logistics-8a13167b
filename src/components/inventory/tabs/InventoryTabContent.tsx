
import React from 'react';
import { InventoryTabView } from '@/components/inventory/inventory-tabs/InventoryTabView';
import { Equipment } from '@/components/equipment/types';
import { AdvancedFiltersType } from '../filters/types';

interface InventoryTabContentProps {
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

export const InventoryMainTabContent: React.FC<InventoryTabContentProps> = ({
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
    <InventoryTabView
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
  );
};
