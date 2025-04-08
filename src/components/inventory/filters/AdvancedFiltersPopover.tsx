
import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdvancedFiltersType, LOCATIONS, MAINTENANCE_STATUSES, FilterChangeHandler } from './types';
import { InventoryCategory, INVENTORY_CATEGORIES } from '@/components/equipment/types';

interface AdvancedFiltersPopoverProps {
  activeCategory: InventoryCategory | 'All';
  onCategoryChange: (category: InventoryCategory | 'All') => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  advancedFilters: AdvancedFiltersType;
  onAdvancedFilterChange: FilterChangeHandler;
  statuses: string[];
  activeFilterCount: number;
  clearAllFilters: () => void;
}

export const AdvancedFiltersPopover: React.FC<AdvancedFiltersPopoverProps> = ({
  activeCategory,
  onCategoryChange,
  activeStatus,
  onStatusChange,
  advancedFilters,
  onAdvancedFilterChange,
  statuses,
  activeFilterCount,
  clearAllFilters
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={18} />
          <span className="hidden sm:inline">Advanced Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Advanced Filters</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-muted-foreground"
              onClick={clearAllFilters}
            >
              <X size={14} className="mr-1" />
              Clear all
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={activeCategory}
              onValueChange={(value) => onCategoryChange(value as InventoryCategory | 'All')}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {INVENTORY_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={activeStatus}
              onValueChange={onStatusChange}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select
              value={advancedFilters.location}
              onValueChange={(value) => onAdvancedFilterChange('location', value)}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="necCode">NEC Code</Label>
            <Input 
              id="necCode" 
              placeholder="e.g. NFPA 70E 130.7"
              value={advancedFilters.necCode}
              onChange={(e) => onAdvancedFilterChange('necCode', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="csiCode">CSI Code</Label>
            <Input 
              id="csiCode" 
              placeholder="e.g. 33 05 23"
              value={advancedFilters.csiCode}
              onChange={(e) => onAdvancedFilterChange('csiCode', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maintenanceStatus">Maintenance Status</Label>
            <Select
              value={advancedFilters.maintenanceStatus}
              onValueChange={(value) => onAdvancedFilterChange('maintenanceStatus', value)}
            >
              <SelectTrigger id="maintenanceStatus">
                <SelectValue placeholder="Select maintenance status" />
              </SelectTrigger>
              <SelectContent>
                {MAINTENANCE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minCost">Min Cost ($)</Label>
              <Input 
                id="minCost" 
                type="number" 
                placeholder="Min"
                value={advancedFilters.minCost}
                onChange={(e) => onAdvancedFilterChange('minCost', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxCost">Max Cost ($)</Label>
              <Input 
                id="maxCost" 
                type="number" 
                placeholder="Max"
                value={advancedFilters.maxCost}
                onChange={(e) => onAdvancedFilterChange('maxCost', e.target.value)}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
