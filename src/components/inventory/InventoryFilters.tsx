
import React from 'react';
import { Search, Filter } from 'lucide-react';
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
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activeStatus,
  onStatusChange,
}) => {
  const statuses = ['All', 'Operational', 'Maintenance', 'Out of Service', 'Testing', 'Certification Pending'];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search by name, type, ID or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={18} />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
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
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                onCategoryChange('All');
                onStatusChange('All');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
