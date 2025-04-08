
import React, { useState } from 'react';
import { InventoryFilters } from './InventoryFilters';
import { InventoryViewSelector, ViewMode } from './InventoryViewSelector';
import { InventoryCategoryTabs } from './InventoryCategoryTabs';
import { EmptyInventoryState } from './EmptyInventoryState';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { EquipmentListView } from '@/components/equipment/EquipmentListView';
import { EquipmentCompactView } from '@/components/equipment/EquipmentCompactView';
import { Equipment, InventoryCategory } from '@/components/equipment/types';
import { AdvancedFiltersType } from './filters/types';

interface InventoryContentProps {
  filteredEquipment: Equipment[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: InventoryCategory | 'All';
  onCategoryChange: (category: InventoryCategory | 'All') => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  advancedFilters: AdvancedFiltersType;
  onAdvancedFilterChange: (filters: AdvancedFiltersType) => void;
  onClearFilters: () => void;
}

export const InventoryContent: React.FC<InventoryContentProps> = ({
  filteredEquipment,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activeStatus,
  onStatusChange,
  advancedFilters,
  onAdvancedFilterChange,
  onClearFilters
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  return (
    <>
      <InventoryFilters 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        activeStatus={activeStatus}
        onStatusChange={onStatusChange}
        advancedFilters={advancedFilters}
        onAdvancedFilterChange={onAdvancedFilterChange}
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <InventoryCategoryTabs 
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
        />
        
        <InventoryViewSelector 
          viewMode={viewMode} 
          onViewModeChange={setViewMode}
        />
      </div>

      {filteredEquipment.length > 0 ? (
        viewMode === 'grid' ? (
          <EquipmentList equipmentData={filteredEquipment} />
        ) : viewMode === 'compact' ? (
          <EquipmentCompactView equipmentData={filteredEquipment} />
        ) : (
          <EquipmentListView equipmentData={filteredEquipment} />
        )
      ) : (
        <EmptyInventoryState onClearFilters={onClearFilters} />
      )}
    </>
  );
};
