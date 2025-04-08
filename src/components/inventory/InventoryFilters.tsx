
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  InventoryCategory, 
  INVENTORY_CATEGORIES 
} from '@/components/equipment/types';

interface InventoryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeCategory: InventoryCategory | 'All';
  onCategoryChange: (category: InventoryCategory | 'All') => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  advancedFilters?: {
    location?: string;
    necCode?: string;
    csiCode?: string;
    maintenanceStatus?: string;
    minCost?: string; // Changed from number to string
    maxCost?: string; // Changed from number to string
  };
  onAdvancedFilterChange?: (filters: any) => void;
}

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
  const statuses = ['All', 'Operational', 'Maintenance', 'Out of Service', 'Testing', 'Certification Pending'];
  const maintenanceStatuses = ['All', 'Due Soon', 'Overdue', 'Up to Date'];
  const locations = ['All', 'Downtown High-rise', 'Highway Extension', 'Commercial Complex', 'Warehouse Project'];
  
  const [localAdvancedFilters, setLocalAdvancedFilters] = useState({
    location: advancedFilters.location || 'All',
    necCode: advancedFilters.necCode || '',
    csiCode: advancedFilters.csiCode || '',
    maintenanceStatus: advancedFilters.maintenanceStatus || 'All',
    minCost: advancedFilters.minCost || '',
    maxCost: advancedFilters.maxCost || '',
  });
  
  // Track active filters to display as badges
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (key: string, value: any) => {
    const newFilters = { ...localAdvancedFilters, [key]: value };
    setLocalAdvancedFilters(newFilters);
    
    // Count active filters (excluding 'All' selections and empty strings)
    const activeFilters = Object.entries(newFilters).filter(([key, value]) => {
      if (value === 'All' || value === '') return false;
      return true;
    });
    
    setActiveFilterCount(activeFilters.length);
    
    // Pass the updated filters to the parent component
    onAdvancedFilterChange(newFilters);
  };
  
  const clearAllFilters = () => {
    const resetFilters = {
      location: 'All',
      necCode: '',
      csiCode: '',
      maintenanceStatus: 'All',
      minCost: '',
      maxCost: '',
    };
    
    setLocalAdvancedFilters(resetFilters);
    setActiveFilterCount(0);
    onAdvancedFilterChange(resetFilters);
    onCategoryChange('All');
    onStatusChange('All');
    onSearchChange('');
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by name, type, ID, NEC code..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

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
                  value={localAdvancedFilters.location}
                  onValueChange={(value) => handleAdvancedFilterChange('location', value)}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
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
                  value={localAdvancedFilters.necCode}
                  onChange={(e) => handleAdvancedFilterChange('necCode', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="csiCode">CSI Code</Label>
                <Input 
                  id="csiCode" 
                  placeholder="e.g. 33 05 23"
                  value={localAdvancedFilters.csiCode}
                  onChange={(e) => handleAdvancedFilterChange('csiCode', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maintenanceStatus">Maintenance Status</Label>
                <Select
                  value={localAdvancedFilters.maintenanceStatus}
                  onValueChange={(value) => handleAdvancedFilterChange('maintenanceStatus', value)}
                >
                  <SelectTrigger id="maintenanceStatus">
                    <SelectValue placeholder="Select maintenance status" />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenanceStatuses.map((status) => (
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
                    value={localAdvancedFilters.minCost}
                    onChange={(e) => handleAdvancedFilterChange('minCost', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCost">Max Cost ($)</Label>
                  <Input 
                    id="maxCost" 
                    type="number" 
                    placeholder="Max"
                    value={localAdvancedFilters.maxCost}
                    onChange={(e) => handleAdvancedFilterChange('maxCost', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {localAdvancedFilters.location !== 'All' && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Location: {localAdvancedFilters.location}
              <X 
                size={12} 
                className="cursor-pointer" 
                onClick={() => handleAdvancedFilterChange('location', 'All')}
              />
            </Badge>
          )}
          {localAdvancedFilters.necCode && (
            <Badge variant="outline" className="flex gap-1 items-center">
              NEC: {localAdvancedFilters.necCode}
              <X 
                size={12} 
                className="cursor-pointer" 
                onClick={() => handleAdvancedFilterChange('necCode', '')}
              />
            </Badge>
          )}
          {localAdvancedFilters.csiCode && (
            <Badge variant="outline" className="flex gap-1 items-center">
              CSI: {localAdvancedFilters.csiCode}
              <X 
                size={12} 
                className="cursor-pointer" 
                onClick={() => handleAdvancedFilterChange('csiCode', '')}
              />
            </Badge>
          )}
          {localAdvancedFilters.maintenanceStatus !== 'All' && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Maintenance: {localAdvancedFilters.maintenanceStatus}
              <X 
                size={12} 
                className="cursor-pointer" 
                onClick={() => handleAdvancedFilterChange('maintenanceStatus', 'All')}
              />
            </Badge>
          )}
          {(localAdvancedFilters.minCost || localAdvancedFilters.maxCost) && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Cost: {localAdvancedFilters.minCost || '0'}-{localAdvancedFilters.maxCost || '∞'}
              <X 
                size={12} 
                className="cursor-pointer" 
                onClick={() => {
                  handleAdvancedFilterChange('minCost', '');
                  handleAdvancedFilterChange('maxCost', '');
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
