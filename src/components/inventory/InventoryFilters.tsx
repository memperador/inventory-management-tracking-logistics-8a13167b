
import React from 'react';
import { STATUSES } from './filters/types';
import { SearchBar } from './filters/SearchBar';
import { AdvancedFiltersPopover } from './filters/AdvancedFiltersPopover';
import { FilterBadges } from './filters/FilterBadges';
import { useAdvancedFilters } from './filters/useAdvancedFilters';
import { InventoryFiltersProps } from './filters/types';

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activeStatus,
  onStatusChange,
  advancedFilters = {},
  onAdvancedFilterChange = () => {},
}) => {
  const {
    filters: localAdvancedFilters,
    activeFilterCount,
    handleFilterChange: handleAdvancedFilterChange,
    resetFilters
  } = useAdvancedFilters({
    location: advancedFilters.location || 'All',
    necCode: advancedFilters.necCode || '',
    csiCode: advancedFilters.csiCode || '',
    maintenanceStatus: advancedFilters.maintenanceStatus || 'All',
    minCost: advancedFilters.minCost || '',
    maxCost: advancedFilters.maxCost || '',
  }, onAdvancedFilterChange);
  
  const clearAllFilters = () => {
    resetFilters();
    onCategoryChange('All');
    onStatusChange('All');
    onSearchChange('');
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        <AdvancedFiltersPopover
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
          advancedFilters={localAdvancedFilters}
          onAdvancedFilterChange={handleAdvancedFilterChange}
          statuses={STATUSES}
          activeFilterCount={activeFilterCount}
          clearAllFilters={clearAllFilters}
        />
      </div>
      
      <FilterBadges 
        filters={localAdvancedFilters} 
        onFilterChange={handleAdvancedFilterChange} 
      />
    </div>
  );
};
