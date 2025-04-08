
import { useState } from 'react';
import { Equipment, InventoryCategory } from '@/components/equipment/types';
import { AdvancedFiltersType } from '../filters/types';

interface UseInventoryFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: InventoryCategory | 'All';
  setActiveCategory: (category: InventoryCategory | 'All') => void;
  activeStatus: string;
  setActiveStatus: (status: string) => void;
  advancedFilters: AdvancedFiltersType;
  setAdvancedFilters: (filters: AdvancedFiltersType) => void;
  filterEquipment: (equipmentData: Equipment[]) => Equipment[];
  handleClearFilters: () => void;
}

export const useInventoryFilters = (
  onClearFilters?: () => void
): UseInventoryFiltersReturn => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'All'>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [advancedFilters, setAdvancedFilters] = useState({
    location: 'All',
    necCode: '',
    csiCode: '',
    maintenanceStatus: 'All',
    minCost: '',
    maxCost: '',
  });

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveStatus('All');
    setAdvancedFilters({
      location: 'All',
      necCode: '',
      csiCode: '',
      maintenanceStatus: 'All',
      minCost: '',
      maxCost: '',
    });
    
    if (onClearFilters) {
      onClearFilters();
    }
  };

  // Filter equipment based on all criteria
  const filterEquipment = (equipmentData: Equipment[]): Equipment[] => {
    return equipmentData.filter(equipment => {
      // Assign default category if not present (for backward compatibility)
      const equipmentCategory = equipment.category || 'Heavy Equipment';
      
      // Basic search matching
      const matchesSearch = 
        (equipment.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (equipment.type?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (equipment.location?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (equipment.id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (equipment.nec_code?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (equipment.csi_code?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category and status filtering  
      const matchesCategory = activeCategory === 'All' || equipmentCategory === activeCategory;
      const matchesStatus = activeStatus === 'All' || equipment.status === activeStatus;
      
      // Advanced filtering
      const matchesLocation = advancedFilters.location === 'All' || 
                            equipment.location === advancedFilters.location;
      
      const matchesNecCode = !advancedFilters.necCode || 
                            (equipment.nec_code && 
                            equipment.nec_code.toLowerCase().includes(advancedFilters.necCode.toLowerCase()));
      
      const matchesCsiCode = !advancedFilters.csiCode || 
                            (equipment.csi_code && 
                            equipment.csi_code.toLowerCase().includes(advancedFilters.csiCode.toLowerCase()));
      
      // Maintenance status filtering
      let matchesMaintenance = true;
      if (advancedFilters.maintenanceStatus !== 'All' && equipment.nextMaintenance) {
        const today = new Date();
        const nextMaintDate = new Date(equipment.nextMaintenance);
        const daysUntilMaintenance = Math.floor((nextMaintDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        if (advancedFilters.maintenanceStatus === 'Due Soon') {
          matchesMaintenance = daysUntilMaintenance > 0 && daysUntilMaintenance <= 30;
        } else if (advancedFilters.maintenanceStatus === 'Overdue') {
          matchesMaintenance = daysUntilMaintenance < 0;
        } else if (advancedFilters.maintenanceStatus === 'Up to Date') {
          matchesMaintenance = daysUntilMaintenance > 30;
        }
      }
      
      // Cost range filtering
      const minCost = advancedFilters.minCost ? parseFloat(advancedFilters.minCost) : 0;
      const maxCost = advancedFilters.maxCost ? parseFloat(advancedFilters.maxCost) : Infinity;
      const matchesCost = equipment.cost ? (equipment.cost >= minCost && equipment.cost <= maxCost) : true;
      
      return matchesSearch && 
            matchesCategory && 
            matchesStatus && 
            matchesLocation && 
            matchesNecCode && 
            matchesCsiCode && 
            matchesMaintenance &&
            matchesCost;
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    advancedFilters,
    setAdvancedFilters,
    filterEquipment,
    handleClearFilters
  };
};
