
import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AdvancedFiltersType } from './types';

interface FilterBadgesProps {
  filters: AdvancedFiltersType;
  onFilterChange: (key: string, value: any) => void;
}

export const FilterBadges: React.FC<FilterBadgesProps> = ({
  filters,
  onFilterChange
}) => {
  if (!hasActiveFilters(filters)) return null;
  
  return (
    <div className="flex flex-wrap gap-2">
      {filters.location !== 'All' && (
        <Badge variant="outline" className="flex gap-1 items-center">
          Location: {filters.location}
          <X 
            size={12} 
            className="cursor-pointer" 
            onClick={() => onFilterChange('location', 'All')}
          />
        </Badge>
      )}
      {filters.necCode && (
        <Badge variant="outline" className="flex gap-1 items-center">
          NEC: {filters.necCode}
          <X 
            size={12} 
            className="cursor-pointer" 
            onClick={() => onFilterChange('necCode', '')}
          />
        </Badge>
      )}
      {filters.csiCode && (
        <Badge variant="outline" className="flex gap-1 items-center">
          CSI: {filters.csiCode}
          <X 
            size={12} 
            className="cursor-pointer" 
            onClick={() => onFilterChange('csiCode', '')}
          />
        </Badge>
      )}
      {filters.maintenanceStatus !== 'All' && (
        <Badge variant="outline" className="flex gap-1 items-center">
          Maintenance: {filters.maintenanceStatus}
          <X 
            size={12} 
            className="cursor-pointer" 
            onClick={() => onFilterChange('maintenanceStatus', 'All')}
          />
        </Badge>
      )}
      {(filters.minCost || filters.maxCost) && (
        <Badge variant="outline" className="flex gap-1 items-center">
          Cost: {filters.minCost || '0'}-{filters.maxCost || '∞'}
          <X 
            size={12} 
            className="cursor-pointer" 
            onClick={() => {
              onFilterChange('minCost', '');
              onFilterChange('maxCost', '');
            }}
          />
        </Badge>
      )}
    </div>
  );
};

// Helper function to check if any filters are active
function hasActiveFilters(filters: AdvancedFiltersType): boolean {
  return (
    filters.location !== 'All' ||
    !!filters.necCode ||
    !!filters.csiCode ||
    filters.maintenanceStatus !== 'All' ||
    !!filters.minCost ||
    !!filters.maxCost
  );
}
