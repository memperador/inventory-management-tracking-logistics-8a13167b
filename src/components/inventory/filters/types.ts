
import { InventoryCategory } from '@/components/equipment/types';

export interface AdvancedFiltersType {
  location: string;
  necCode: string;
  csiCode: string;
  maintenanceStatus: string;
  minCost: string;
  maxCost: string;
}

export interface FilterChangeHandler {
  (key: string, value: any): void;
}

export interface InventoryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeCategory: InventoryCategory | 'All';
  onCategoryChange: (category: InventoryCategory | 'All') => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  advancedFilters?: AdvancedFiltersType;
  onAdvancedFilterChange?: (filters: AdvancedFiltersType) => void;
}

export const STATUSES = ['All', 'Operational', 'Maintenance', 'Out of Service', 'Testing', 'Certification Pending'];
export const MAINTENANCE_STATUSES = ['All', 'Due Soon', 'Overdue', 'Up to Date'];
export const LOCATIONS = ['All', 'Downtown High-rise', 'Highway Extension', 'Commercial Complex', 'Warehouse Project'];
