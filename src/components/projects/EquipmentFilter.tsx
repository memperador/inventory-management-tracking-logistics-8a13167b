
import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { INVENTORY_CATEGORIES } from '@/components/equipment/types';

interface EquipmentFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string | null;
  onCategoryChange: (value: string | null) => void;
}

export const EquipmentFilter: React.FC<EquipmentFilterProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search equipment..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select
        value={categoryFilter || "all"}
        onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {INVENTORY_CATEGORIES.map(category => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EquipmentFilter;
