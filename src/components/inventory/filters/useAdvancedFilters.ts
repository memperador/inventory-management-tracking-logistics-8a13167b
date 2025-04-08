
import { useState, useCallback } from 'react';
import { AdvancedFiltersType, FilterChangeHandler } from './types';

interface UseAdvancedFiltersReturn {
  filters: AdvancedFiltersType;
  activeFilterCount: number;
  handleFilterChange: FilterChangeHandler;
  resetFilters: (initialFilters?: AdvancedFiltersType) => void;
}

const defaultFilters: AdvancedFiltersType = {
  location: 'All',
  necCode: '',
  csiCode: '',
  maintenanceStatus: 'All',
  minCost: '',
  maxCost: '',
};

export const useAdvancedFilters = (
  initialFilters: AdvancedFiltersType = defaultFilters,
  onFilterChange?: (filters: AdvancedFiltersType) => void
): UseAdvancedFiltersReturn => {
  const [filters, setFilters] = useState<AdvancedFiltersType>(initialFilters);
  const [activeFilterCount, setActiveFilterCount] = useState(countActiveFilters(initialFilters));

  const handleFilterChange: FilterChangeHandler = useCallback((key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    
    // Update active filter count
    const activeFilters = countActiveFilters(updatedFilters);
    setActiveFilterCount(activeFilters);
    
    // Notify parent component
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  }, [filters, onFilterChange]);

  const resetFilters = useCallback((newFilters: AdvancedFiltersType = defaultFilters) => {
    setFilters(newFilters);
    setActiveFilterCount(countActiveFilters(newFilters));
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  }, [onFilterChange]);

  return {
    filters,
    activeFilterCount,
    handleFilterChange,
    resetFilters
  };
};

// Helper function to count active filters
function countActiveFilters(filters: AdvancedFiltersType): number {
  return Object.entries(filters).filter(([key, value]) => {
    if (value === 'All' || value === '') return false;
    return true;
  }).length;
}
